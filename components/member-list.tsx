"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { AttendeeCard } from "@/components/member-card";
import type { Attendee, AttendeeCategory, Event } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AttendeeListProps {
  attendees: Attendee[];
  activeEvent: Event | null;
  onToggleAttendance: (attendeeId: string) => void;
  onDeleteAttendee: (id: string) => void;
  onEditAttendee: (attendee: Attendee) => void;
  newlyAddedId?: string | null;
}

type FilterMode = "all" | "attending" | "not-attending";

export function AttendeeList({
  attendees,
  activeEvent,
  onToggleAttendance,
  onDeleteAttendee,
  onEditAttendee,
  newlyAddedId,
}: AttendeeListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<AttendeeCategory[]>(
    []
  );
  const [attendanceFilter, setAttendanceFilter] = useState<FilterMode>("all");

  const filteredAttendees = useMemo(() => {
    return attendees.filter((attendee) => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        attendee.firstname.toLowerCase().includes(searchLower) ||
        attendee.lastname.toLowerCase().includes(searchLower) ||
        attendee.email.toLowerCase().includes(searchLower) ||
        attendee.phone.includes(search);

      // Category filter
      const matchesCategory =
        categoryFilters.length === 0 ||
        categoryFilters.includes(attendee.category);

      // Attendance filter
      let matchesAttendance = true;
      if (activeEvent && attendanceFilter !== "all") {
        const isAttending = attendee.events_attended.includes(activeEvent.id);
        matchesAttendance =
          attendanceFilter === "attending" ? isAttending : !isAttending;
      }

      return matchesSearch && matchesCategory && matchesAttendance;
    });
  }, [attendees, search, categoryFilters, attendanceFilter, activeEvent]);

  const toggleCategory = (category: AttendeeCategory) => {
    setCategoryFilters((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const activeFilterCount =
    categoryFilters.length + (attendanceFilter !== "all" ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search audience..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-card border-border"
          />
        </div> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-11 gap-2 shrink-0 bg-transparent"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Category</DropdownMenuLabel>
            {CATEGORIES.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.value}
                checked={categoryFilters.includes(category.value)}
                onCheckedChange={() => toggleCategory(category.value)}
              >
                {category.label}
              </DropdownMenuCheckboxItem>
            ))}
            {activeEvent && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Attendance</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={attendanceFilter === "all"}
                  onCheckedChange={() => setAttendanceFilter("all")}
                >
                  All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={attendanceFilter === "attending"}
                  onCheckedChange={() => setAttendanceFilter("attending")}
                >
                  Attending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={attendanceFilter === "not-attending"}
                  onCheckedChange={() => setAttendanceFilter("not-attending")}
                >
                  Not Attending
                </DropdownMenuCheckboxItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>
          Showing {filteredAttendees.length} of {attendees.length} audience
        </span>
      </div>

      {/* Attendee grid */}
      {filteredAttendees.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAttendees.map((attendee) => (
            <div
              key={attendee.id}
              className={cn(
                newlyAddedId === attendee.id
                  ? "animate-pulse ring-2 ring-orange-500 rounded-lg"
                  : ""
              )}
            >
              <AttendeeCard
                attendee={attendee}
                isAttending={
                  activeEvent
                    ? attendee.events_attended.includes(activeEvent.id)
                    : false
                }
                hasActiveEvent={!!activeEvent}
                onToggleAttendance={() =>
                  (activeEvent && onToggleAttendance(attendee.id)) || undefined
                }
                onDelete={() => onDeleteAttendee(attendee.id)}
                onEdit={() => onEditAttendee(attendee)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            No audience found
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {search || categoryFilters.length > 0
              ? "Try adjusting your search or filters"
              : "Register your first attendee to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
