'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { equityData } from '@/lib/mock-data';

const chartConfig = {
  value: {
    label: "Value",
    color: "#22c55e", // emerald-500
  },
};

export const EquityChart = () => {
  return (
    <Card className="glass rounded-xl border-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-zinc-800 pb-4">
        <CardTitle className="text-lg">Portfolio Equity</CardTitle>
        <CardDescription>
          Total portfolio value over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={equityData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeOpacity={0.2} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
              tickFormatter={(value) => `$${value/1000}k`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel hideIndicator />}
            />
            <Area
              dataKey="value"
              type="monotone"
              fill="url(#fillGradient)"
              fillOpacity={0.4}
              stroke="var(--color-value)"
            />
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};