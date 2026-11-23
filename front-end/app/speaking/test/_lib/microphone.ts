/** Lý do micro không thể khởi động. */
export type MicIssue = 'denied' | 'not-found' | 'busy' | 'disconnected' | 'insecure' | 'unsupported' | 'error';

export type MicStatus = 'idle' | 'requesting' | 'active' | MicIssue;

export type LevelZone = 'silent' | 'low' | 'good' | 'loud';

export type NoticeTone = 'info' | 'success' | 'warning' | 'error';

export interface AudioInputDevice {
    id: string;
    label: string;
}

export interface NoticeCopy {
    title: string;
    description: string;
}

/** Thang đo dBFS: -60 dB coi như im lặng, 0 dB là mức tối đa trước khi vỡ tiếng. */
export const METER_MIN_DB = -60;
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
