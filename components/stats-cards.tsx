"use client";

import { Users, UserCheck, CalendarDays, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Attendee, Event } from "@/lib/types";

interface StatsCardsProps {
  attendees: Attendee[];
  events: Event[];
  activeEvent: Event | null;
}

export function StatsCards({
  attendees,
  events,
  activeEvent,
}: StatsCardsProps) {
  const totalAttendees = attendees.length;
  const attendingToday = activeEvent
    ? attendees.filter((a) => a.events_attended.includes(activeEvent.id)).length
    : 0;
  const totalEvents = events.length;
  const attendanceRate =
    totalAttendees > 0 && activeEvent
      ? Math.round((attendingToday / totalAttendees) * 100)
      : 0;

  const stats = [
    {
      label: "Total Audience",
      value: totalAttendees,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Attending Today",
      value: attendingToday,
      icon: UserCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Total Events",
      value: totalEvents,
      icon: CalendarDays,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bgColor}`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
