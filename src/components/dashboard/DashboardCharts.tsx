"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { ChartDataPoint } from '@/lib/dashboard/merge-stats'

const brandChartColor = 'var(--primary)'

const sentChartConfig = {
    sent: {
        label: 'Messages sent',
        color: brandChartColor,
    },
} satisfies ChartConfig

const groupsChartConfig = {
    groups: {
        label: 'Groups reached',
        color: brandChartColor,
    },
} satisfies ChartConfig

function formatAxisDate(value: string) {
    const date = new Date(value)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface DashboardChartsProps {
    data: ChartDataPoint[]
}

export function DashboardCharts({ data }: DashboardChartsProps) {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-base">Messages sent</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                    </div>
                    <Select defaultValue="30d">
                        <SelectTrigger className="h-8 w-[130px]" aria-label="Date range">
                            <SelectValue placeholder="Last 30 days" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="px-2 pt-2 sm:px-6">
                    <ChartContainer
                        config={sentChartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="fillSent" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-sent)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-sent)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={formatAxisDate}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            formatAxisDate(String(value))
                                        }
                                        indicator="dot"
                                    />
                                }
                            />
                            <Area
                                dataKey="sent"
                                type="natural"
                                fill="url(#fillSent)"
                                stroke="var(--color-sent)"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-base">Groups reached</CardTitle>
                        <CardDescription>Recipients per day</CardDescription>
                    </div>
                    <Select defaultValue="30d">
                        <SelectTrigger className="h-8 w-[130px]" aria-label="Date range">
                            <SelectValue placeholder="Last 30 days" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="px-2 pt-2 sm:px-6">
                    <ChartContainer
                        config={groupsChartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <BarChart data={data}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={formatAxisDate}
                            />
                            <YAxis tickLine={false} axisLine={false} width={32} />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            formatAxisDate(String(value))
                                        }
                                        indicator="dot"
                                    />
                                }
                            />
                            <Bar
                                dataKey="groups"
                                fill="var(--color-groups)"
                                fillOpacity={0.85}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
