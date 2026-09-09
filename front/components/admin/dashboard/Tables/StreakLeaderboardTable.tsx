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
    <Card className="rounded-3xl border border-border-default/70 bg-bg-card shadow-xs flex flex-col h-[340px] sm:h-[380px]">
      <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
            Top Members (Streak Terbanyak)
          </CardTitle>
        </div>
        <span className="text-[10px] font-mono font-bold text-text-muted px-2 py-0.5 rounded-full bg-bg-well border border-border-default">
          {members.length} Member
        </span>
      </CardHeader>

      <CardContent className="p-0 flex-1 min-h-0">
        {/* Desktop Table View (md:block) */}
        <div className="hidden md:block">
          <ScrollArea className="h-[280px] sm:h-[300px] w-full px-5">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border-default text-[11px] text-text-muted">
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
                    className="border-b border-border-default/50 hover:bg-bg-well/40 transition-colors"
                  >
                    {/* Rank */}
                    <TableCell className="font-bold text-center py-3">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          member.rank === 1
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-extrabold shadow-2xs"
                            : member.rank === 2
                            ? "bg-bg-well text-text-primary font-bold border border-border-default"
                            : member.rank === 3
                            ? "bg-bg-well text-text-secondary font-semibold border border-border-default"
                            : "text-text-muted font-medium"
                        }`}
                      >
                        {member.rank}
                      </span>
                    </TableCell>

                    {/* Member Name + Avatar */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8 border border-border-default">
                          <AvatarImage src={member.avatarUrl || ""} />
                          <AvatarFallback className="bg-bg-well text-text-primary text-xs font-bold">
                            {member.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-text-primary leading-tight">
                            {member.name}
                          </p>
                          {member.email && (
                            <p className="text-[10px] text-text-muted">
                              {member.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Streak */}
                    <TableCell className="text-center py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-bg-well text-text-primary text-xs font-bold font-mono tabular-nums border border-border-default/60">
                        <Flame className="w-3.5 h-3.5 text-text-primary" />
                        {member.streak}x
                      </span>
                    </TableCell>

                    {/* Total Attendance */}
                    <TableCell className="text-right font-mono font-semibold text-xs text-text-primary tabular-nums py-3">
                      {member.totalAttendance} sesi
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Mobile Cards View (md:hidden) as per admin-mobile.md */}
        <div className="md:hidden">
          <ScrollArea className="h-[270px] w-full px-4">
            <div className="space-y-2 pb-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl p-3 border border-border-default/70 bg-bg-well/30 active:scale-[0.99] transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                        member.rank === 1
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-extrabold shadow-2xs"
                          : member.rank === 2
                          ? "bg-bg-well text-text-primary font-bold border border-border-default"
                          : member.rank === 3
                          ? "bg-bg-well text-text-secondary font-semibold border border-border-default"
                          : "text-text-muted font-medium"
                      }`}
                    >
                      {member.rank}
                    </span>

                    <Avatar className="w-8 h-8 border border-border-default shrink-0">
                      <AvatarImage src={member.avatarUrl || ""} />
                      <AvatarFallback className="bg-bg-well text-text-primary text-xs font-bold">
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-text-muted truncate">
                        {member.email || member.tier || "Member"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg-card border border-border-default/70 text-text-primary text-xs font-bold font-mono shadow-2xs">
                      <Flame className="w-3.5 h-3.5 text-text-primary" />
                      {member.streak}x
                    </span>
                    <span className="text-[11px] font-mono text-text-secondary font-semibold">
                      {member.totalAttendance}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
