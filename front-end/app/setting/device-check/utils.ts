import {
    LuAppWindow,
    LuAudioLines,
    LuBatteryCharging,
    LuBellOff,
    LuCable,
    LuCommand,
    LuFan,
    LuFlagTriangleRight,
    LuHeadphones,
    LuHeadset,
    LuKeyboard,
    LuLanguages,
    LuLock,
    LuMic,
    LuMicOff,
    LuMicVocal,
    LuPenLine,
    LuRuler,
    LuSpellCheck,
    LuVolume2,
} from 'react-icons/lu';
import {
    CheckId,
    CheckStatus,
    CheckStatuses,
    DeviceCheckStep,
    DeviceTip,
    EarSide,
    FeedbackCopy,
    LevelZone,
    MeterRange,
    MicIssue,
    MicStatus,
    NoticeCopy,
    SkillReadiness,
    StepId,
    TypingResult,
    TypingState,
} from './types';

/* ---------------------------------- Bước kiểm tra ---------------------------------- */

/** Thời lượng tối đa của đoạn ghi âm thử. */
export const RECORD_SECONDS = 5;
export const RECORD_MS = RECORD_SECONDS * 1000;

export const STEP_IDS: StepId[] = ['speaker', 'microphone', 'recording', 'keyboard', 'summary'];
export const CHECK_IDS: CheckId[] = ['speaker', 'microphone', 'recording', 'keyboard'];
export const SPEAKING_CHECK_IDS: CheckId[] = ['speaker', 'microphone', 'recording'];
/** Các bước cần giữ micro hoạt động; rời khỏi các bước này micro sẽ được tắt. */
export const MIC_STEP_IDS: StepId[] = ['microphone', 'recording'];

export const DEVICE_CHECK_STEPS: Record<StepId, DeviceCheckStep> = {
    speaker: {
        title: 'Loa & tai nghe',
        description: 'Phát âm thanh thử để chắc chắn bạn nghe rõ đề bài ở cả hai bên tai.',
        Icon: LuHeadphones,
    },
    microphone: {
        title: 'Micro',
        description: 'Cho phép truy cập micro và kiểm tra mức âm lượng khi bạn nói.',
        Icon: LuMic,
    },
    recording: {
        title: 'Ghi âm & nghe lại',
        description: `Thu thử ${RECORD_SECONDS} giây rồi nghe lại để đánh giá độ rõ của giọng nói.`,
        Icon: LuAudioLines,
    },
    keyboard: {
        title: 'Bàn phím & bộ gõ',
        description: 'Gõ lại câu mẫu tiếng Anh để chắc chắn bộ gõ tiếng Việt đã được tắt.',
        Icon: LuKeyboard,
    },
    summary: {
        title: 'Sẵn sàng vào thi',
        description: 'Xem lại kết quả kiểm tra và bắt đầu luyện tập.',
        Icon: LuFlagTriangleRight,
    },
};

export const INITIAL_CHECK_STATUSES: CheckStatuses = {
    speaker: 'pending',
    microphone: 'pending',
    recording: 'pending',
    keyboard: 'pending',
};

export const CHECK_STATUS_LABEL: Record<CheckStatus, string> = {
    pending: 'Chưa kiểm tra',
    passed: 'Đạt',
    failed: 'Chưa đạt',
};

export function isCheckId(id: StepId): id is CheckId {
    return id !== 'summary';
}

export const SKILL_READINESS: SkillReadiness[] = [
    {
        id: 'speaking',
        title: 'TOEIC Speaking',
        checks: SPEAKING_CHECK_IDS,
        href: '/speaking',
        actionLabel: 'Vào luyện Speaking',
        Icon: LuMicVocal,
    },
    {
        id: 'writing',
        title: 'TOEIC Writing',
        checks: ['keyboard'],
        href: '/writing',
        actionLabel: 'Vào luyện Writing',
        Icon: LuPenLine,
    },
];

/* --------------------------------- Loa & tai nghe ---------------------------------- */

export const EAR_SIDES: EarSide[] = ['left', 'right'];

export const EAR_SIDE_LABEL: Record<EarSide, { mark: string; label: string }> = {
    left: { mark: 'L', label: 'Tai trái' },
    right: { mark: 'R', label: 'Tai phải' },
};

