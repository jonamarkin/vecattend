"use client"

import { Phone, Mail, Check, MoreVertical, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Attendee } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AttendeeCardProps {
  attendee: Attendee
  isAttending: boolean
  hasActiveEvent: boolean
  onToggleAttendance: () => void
  onDelete: () => void
  onEdit: () => void
}

const categoryColors: Record<string, string> = {
  regular: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  special: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  patron: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
}

export function AttendeeCard({
  attendee,
  isAttending,
  hasActiveEvent,
  onToggleAttendance,
  onDelete,
  onEdit,
}: AttendeeCardProps) {
  const initials = `${attendee.firstName[0]}${attendee.lastName[0]}`.toUpperCase()

  return (
    <Card
      className={cn("transition-all duration-200 border-border", isAttending && "ring-2 ring-primary/50 bg-primary/5")}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar with attendance toggle */}
          <button
            onClick={hasActiveEvent ? onToggleAttendance : undefined}
            disabled={!hasActiveEvent}
            className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-full font-semibold text-sm transition-all shrink-0",
              isAttending ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              hasActiveEvent && "cursor-pointer hover:scale-105 active:scale-95",
              !hasActiveEvent && "cursor-default opacity-60",
            )}
          >
            {isAttending ? <Check className="w-5 h-5" /> : initials}
          </button>

          {/* Attendee info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">
                {attendee.firstName} {attendee.lastName}
              </h3>
              <Badge variant="outline" className={cn("text-xs capitalize shrink-0", categoryColors[attendee.category])}>
                {attendee.category}
              </Badge>
            </div>

            <div className="space-y-1">
              {attendee.email && (
                <a
                  href={`mailto:${attendee.email}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{attendee.email}</span>
                </a>
              )}
              {attendee.phone && (
                <a
                  href={`tel:${attendee.phone}`}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>{attendee.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Attendance count badge */}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Attended <span className="font-medium text-foreground">{attendee.eventsAttended.length}</span> event
            {attendee.eventsAttended.length !== 1 ? "s" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
