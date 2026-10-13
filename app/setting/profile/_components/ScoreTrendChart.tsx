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

/** Điểm qua các bài thi thử; Writing nét đứt để không phân biệt chỉ bằng màu. */
export default function ScoreTrendChart({ data }: ScoreTrendChartProps) {
    const first = data[0];
    const last = data[data.length - 1];
    const summary =
        first && last
            ? `Speaking từ ${first.speaking} lên ${last.speaking}, Writing từ ${first.writing} lên ${last.writing} qua ${data.length} bài thi thử`
            : 'Chưa có bài thi thử';

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
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                />
                <Line
                    dataKey="writing"
                    type="monotone"
                    stroke="var(--color-writing)"
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                />
            </LineChart>
        </ChartContainer>
    );
}
