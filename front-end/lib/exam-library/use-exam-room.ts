'use client';

import { useEffect, useState } from 'react';
import type { Skill } from '@/lib/domain/types';
import { type ExamRoom, getExamRoom } from './room';

/**
 * Tải phòng thi bằng phiên trình duyệt, dùng khi server (không có phiên) không thấy đề.
 * RLS cho admin đã đăng nhập đọc đề chưa phát hành; học viên vẫn chỉ thấy đề `published`.
 * `undefined` khi đang tải, `null` khi không có đề.
 */
export function useExamRoom(skill: Skill, examId: string) {
    const [room, setRoom] = useState<ExamRoom | null | undefined>(undefined);

    useEffect(() => {
        getExamRoom(skill, examId).then(setRoom, () => setRoom(null));
    }, [skill, examId]);

    return room;
}
