import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { listMistakePatterns } from '@/lib/data/mistake-patterns';
import type { Database } from '@/lib/database.types';
import { PART_TEMPLATES } from '@/lib/domain/parts';
import type { MistakePattern, RequiredKeyword } from '@/lib/domain/types';
import { ProviderQuotaError } from '@/lib/scoring/errors';
import { scoringQuota } from '@/lib/scoring/quota';
import { SCORE_ERROR_MESSAGE, SCORING_STALE_MS, summarizeWriting, type ScoreError } from '@/lib/scoring/scale';
import { scoreWriting, writingPatternsFor, type WritingOutcome, type WritingQuestion } from '@/lib/scoring/writing';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { createServerSupabase } from '@/lib/supabase-server';

// Chấm song song cả Part; mỗi lượt gọi LLM tối đa 20s/model
export const maxDuration = 60;

/** Bài luận Q8 ~300–500 từ; chặn bài dài bất thường để khỏi tốn token. */
const MAX_ANSWER_CHARS = 8000;
const WRITING_PART_IDS = PART_TEMPLATES.filter((part) => part.skill === 'writing').map((part) => part.id);

const userBody = z.object({ attemptId: z.uuid() });
/** Khách không có attempt trên DB: gửi kèm bài viết các câu cần chấm. */
const guestBody = z.object({
    examId: z.uuid(),
    partTemplateId: z.number().int(),
    answers: z
        .array(z.object({ questionId: z.uuid(), text: z.string().max(MAX_ANSWER_CHARS) }))
        .min(1)
        .max(5),
});

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** Lỗi nặng nhất trong các câu, để báo một lý do cho cả bài. */
const firstError = (outcomes: WritingOutcome[]) =>
    (['daily_limit', 'provider_limit', 'scoring_failed'] as const).find((error) =>
        outcomes.some((outcome) => 'error' in outcome && outcome.error === error),
    ) ?? null;
const statusOf = (error: ScoreError | null) => (error === null ? 200 : error === 'scoring_failed' ? 502 : 429);

/** Câu của một Part kèm text đề. Client mang phiên: RLS chỉ trả đề đã phát hành (hoặc đề nháp với admin). */
async function loadQuestions(supabase: SupabaseClient<Database>, examId: string, partTemplateId: number) {
    const { data, error } = await supabase
        .from('questions')
        .select('id, number, prompt, stimulus, image_alt, keywords, exam_parts!inner(exam_id, part_template_id, context)')
        .eq('exam_parts.exam_id', examId)
        .eq('exam_parts.part_template_id', partTemplateId)
        .order('number');
    if (error) throw error;
    return data.map((question) => ({
        id: question.id,
        number: question.number,
        prompt: question.prompt,
        stimulus: question.stimulus ?? question.exam_parts.context,
        imageAlt: question.image_alt,
        keywords: question.keywords as RequiredKeyword[] | null,
    }));
}

/** Chấm song song; câu bỏ trống không gọi LLM nên không trừ lượt, chấm lỗi thì hoàn lượt. */
function scoreAll(
    questions: (WritingQuestion & { id: string })[],
    answers: Map<string, string>,
    patterns: MistakePattern[],
    quota: ReturnType<typeof scoringQuota>,
): Promise<WritingOutcome[]> {
    return Promise.all(
        questions.map(async (question): Promise<WritingOutcome> => {
            const answer = answers.get(question.id) ?? '';
            if (answer.trim() && !(await quota.consume())) return { questionId: question.id, error: 'daily_limit' };
            try {
                return { questionId: question.id, result: await scoreWriting(question, answer, patterns) };
            } catch (error) {
                if (answer.trim()) await quota.refund();
                if (error instanceof ProviderQuotaError) return { questionId: question.id, error: 'provider_limit' };
                console.error('Writing scoring failed', error);
                return { questionId: question.id, error: 'scoring_failed' };
            }
        }),
    );
}

/**
 * Chấm một Part Writing đã nộp.
 * Người đăng nhập: chiếm attempt `submitted → scoring`, chấm các câu chưa có điểm, ghi `responses`, `annotations`,
 * `attempts` bằng service_role. Khách: chỉ trả kết quả từng câu, client lưu localStorage và tự tổng kết.
 */