/** Hợp âm Đô trưởng (C5 – E5 – G5) phát lần lượt ở từng bên tai. */
export const CHIME_FREQUENCIES = [523.25, 659.25, 783.99];
export const CHIME_NOTE_GAP_S = 0.22;
export const CHIME_NOTE_S = 0.6;
/** Thời gian dành cho mỗi bên tai. */
export const CHIME_SIDE_S = 1.2;
export const CHIME_VOLUME = 0.25;

/* ------------------------------- Micro & thang đo ---------------------------------- */

/** Câu đọc thử khi kiểm tra micro và ghi âm. */
export const SPEAKING_SAMPLE = 'Hello, I am getting ready for my TOEIC Speaking test.';

/** Thang đo dBFS: -60 dB coi như im lặng, 0 dB là mức tối đa trước khi vỡ tiếng. */
export const METER_MIN_DB = -60;
export const METER_DB_PER_SEGMENT = 3;
/** Từ mức này trở lên được coi là giọng nói rõ. */
export const SPEECH_MIN_DB = -36;
/** Từ mức này trở lên dễ bị vỡ tiếng. */
export const LOUD_MIN_DB = -9;
/** Từ mức này trở xuống coi như chưa có âm thanh. */
export const SILENCE_MAX_DB = -50;
/** Tổng thời gian nói rõ cần đạt để xác nhận micro hoạt động. */
export const SPEECH_CONFIRM_MS = 1500;
/** Tốc độ hạ của thang đo (dB/giây) giúp vạch không nhấp nháy. */
export const METER_RELEASE_DB_PER_SECOND = 24;
/** Số cột sóng âm của đoạn ghi thử. */
export const WAVEFORM_BARS = 40;

export const METER_RANGES: MeterRange[] = [
    { zone: 'low', label: 'Nhỏ', fromDb: METER_MIN_DB, segments: 8 },
    { zone: 'good', label: 'Lý tưởng', fromDb: SPEECH_MIN_DB, segments: 9 },
    { zone: 'loud', label: 'Quá lớn', fromDb: LOUD_MIN_DB, segments: 3 },
];

export const LEVEL_ZONE_LABEL: Record<LevelZone, string> = {
    silent: 'Chưa nghe thấy âm thanh',
    low: 'Hơi nhỏ, hãy nói to hơn',
    good: 'Âm lượng tốt',
    loud: 'Quá lớn, dễ vỡ tiếng',
};

export function getLevelZone(db: number): LevelZone {
    if (db >= LOUD_MIN_DB) return 'loud';
    if (db >= SPEECH_MIN_DB) return 'good';
    if (db > SILENCE_MAX_DB) return 'low';
    return 'silent';
}

/** Mức âm lượng hiện tại (RMS, dBFS) của tín hiệu đi qua AnalyserNode. */
export function readLevelDb(analyser: AnalyserNode, samples: Float32Array<ArrayBuffer>): number {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) sum += sample * sample;
    const rms = Math.sqrt(sum / samples.length);
    return rms > 0 ? Math.max(METER_MIN_DB, 20 * Math.log10(rms)) : METER_MIN_DB;
}

/** Chiều cao (%) của một cột sóng âm theo mức dB. */
export function toBarHeight(db: number): number {
    return Math.min(100, Math.max(8, ((db - METER_MIN_DB) / -METER_MIN_DB) * 100));
}

export const MIC_ISSUE_COPY: Record<MicIssue, NoticeCopy> = {
    denied: {
        title: 'Trình duyệt đang chặn micro',
        description: 'Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, chuyển Micro sang “Cho phép” rồi bấm Thử lại.',
    },
    'not-found': {
        title: 'Không tìm thấy micro',
        description: 'Cắm tai nghe có micro hoặc bật micro trong cài đặt âm thanh của máy, sau đó thử lại.',
    },
    busy: {
        title: 'Micro đang được ứng dụng khác sử dụng',
        description: 'Đóng Zoom, Teams, Discord hoặc các tab đang ghi âm, sau đó thử lại.',
    },
    disconnected: {
        title: 'Micro vừa bị ngắt kết nối',
        description: 'Thiết bị thu âm đã bị rút ra hoặc tắt. Kết nối lại rồi bấm Thử lại.',
    },
    insecure: {
        title: 'Cần kết nối bảo mật (HTTPS)',
        description: 'Trình duyệt chỉ cho phép dùng micro trên trang HTTPS hoặc localhost.',
    },
    unsupported: {
        title: 'Trình duyệt chưa hỗ trợ ghi âm',
        description: 'Hãy dùng phiên bản mới của Chrome, Edge, Firefox hoặc Safari.',
    },
    error: {
        title: 'Không thể khởi động micro',
        description: 'Đã xảy ra lỗi không xác định. Hãy thử lại hoặc chọn thiết bị khác.',
    },
};

