'use client';

import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const chartData = [
    { part: 'Writing_Part_1', Value: 214, fill: 'url(#fillWriting)' },
    { part: 'Writing_Part_2', Value: 214, fill: 'url(#fillWriting)' },
    { part: 'Writing_Part_3', Value: 214, fill: 'url(#fillWriting)' },
    { part: 'Speaking_Part_1', Value: 186, fill: 'url(#fillSpeaking)' },
    { part: 'Speaking_Part_2', Value: 305, fill: 'url(#fillSpeaking)' },
    { part: 'Speaking_Part_3', Value: 237, fill: 'url(#fillSpeaking)' },
    { part: 'Speaking_Part_4', Value: 73, fill: 'url(#fillSpeaking)' },
    { part: 'Speaking_Part_5', Value: 209, fill: 'url(#fillSpeaking)' },
];

const chartConfig = {
    Value: {
        label: 'Lượt',
    },
    writing: {
        label: 'Writing',
        color: '#3b3556', // đổi theo theme của bạn
    },
    speaking: {
        label: 'Speaking',
        color: '#e8a33d',
    },
} satisfies ChartConfig;

export function Chart() {
    return (
        <Card className="w-[40%]">
            <CardHeader>
                <CardTitle className="font-medium text-lg">Thống kê số lượt làm bài</CardTitle>
                <CardDescription>Tháng 10 - 2026</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full h-72">
                    <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 60, right: 40 }}>
                        <defs>
                            <linearGradient id="fillWriting" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b3556" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#3b3556" stopOpacity={1} />
                            </linearGradient>
                            <linearGradient id="fillSpeaking" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#e8a33d" stopOpacity={0.6} />
                                <stop offset="100%" stopColor="#e8a33d" stopOpacity={1} />
                            </linearGradient>
                        </defs>

                        <XAxis type="number" dataKey="Value" hide />
                        <YAxis
                            dataKey="part"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tick={{ fill: '#3b3556', fontSize: 13, fontWeight: 500 }}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="Value" radius={5} barSize={28}>
                            <LabelList
                                dataKey="Value"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