export async function POST(request: Request) {
    const json: unknown = await request.json().catch(() => null);
    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getClaims();
    const userId = auth?.claims.sub ?? null;
    const quota = scoringQuota(request, userId);

    if (!userId) {
        const body = guestBody.safeParse(json);
        if (!body.success || !WRITING_PART_IDS.includes(body.data.partTemplateId)) return fail('invalid_body', 400);
        const { examId, partTemplateId, answers } = body.data;

        const loaded = await Promise.all([
            loadQuestions(supabase, examId, partTemplateId),
            listMistakePatterns(),
        ]).catch(() => null);
        if (!loaded) return fail('server_error', 500);
        const [questions, patterns] = loaded;
        const asked = questions.filter((question) => answers.some((answer) => answer.questionId === question.id));
        if (asked.length !== answers.length) return fail('question_not_found', 404);

        const texts = new Map(answers.map((answer) => [answer.questionId, answer.text]));
        const outcomes = await scoreAll(asked, texts, writingPatternsFor(patterns, partTemplateId), quota).catch(() => null);
        if (!outcomes) return fail('server_error', 500);
        return NextResponse.json({ outcomes }, { status: statusOf(firstError(outcomes)) });
    }

    const body = userBody.safeParse(json);
    if (!body.success) return fail('invalid_body', 400);
    const { attemptId } = body.data;
    const admin = createAdminSupabase();

    // Chiếm lượt chấm có điều kiện trên status: hai request cùng lúc thì chỉ một request chấm
    const staleBefore = new Date(Date.now() - SCORING_STALE_MS).toISOString();
    const { data: attempt, error: claimError } = await admin
        .from('attempts')
        .update({ status: 'scoring', scoring_started_at: new Date().toISOString() })
        .eq('id', attemptId)
        .eq('user_id', userId)
        .in('part_template_id', WRITING_PART_IDS)
        .or(`status.eq.submitted,and(status.eq.scoring,scoring_started_at.lt.${staleBefore})`)
        .select('exam_id, part_template_id')
        .maybeSingle();
    if (claimError) return fail('server_error', 500);
    if (!attempt?.part_template_id) return fail('attempt_not_scorable', 409);

    const release = (scoringError: string) =>
        admin.from('attempts').update({ status: 'submitted', scoring_error: scoringError }).eq('id', attemptId);

    try {
        const [questions, responses, patterns] = await Promise.all([
            loadQuestions(supabase, attempt.exam_id, attempt.part_template_id),
            admin.from('responses').select('question_id, text_answer, score, feedback').eq('attempt_id', attemptId),
            listMistakePatterns(),
        ]);
        if (responses.error) throw responses.error;
        if (questions.length === 0) {
            await release('Không tìm thấy câu hỏi của đề.');
            return fail('question_not_found', 404);
        }

        // Chấm lại chỉ chấm câu chưa có điểm
        const scored = responses.data.filter((response) => response.score !== null);
        const pending = questions.filter((question) => !scored.some((response) => response.question_id === question.id));
        const answers = new Map(responses.data.map((response) => [response.question_id, response.text_answer ?? '']));
        const outcomes = await scoreAll(pending, answers, writingPatternsFor(patterns, attempt.part_template_id), quota);
        const results = outcomes.flatMap((outcome) => ('result' in outcome ? [outcome] : []));

        if (results.length > 0) {
            const { data: saved, error } = await admin
                .from('responses')
                .upsert(
                    results.map(({ questionId, result }) => ({
                        attempt_id: attemptId,
                        question_id: questionId,
                        score: result.score,
                        max_score: result.max_score,
                        feedback: result.feedback,
                        metrics: result.metrics,
                        scoring_model: result.scoring_model,
                    })),
                    { onConflict: 'attempt_id,question_id' },
                )
                .select('id, question_id');
            if (error) throw error;

            const removed = await admin
                .from('annotations')
                .delete()
                .in(
                    'response_id',
                    saved.map((response) => response.id),
                );
            if (removed.error) throw removed.error;
            const annotations = results.flatMap(({ questionId, result }) => {
                const responseId = saved.find((response) => response.question_id === questionId)?.id;
                if (!responseId) return [];
                return result.annotations.map(
                    ({ quote, correction, explanation, criterion, severity, mistake_pattern_id, start_offset, end_offset }) => ({
                        response_id: responseId,
                        quote,
                        correction,
                        explanation,
                        criterion,
                        severity,
                        mistake_pattern_id,
                        start_offset,
                        end_offset,
                    }),
                );
            });
            if (annotations.length > 0) {
                const inserted = await admin.from('annotations').insert(annotations);
                if (inserted.error) throw inserted.error;
            }
        }

        const error = firstError(outcomes);
        if (error) {
            await release(SCORE_ERROR_MESSAGE[error]);
            return NextResponse.json(
                { status: 'submitted', scoringError: SCORE_ERROR_MESSAGE[error] },
                { status: statusOf(error) },
            );
        }

        const summary = summarizeWriting(questions, [
            ...scored,
            ...results.map(({ questionId, result }) => ({ question_id: questionId, ...result })),
        ]);
        const { error: updateError } = await admin
            .from('attempts')
            .update({
                status: 'scored',
                scored_at: new Date().toISOString(),
                score: summary.score,
                feedback_summary: summary.feedbackSummary,
                scoring_error: null,
            })
            .eq('id', attemptId);
        if (updateError) throw updateError;
        return NextResponse.json({ status: 'scored', score: summary.score });
    } catch (error) {
        console.error('Writing scoring failed', error);
        await release(SCORE_ERROR_MESSAGE.scoring_failed);
        return fail('server_error', 500);
    }
}