/** Lỗi không thể khắc phục bằng cách thử lại trên trang này. */
export const PERMANENT_MIC_ISSUES: MicIssue[] = ['insecure', 'unsupported'];

export function isMicIssue(status: MicStatus): status is MicIssue {
    return status !== 'idle' && status !== 'requesting' && status !== 'active';
}

/** Quy đổi lỗi của getUserMedia sang lý do hiển thị cho người dùng. */
export function getMicIssue(error: unknown): MicIssue {
    const name = typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : '';
    switch (name) {
        case 'NotAllowedError':
        case 'SecurityError':
            return 'denied';
        case 'NotFoundError':
        case 'OverconstrainedError':
            return 'not-found';
        case 'NotReadableError':
        case 'AbortError':
            return 'busy';
        default:
            return 'error';
    }
}

export const RECORDER_ERROR_COPY: NoticeCopy = {
    title: 'Không thể ghi âm thử',
    description: 'Trình duyệt chưa hỗ trợ ghi âm hoặc micro vừa bị ngắt. Hãy thử lại, hoặc dùng Chrome/Edge bản mới.',
};

/* -------------------------------- Bàn phím & bộ gõ --------------------------------- */

/** Câu mẫu chứa nhiều tổ hợp mà bộ gõ Telex hay tự chuyển (dd → đ, ee → ê, W → Ư…). */
export const TYPING_SAMPLE = 'Please send the meeting address to our new office by Wednesday.';

/** Dấu thanh, dấu mũ, dấu móc (sau khi tách tổ hợp NFD) và chữ đ/Đ. */
const VIETNAMESE_MARK_PATTERN = /[̀-ͯĐđ]/;

export function hasVietnameseMarks(text: string): boolean {
    return VIETNAMESE_MARK_PATTERN.test(text.normalize('NFD'));
}

/** So khớp phần đã gõ với câu mẫu (không phân biệt hoa thường, gộp khoảng trắng thừa). */
export function evaluateTyping(input: string): TypingResult {
    const typed = input.replace(/\s+/g, ' ').trimStart();
    let matched = 0;
    while (
        matched < typed.length &&
        matched < TYPING_SAMPLE.length &&
        typed[matched].toLowerCase() === TYPING_SAMPLE[matched].toLowerCase()
    ) {
        matched += 1;
    }

    if (!typed) return { state: 'empty', matched };
    if (hasVietnameseMarks(typed)) return { state: 'ime', matched };

    const rest = typed.slice(matched);
    if (matched === TYPING_SAMPLE.length && !rest.trim()) return { state: 'match', matched };
    return { state: rest ? 'mismatch' : 'typing', matched };
}

export const TYPING_STATUS: Record<TypingState, CheckStatus> = {
    empty: 'pending',
    typing: 'pending',
    mismatch: 'pending',
    ime: 'failed',
    match: 'passed',
};

export const TYPING_FEEDBACK: Record<TypingState, FeedbackCopy> = {
    empty: { tone: 'info', message: 'Gõ lại câu mẫu vào ô bên trên, bao gồm cả dấu chấm cuối câu.' },
    typing: { tone: 'info', message: 'Đang khớp với câu mẫu, hãy gõ tiếp đến hết câu.' },
    mismatch: {
        tone: 'warning',
        message: 'Có ký tự chưa khớp (tô đỏ trong câu mẫu). Xóa phần gõ sai rồi gõ lại.',
    },
    ime: {
        tone: 'error',
        message:
            'Phát hiện chữ có dấu tiếng Việt. Hãy tắt Unikey/EVKey hoặc chuyển bộ gõ sang chế độ tiếng Anh, sau đó xóa và gõ lại.',
    },
    match: { tone: 'success', message: 'Chính xác! Bàn phím và bộ gõ đã sẵn sàng cho phần Writing.' },
};

