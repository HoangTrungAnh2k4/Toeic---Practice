import Link from 'next/link';
import { LuBadgeCheck, LuClock3, LuEye, LuInbox, LuPlus, LuSearchX, LuTrash2 } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { SKILL_STYLE, SOURCE_LABEL, STATUS_STYLE } from '../_lib/examStyle';
import { ExamLibraryItem } from '../types';
import { buildTestHref } from '@/lib/exam-library/search-params';
import { formatCount } from '../utils';

interface ExamLibraryTableProps {
    exams: ExamLibraryItem[];
    totalCount: number;
    onDelete: (exam: ExamLibraryItem) => void;
    onResetFilters: () => void;
}

const COLUMNS = ['Đề thi & Mã đề', 'Kỹ năng', 'Nguồn dữ liệu', 'Lượt thi', 'Trạng thái'];

const ICON_ACTION_CLASS =
    'inline-flex justify-center items-center bg-white border border-sub2/30 rounded-lg size-8 text-main transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function EmptyRow({ isLibraryEmpty, onResetFilters }: { isLibraryEmpty: boolean; onResetFilters: () => void }) {
    const Icon = isLibraryEmpty ? LuInbox : LuSearchX;

    return (
        <TableRow className="hover:bg-transparent">
            <TableCell colSpan={COLUMNS.length + 1} className="py-12">
                <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                        <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <p className="font-semibold text-main text-sm">
                        {isLibraryEmpty ? 'Kho đề đang trống' : 'Không tìm thấy đề thi phù hợp'}
                    </p>
                    <p className="text-subText text-xs whitespace-normal">
                        {isLibraryEmpty
                            ? 'Chưa có đề nào được thêm vào kho.'
                            : 'Thử từ khóa khác hoặc bỏ bớt bộ lọc trạng thái, nguồn dữ liệu.'}
                    </p>
                    {isLibraryEmpty ? (
                        <Link
                            href="/setting/exam-management/new"
                            className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-2 mt-2 text-xs')}
                        >
                            Tạo đề
                        </Link>
                    ) : (
                        <Button
                            type="button"
                            variant="third"
                            size="sm"
                            onClick={onResetFilters}
                            className="bg-white mt-2 font-medium"
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}

export default function ExamLibraryTable({ exams, totalCount, onDelete, onResetFilters }: ExamLibraryTableProps) {
    return (
        <div className="flex flex-col bg-white shadow-sm border border-sub2/30 rounded-xl overflow-hidden">
            <Table>
                <TableHeader className="bg-main">
                    <TableRow className="hover:bg-main border-sub2/30">
                        {COLUMNS.map((column) => (
                            <TableHead
                                key={column}
                                className="px-3 first:pl-5 h-11 font-bold text-white text-xs uppercase tracking-wider"
                            >
                                {column}
                            </TableHead>
                        ))}
                        <TableHead className="px-3 pr-5 h-11 font-bold text-white text-xs text-right uppercase tracking-wider">
                            Thao tác
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="text-xs">
                    {exams.length === 0 ? (
                        <EmptyRow isLibraryEmpty={totalCount === 0} onResetFilters={onResetFilters} />
                    ) : (
                        exams.map((exam) => {
                            const skill = SKILL_STYLE[exam.skill];
                            const status = STATUS_STYLE[exam.status];

                            return (
                                <TableRow key={exam.id} className="hover:bg-sub1/50 border-sub2/20 transition-colors">
                                    <TableCell className="py-4 pr-3 pl-5 min-w-72 whitespace-normal">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    'flex justify-center items-center rounded-lg size-10 shrink-0',
                                                    skill.className,
                                                )}
                                            >
                                                <skill.Icon className="size-5" aria-hidden="true" />
                                            </span>
                                            <div className="flex flex-col gap-0.5 min-w-0">
                                                <span className="font-semibold text-main text-sm">{exam.title}</span>
                                                <span className="text-subText">
                                                    <span className="font-mono font-semibold text-sub2">{exam.code}</span>
                                                    {' · '}
                                                    Ấn bản {exam.edition}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit font-semibold',
                                                    skill.className,
                                                )}
                                            >
                                                {skill.label}
                                            </span>
                                            <span className="tabular-nums text-subText">
                                                {exam.questionCount} câu · {exam.durationMin} phút
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 py-4 min-w-48 whitespace-normal">
                                        <div className="flex items-start gap-2">
                                            {exam.is_verified ? (
                                                <LuBadgeCheck className="mt-0.5 size-4 text-success shrink-0" aria-hidden="true" />
                                            ) : (
                                                <LuClock3 className="mt-0.5 size-4 text-sub3 shrink-0" aria-hidden="true" />
                                            )}
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-main">{SOURCE_LABEL[exam.source]}</span>
                                                <span className="text-subText">
                                                    {exam.review_note ?? (exam.is_verified ? 'Đã thẩm định' : 'Chưa thẩm định')}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold tabular-nums text-main">
                                                {formatCount(exam.stats?.attempt_count ?? 0)} lượt
                                            </span>
                                            <span className="tabular-nums text-subText">
                                                {exam.stats
                                                    ? `${formatCount(exam.stats.completion_rate)}% hoàn thành`
                                                    : 'Chưa mở công khai'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-3 py-4">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap',
                                                status.className,
                                            )}
                                        >
                                            <span className={cn('rounded-full size-1.5', status.dotClassName)} aria-hidden="true" />
                                            {status.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 pr-5 pl-3 text-right">
                                        <div className="flex justify-end items-center gap-1.5">
                                            <Link
                                                href={buildTestHref(exam.skill, exam.id)}
                                                aria-label={`Xem trước phòng thi ${exam.title}`}
                                                title="Xem trước phòng thi"
                                                className={cn(ICON_ACTION_CLASS, 'hover:bg-sub1')}
                                            >
                                                <LuEye className="size-4" aria-hidden="true" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(exam)}
                                                aria-label={`Xóa ${exam.title}`}
                                                title="Xóa đề thi"
                                                className={cn(
                                                    ICON_ACTION_CLASS,
                                                    'border-destructive/30 text-destructive hover:bg-destructive hover:text-white',
                                                )}
                                            >
                                                <LuTrash2 className="size-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            <div className="flex justify-between items-center gap-3 bg-sub1/30 px-5 py-3 border-sub2/20 border-t font-medium text-subText text-xs">
                <span>
                    Hiển thị <strong className="font-semibold text-main">{exams.length}</strong> trên tổng số{' '}
                    <strong className="font-semibold text-main">{totalCount}</strong> đề thi
                </span>
            </div>
        </div>
    );
}
