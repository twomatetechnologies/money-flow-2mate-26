
"use client"

import { createContext, useContext } from "react"
import { 
  Bar, 
  BarChart as RechartsBarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  TooltipProps,
  LineChart,
  Line,
  Legend
} from "recharts"

const ChartContext = createContext<Record<string, { label: string; color: string }>>({})

export function ChartContainer({
  config,
  children,
}: {
  config: Record<string, { label: string; color: string }>
  children: React.ReactNode
}) {
  return (
    <ChartContext.Provider value={config}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </ChartContext.Provider>
  )
}

export function ChartTooltip({ content }: { content: React.ReactNode }) {
  return <Tooltip content={content} />
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  const config = useContext(ChartContext)

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="grid gap-1">
          {payload.map((data) => (
            <div
              key={data.dataKey}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      config[data.dataKey as string]?.color ?? "#888",
                  }}
                />
                <span className="text-xs tabular-nums">
                  {config[data.dataKey as string]?.label ?? data.dataKey}
                </span>
              </div>
              <div className="text-xs tabular-nums">
                {typeof data.value === "number"
                  ? data.value.toLocaleString()
                  : data.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
