"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventAttendance } from "../types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CalendarDays, Users } from "lucide-react";

interface EventAttendanceChartProps {
  attendances: EventAttendance[];
}

export function EventAttendanceChart({ attendances }: EventAttendanceChartProps) {
  const totalAttendeeSum = attendances.reduce((acc, curr) => acc + curr.attendees, 0);
  const avgAttendance = attendances.length > 0 ? Math.round(totalAttendeeSum / attendances.length) : 0;

  return (
    <Card className="rounded-3xl border border-border-default/70 bg-bg-card shadow-xs flex flex-col h-[340px] sm:h-[380px]">
      <CardHeader className="p-4 sm:p-5 pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-text-muted" />
            Statistik Kehadiran per Event
          </CardTitle>
          <p className="text-xs text-text-muted mt-0.5">
            Rata-rata: <span className="font-semibold text-text-primary">{avgAttendance} peserta</span> per event
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BAFF6A]" />
            <span className="hidden sm:inline">Hadir </span>Terverifikasi
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-2 flex-1 w-full min-h-0">
        <div className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={attendances}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BAFF6A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#BAFF6A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as EventAttendance;
                    return (
                      <div className="bg-[#111111] text-white p-3 rounded-xl text-xs shadow-2xl border border-zinc-800 space-y-1">
                        <p className="font-bold text-sm text-[#BAFF6A]">{data.title}</p>
                        <p className="text-[11px] text-zinc-300 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {data.fullDate}
                        </p>
                        <p className="font-semibold text-white pt-1 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#BAFF6A]" />
                          {data.attendees} Member Hadir
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="attendees"
                stroke="#111111"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#attendanceGradient)"
                activeDot={{ r: 6, fill: "#BAFF6A", stroke: "#111111", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
