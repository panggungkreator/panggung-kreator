"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DemographicsMetric } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Briefcase, MapPin, PieChart as PieIcon, Target } from "lucide-react";

interface DemographicsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DemographicsMetric;
}

export function DemographicsModal({ open, onOpenChange, data }: DemographicsModalProps) {
  const careerColors = ["#111111", "#BAFF6A", "#D1D5DB"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] sm:max-h-[85vh] p-4 sm:p-6 overflow-y-auto rounded-none sm:rounded-3xl border-0 sm:border border-border-default/80 bg-bg-card text-text-primary">
        <DialogHeader className="border-b border-border-default/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-bg-well border border-border-default text-text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-text-primary">
                Data Demografi Peserta & Member
              </DialogTitle>
              <DialogDescription className="text-xs text-text-secondary mt-0.5">
                {data.summary || "Rincian sebaran usia, visi karier, profesi, dan domisili member dari database."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-2">
          {/* 1. Rentang Usia */}
          <div className="p-4 rounded-2xl border border-border-default/70 bg-bg-well/20 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <PieIcon className="w-4 h-4 text-text-primary" />
              <h3 className="text-sm font-bold text-text-primary">
                Distribusi Rentang Usia
              </h3>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#111111] text-white p-2 rounded-lg text-xs shadow-lg border border-zinc-800">
                            <span className="font-bold text-[#BAFF6A]">{payload[0].payload.range} tahun</span>: {payload[0].value} member ({payload[0].payload.percentage}%)
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#111111" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Visi & Orientasi Karier Member */}
          <div className="p-4 rounded-2xl border border-border-default/70 bg-bg-well/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-text-primary" />
                <h3 className="text-sm font-bold text-text-primary">
                  Tujuan & Ambisi Ahli (Expertise Goal)
                </h3>
              </div>
              <p className="text-[11px] text-text-muted mb-3">
                Orientasi member dalam membangun karier & personal branding
              </p>
            </div>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#111111] text-white p-2 rounded-lg text-xs shadow-lg border border-zinc-800">
                            <span className="font-bold text-[#BAFF6A]">{payload[0].name}</span>: {payload[0].value} member ({payload[0].payload.percentage}%)
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={data.careerGoalDistribution || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {(data.careerGoalDistribution || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || careerColors[index % careerColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs mt-2">
              {(data.careerGoalDistribution || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        item.color || careerColors[idx % careerColors.length],
                    }}
                  />
                  <span className="text-text-secondary text-[11px] font-medium">
                    {item.name} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Pekerjaan / Status */}
          <div className="p-4 rounded-2xl border border-border-default/70 bg-bg-well/20">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-text-primary" />
              <h3 className="text-sm font-bold text-text-primary">
                Pekerjaan / Latar Belakang
              </h3>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.occupationDistribution}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#111111] text-white p-2 rounded-lg text-xs shadow-lg border border-zinc-800">
                            <span className="font-bold text-[#BAFF6A]">{payload[0].payload.name}</span>: {payload[0].value} member ({payload[0].payload.percentage}%)
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#111111" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Asal Kota / Domisili */}
          <div className="p-4 rounded-2xl border border-border-default/70 bg-bg-well/20 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-text-primary" />
              <h3 className="text-sm font-bold text-text-primary">
                Sebaran Domisili Teratas
              </h3>
            </div>
            <ScrollArea className="h-48 w-full pr-2">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border-default text-[11px] text-text-muted">
                    <TableHead className="py-1.5 px-2 font-semibold">Kota</TableHead>
                    <TableHead className="py-1.5 px-2 text-right font-semibold">Peserta</TableHead>
                    <TableHead className="py-1.5 px-2 text-right font-semibold">Porsi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topCities.map((item, idx) => (
                    <TableRow key={idx} className="border-b border-border-default/40 hover:bg-bg-well/50 text-xs transition-colors">
                      <TableCell className="py-1.5 px-2 font-medium text-text-primary">{item.city}</TableCell>
                      <TableCell className="py-1.5 px-2 text-right font-mono tabular-nums">{item.count}</TableCell>
                      <TableCell className="py-1.5 px-2 text-right text-text-secondary font-mono tabular-nums">
                        {item.percentage}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
