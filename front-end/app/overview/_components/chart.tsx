'use client';

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { PART_TEMPLATES } from '@/lib/domain/parts';
import type { UserPartStats } from '@/lib/domain/types';

const chartConfig = {
    count: { label: 'Lượt' },
    speaking: { label: 'Speaking', color: 'var(--main)' },
    writing: { label: 'Writing', color: 'var(--sub2)' },
} satisfies ChartConfig;

interface ChartProps {
    parts: UserPartStats[];
}

/** Số lượt đã nộp theo Part (lượt làm cả đề tính cho mọi Part của kỹ năng). */
export function Chart({ parts }: ChartProps) {
    const countOf = new Map(parts.map((item) => [item.part_template_id, item.attempt_count]));
    const data = PART_TEMPLATES.map((template) => ({
        part: `${template.skill === 'speaking' ? 'Speaking' : 'Writing'} P${template.part_no}`,
        skill: template.skill,
        count: countOf.get(template.id) ?? 0,
    }));
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card className="lg:w-2/5">
            <CardHeader>
                <CardTitle className="font-medium text-lg">Thống kê số lượt làm bài</CardTitle>
                <CardDescription>Lượt đã nộp theo từng Part</CardDescription>
            </CardHeader>
            <CardContent>
                {total === 0 ? (
                    <p className="bg-sub1/40 p-4 rounded-lg font-medium text-subText text-sm">
                        Chưa có lượt nộp bài nào. Số lượt theo Part sẽ hiện tại đây.
                    </p>
                ) : (
                    <ChartContainer config={chartConfig} className="w-full h-72">
                        <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 0, right: 40 }}>
                            <XAxis type="number" dataKey="count" hide allowDecimals={false} />
                            <YAxis
                                dataKey="part"
                                type="category"
                                width={96}
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tick={{ fill: 'var(--main)', fontSize: 13, fontWeight: 500 }}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="count" radius={5} barSize={24}>
                                {data.map((item) => (
                                    <Cell key={item.part} fill={`var(--color-${item.skill})`} />
                                ))}
                                <LabelList
                                    dataKey="count"
                                    position="right"
                                    offset={8}
                                    className="fill-foreground"
                                    fontSize={12}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
