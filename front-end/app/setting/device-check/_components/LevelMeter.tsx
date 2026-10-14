'use client';

import { LuAudioLines } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useInputLevel } from '../_lib/useInputLevel';
import { LevelZone } from '../types';
import { getLevelZone, LEVEL_ZONE_LABEL, METER_DB_PER_SEGMENT, METER_MIN_DB, METER_RANGES } from '../utils';

/** Màu vạch theo vùng, đồng bộ với thang âm lượng trong phòng thi Speaking. */
const SEGMENT_CLASS: Record<LevelZone, string> = {
    silent: 'bg-sub2',
    low: 'bg-sub2',
    good: 'bg-main',
    loud: 'bg-sub3',
};

const ZONE_BADGE_CLASS: Record<LevelZone, string> = {
    silent: 'bg-white text-subText',
    low: 'bg-sub2/20 text-main',
    good: 'bg-main text-white',
    loud: 'bg-sub3 text-main',
};

interface LevelMeterProps {
    analyser: AnalyserNode | null;
    onSpeech?: () => void;
}

export default function LevelMeter({ analyser, onSpeech }: LevelMeterProps) {
    const level = useInputLevel(analyser, onSpeech);
    const zone = getLevelZone(level);

    return (
        <div className="flex flex-col gap-3 bg-sub1/40 p-4 rounded-xl">
            <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="flex items-center gap-2 font-semibold text-main text-sm">
                    <LuAudioLines className="size-4 text-sub2" aria-hidden="true" />
                    Mức âm lượng đầu vào
                </span>
                <span className="flex items-center gap-2">
                    <span
                        className={cn(
                            'px-2 py-0.5 rounded-full font-semibold text-xs transition-colors',
                            ZONE_BADGE_CLASS[zone],
                        )}
                    >
                        {LEVEL_ZONE_LABEL[zone]}
                    </span>
                    <span className="w-14 font-mono tabular-nums text-subText text-xs text-right">{level} dB</span>
                </span>
            </div>

            <div
                role="meter"
                aria-label="Âm lượng micro"
                aria-valuemin={METER_MIN_DB}
                aria-valuemax={0}
                aria-valuenow={level}
                aria-valuetext={`${level} dB, ${LEVEL_ZONE_LABEL[zone]}`}
                className="flex gap-1"
            >
                {METER_RANGES.map((range) => (
                    // Độ rộng mỗi vùng tỉ lệ với số vạch của nó
                    <div
                        key={range.zone}
                        className="flex flex-col gap-1.5 basis-0"
                        style={{ flexGrow: range.segments }}
                    >
                        <div className="flex gap-1 h-6">
                            {Array.from({ length: range.segments }, (_, index) => (
                                <span
                                    key={index}
                                    className={cn(
                                        'flex-1 rounded-sm transition-colors duration-75',
                                        level > range.fromDb + index * METER_DB_PER_SEGMENT
                                            ? SEGMENT_CLASS[range.zone]
                                            : 'bg-white',
                                    )}
                                />
                            ))}
                        </div>
                        <span
                            className={cn(
                                'font-medium text-xs truncate',
                                range.zone === 'good' ? 'text-main' : 'text-subText',
                            )}
                        >
                            {range.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
