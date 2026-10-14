import type { IconType } from 'react-icons';

/** Các mục kiểm tra thiết bị. */
export type CheckId = 'speaker' | 'microphone' | 'recording' | 'keyboard';

/** Các bước của trình kiểm tra: 4 mục kiểm tra và bước tổng kết. */
export type StepId = CheckId | 'summary';

export type CheckStatus = 'pending' | 'passed' | 'failed';

export type CheckStatuses = Record<CheckId, CheckStatus>;

export type EarSide = 'left' | 'right';

/** Lý do micro không thể khởi động. */
export type MicIssue = 'denied' | 'not-found' | 'busy' | 'disconnected' | 'insecure' | 'unsupported' | 'error';

export type MicStatus = 'idle' | 'requesting' | 'active' | MicIssue;

export type RecorderStatus = 'idle' | 'recording' | 'recorded' | 'error';

export type LevelZone = 'silent' | 'low' | 'good' | 'loud';

export type TypingState = 'empty' | 'typing' | 'mismatch' | 'ime' | 'match';

export type NoticeTone = 'info' | 'success' | 'warning' | 'error';

export interface DeviceCheckStep {
    title: string;
    description: string;
    Icon: IconType;
}

export interface AudioInputDevice {
    id: string;
    label: string;
}

/** Một vùng trên thang đo âm lượng, gồm `segments` vạch, mỗi vạch METER_DB_PER_SEGMENT dB. */
export interface MeterRange {
    zone: LevelZone;
    label: string;
    fromDb: number;
    segments: number;
}

export interface DeviceTip {
    title: string;
    description: string;
    Icon: IconType;
}

export interface NoticeCopy {
    title: string;
    description: string;
}

export interface FeedbackCopy {
    tone: NoticeTone;
    message: string;
}

export interface TypingResult {
    state: TypingState;
    /** Số ký tự đầu của câu mẫu đã gõ khớp. */
    matched: number;
}

export interface SkillReadiness {
    id: 'speaking' | 'writing';
    title: string;
    checks: CheckId[];
    href: string;
    actionLabel: string;
    Icon: IconType;
}