export const PASTE_BLOCKED_FEEDBACK: FeedbackCopy = {
    tone: 'warning',
    message: 'Không thể dán văn bản ở bước này, hãy tự gõ để kiểm tra bàn phím.',
};

/* ------------------------------------ Gợi ý ---------------------------------------- */

export const STEP_TIPS: Record<StepId, DeviceTip[]> = {
    speaker: [
        {
            title: 'Tăng âm lượng hệ thống',
            description: 'Đặt âm lượng khoảng 50–70% và chắc chắn máy không ở chế độ tắt tiếng.',
            Icon: LuVolume2,
        },
        {
            title: 'Chọn đúng thiết bị phát',
            description: 'Trong cài đặt âm thanh của máy, chọn tai nghe làm thiết bị phát mặc định rồi tải lại trang.',
            Icon: LuHeadphones,
        },
        {
            title: 'Kiểm tra dây cắm & Bluetooth',
            description: 'Cắm chặt jack 3.5 mm/USB hoặc kết nối lại Bluetooth. Nếu chỉ nghe một bên, thử tai nghe khác.',
            Icon: LuCable,
        },
    ],
    microphone: [
        {
            title: 'Cho phép quyền micro',
            description: 'Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, chuyển Micro sang “Cho phép” rồi tải lại trang.',
            Icon: LuLock,
        },
        {
            title: 'Kiểm tra nút tắt tiếng',
            description: 'Nhiều tai nghe có công tắc Mute trên dây hoặc thân tai nghe. Hãy chắc chắn micro đang bật.',
            Icon: LuMicOff,
        },
        {
            title: 'Đóng ứng dụng đang dùng micro',
            description: 'Zoom, Teams, Discord… có thể chiếm micro khiến trình duyệt không truy cập được.',
            Icon: LuAppWindow,
        },
    ],
    recording: [
        {
            title: 'Giữ khoảng cách phù hợp',
            description: 'Đặt micro cách miệng khoảng 3–5 cm, hơi lệch sang một bên để tránh tiếng thở.',
            Icon: LuRuler,
        },
        {
            title: 'Giảm tiếng ồn nền',
            description: 'Tắt quạt, điều hòa gần micro hoặc ngồi nơi yên tĩnh để giọng nói được thu rõ.',
            Icon: LuFan,
        },
        {
            title: 'Ưu tiên headset có dây',
            description: 'Headset có dây thường thu giọng ổn định và rõ hơn micro tích hợp của laptop.',
            Icon: LuHeadset,
        },
    ],
    keyboard: [
        {
            title: 'Tắt bộ gõ tiếng Việt',
            description:
                'Với Unikey/EVKey, dùng phím tắt chuyển chế độ (thường là Ctrl + Shift hoặc Alt + Z) cho tới khi biểu tượng hiện chữ E.',
            Icon: LuLanguages,
        },
        {
            title: 'Trên macOS',
            description: 'Chuyển nguồn nhập sang ABC hoặc U.S. bằng Control + Space hoặc phím Globe (fn).',
            Icon: LuCommand,
        },
        {
            title: 'Không có kiểm tra chính tả',
            description: 'Giao diện thi Writing không gợi ý chính tả, hãy luyện gõ chính xác ngay từ đầu.',
            Icon: LuSpellCheck,
        },
    ],
    summary: [
        {
            title: 'Dùng tai nghe khi luyện Speaking',
            description: 'Tránh loa ngoài để micro không thu lại tiếng đề bài, gây vọng âm trong bài nói.',
            Icon: LuHeadset,
        },
        {
            title: 'Tắt thông báo',
            description: 'Bật chế độ Không làm phiền để âm báo không chen vào bài nói của bạn.',
            Icon: LuBellOff,
        },
        {
            title: 'Cắm sạc thiết bị',
            description: 'Bài thi Speaking & Writing kéo dài khoảng 80 phút, hãy đảm bảo máy đủ pin.',
            Icon: LuBatteryCharging,
        },
    ],
};
