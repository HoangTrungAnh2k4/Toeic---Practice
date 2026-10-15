'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { ScorePoint } from '../types';

const chartConfig = {
    speaking: { label: 'Speaking', color: 'var(--main)' },
    writing: { label: 'Writing', color: 'var(--sub2)' },
} satisfies ChartConfig;

interface ScoreTrendChartProps {
    data: ScorePoint[];
}

/** Điểm qua các bài làm cả đề; Writing nét đứt để không phân biệt chỉ bằng màu. Mỗi bài chỉ có một kỹ năng nên nối qua điểm trống. */
export default function ScoreTrendChart({ data }: ScoreTrendChartProps) {
    const describe = (skill: 'speaking' | 'writing', label: string) => {
        const scores = data.flatMap((point) => (point[skill] === undefined ? [] : [point[skill]]));
        return scores.length ? `${label} từ ${scores[0]} tới ${scores[scores.length - 1]}` : `${label} chưa có bài`;
    };
    const summary = `${describe('speaking', 'Speaking')}, ${describe('writing', 'Writing')} qua ${data.length} bài làm cả đề`;

    return (
        <ChartContainer config={chartConfig} className="w-full h-56" role="img" aria-label={summary}>
            <LineChart accessibilityLayer data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={['dataMin - 10', 'dataMax + 10']} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                    dataKey="speaking"
                    type="monotone"
                    stroke="var(--color-speaking)"
                    connectNulls
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                />
                <Line
                    dataKey="writing"
                    type="monotone"
                    stroke="var(--color-writing)"
                    connectNulls
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                />
            </LineChart>
        </ChartContainer>
    );
}
