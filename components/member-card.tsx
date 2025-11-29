"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  Check,
  MoreVertical,
  Trash2,
  Edit,
  Star,
  LogIn,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Attendee } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AttendeeCardProps {
  attendee: Attendee;
  isAttending: boolean;
  hasActiveEvent: boolean;
  onToggleAttendance: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onEdit: () => void;
}

const categoryConfig: Record<
  string,
  {
    badgeColor: string;
    label: string;
  }
> = {
  regular: {
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    label: "Regular",
  },
  special: {
    badgeColor: "bg-orange-600 text-white border-orange-600 font-bold",
    label: "Special Guest",
  },
  patron: {
    badgeColor: "bg-red-600 text-white border-red-600 font-bold",
    label: "Patron",
  },
};

export function AttendeeCard({
  attendee,
  isAttending,
  hasActiveEvent,
  onToggleAttendance,
  onDelete,
  onEdit,
}: AttendeeCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const initials =
    `${attendee.firstname[0]}${attendee.lastname[0]}`.toUpperCase();
  const config = categoryConfig[attendee.category];
  const isSpecialGuest =
    attendee.category === "special" || attendee.category === "patron";

  const handleToggleAttendance = async () => {
    setIsLoading(true);
    try {
      await onToggleAttendance();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 border-2 overflow-hidden h-full flex flex-col",
        isAttending &&
          "ring-2 ring-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20",
        isLoading && "opacity-70"
      )}
    >
      <CardContent className="p-3 sm:p-4 flex flex-col h-full">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Star icon for special guests */}
          {isSpecialGuest && (
            <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5">
              <Star
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 fill-current",
                  attendee.category === "special"
                    ? "text-orange-600"
                    : "text-red-600"
                )}
              />
            </div>
          )}

          {/* Large Avatar with attendance toggle - Primary interaction */}
          <button
            onClick={handleToggleAttendance}
            disabled={!hasActiveEvent || isLoading}
            className={cn(
              "relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full font-semibold text-sm sm:text-base transition-all shrink-0 flex-shrink-0",
              isAttending
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                : "bg-muted text-muted-foreground",
              hasActiveEvent &&
                !isLoading &&
                "cursor-pointer hover:scale-110 active:scale-95",
              (!hasActiveEvent || isLoading) && "cursor-default opacity-60"
            )}
            title={
              hasActiveEvent
                ? isAttending
                  ? "Click to uncheck (remove attendance)"
                  : "Click to check in"
                : "Select an event first"
            }
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : isAttending ? (
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              initials
            )}
          </button>

          {/* Attendee info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
              <h3
                className={cn(
                  "font-semibold truncate",
                  isSpecialGuest
                    ? "text-foreground text-base sm:text-lg"
                    : "text-foreground text-sm sm:text-base"
                )}
              >
                {attendee.firstname}
              </h3>
              <Badge
                variant="outline"
                className={cn("text-xs capitalize shrink-0", config.badgeColor)}
              >
                {config.label}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {attendee.lastname}
            </p>

            <div className="space-y-0.5 mt-1 min-h-[2.5rem]">
              {attendee.email && (
                <a
                  href={`mailto:${attendee.email}`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                  title={attendee.email}
                >
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{attendee.email}</span>
                </a>
              )}
              {attendee.phone && (
                <a
                  href={`tel:${attendee.phone}`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">{attendee.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Check-in Button - Always visible */}
          {hasActiveEvent && !isAttending && (
            <Button
              onClick={handleToggleAttendance}
              disabled={isLoading}
              size="sm"
              className="shrink-0 gap-1 bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm disabled:opacity-70 h-10"
              title="Check in"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden xs:inline">
                {isLoading ? "Checking..." : "Check In"}
              </span>
            </Button>
          )}

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                disabled={isLoading}
              >
                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onEdit} disabled={isLoading}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Attendance count badge - Fixed height at bottom */}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Attended{" "}
            <span className="font-medium text-foreground">
              {attendee.events_attended.length}
            </span>{" "}
            event{attendee.events_attended.length !== 1 ? "s" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
