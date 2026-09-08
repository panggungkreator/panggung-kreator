"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberStreak } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flame } from "lucide-react";

interface StreakLeaderboardTableProps {
  members: MemberStreak[];
}

export function StreakLeaderboardTable({ members }: StreakLeaderboardTableProps) {

  return (
    <Card className="flex flex-col h-[380px] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2E42] bg-white dark:bg-[#1A1D27] shadow-none">
      <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-bold text-[#111111] dark:text-white flex items-center gap-2">
            Top Members (Streak Terbanyak)
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-[300px] w-full px-5">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E5E7EB] dark:border-[#2A2E42] text-[11px] text-[#374151] dark:text-[#8B8FA8]">
                <TableHead className="w-12 text-center py-2.5 font-semibold">Rank</TableHead>
                <TableHead className="py-2.5 font-semibold">Member</TableHead>
                <TableHead className="py-2.5 text-center font-semibold">Streak</TableHead>
                <TableHead className="py-2.5 text-right font-semibold">Total Hadir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-b border-[#E5E7EB]/60 dark:border-[#2A2E42]/60 hover:bg-[#F8F9FA] dark:hover:bg-zinc-900/20 transition-colors"
                >
                  {/* Rank */}
                  <TableCell className="font-bold text-center py-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${member.rank === 1
                        ? "bg-[#111111] text-white dark:bg-white dark:text-[#111111] font-extrabold"
                        : member.rank === 2
                          ? "bg-[#F2F4F7] dark:bg-zinc-800 text-[#111111] dark:text-zinc-200 font-bold"
                          : member.rank === 3
                            ? "bg-[#F2F4F7] dark:bg-zinc-800 text-[#6B7280] dark:text-zinc-400 font-semibold"
                            : "text-[#9CA3AF] font-medium"
                        }`}
                    >
                      {member.rank}
                    </span>
                  </TableCell>

                  {/* Member Name + Avatar */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8 border border-zinc-200 dark:border-zinc-700">
                        <AvatarImage src={member.avatarUrl || ""} />
                        <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold">
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                          {member.name}
                        </p>
                        {member.email && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {member.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Streak */}
                  <TableCell className="text-center py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F2F4F7] dark:bg-zinc-800 text-[#111111] dark:text-zinc-100 text-xs font-bold font-mono tabular-nums">
                      <Flame className="w-3.5 h-3.5 text-[#111111] dark:text-white" />
                      {member.streak}x
                    </span>
                  </TableCell>

                  {/* Total Attendance */}
                  <TableCell className="text-right font-mono font-semibold text-xs text-[#111111] dark:text-white tabular-nums py-3">
                    {member.totalAttendance} sesi
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
