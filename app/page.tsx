"use client";

import { useState, useEffect } from "react";
import { Menu, X, AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventSelector } from "@/components/event-selector";
import { StatsCards } from "@/components/stats-cards";
import { AttendeeList } from "@/components/member-list";
import { AddAttendeeDialog } from "@/components/add-member-dialog";
import { useChoirData } from "@/hooks/use-choir-data";
import type { Attendee, Event } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

interface DialogState {
  isOpen: boolean;
  title: string;
  description: string;
  type: "success" | "error";
}

export default function HomePage() {
  const {
    attendees,
    events,
    activeEvent,
    isLoading,
    addAttendee,
    updateAttendee,
    deleteAttendee,
    toggleAttendance,
    addEvent,
    deleteEvent,
    setActiveEvent,
  } = useChoirData();

  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [resultDialog, setResultDialog] = useState<DialogState>({
    isOpen: false,
    title: "",
    description: "",
    type: "success",
  });

  // Set first event as default on load
  useEffect(() => {
    if (events.length > 0 && !activeEvent) {
      setActiveEvent(events[0]);
    }
  }, [events, activeEvent, setActiveEvent]);

  // Clear newly added indicator after 3 seconds
  useEffect(() => {
    if (newlyAddedId) {
      const timer = setTimeout(() => setNewlyAddedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedId]);

  // Sort attendees by created_at (latest first)
  const sortedAttendees = [...attendees].sort((a, b) => {
    // Handle both Firestore Timestamp and ISO string formats
    const getTimestamp = (attendee: Attendee): number => {
      if (attendee.created_at) {
        if (
          typeof attendee.created_at === "object" &&
          "seconds" in attendee.created_at
        ) {
          return attendee.created_at.seconds * 1000; // Convert Firestore timestamp
        }
        if (typeof attendee.created_at === "string") {
          return new Date(attendee.created_at).getTime();
        }
      }
      return 0;
    };

    const timeA = getTimestamp(a);
    const timeB = getTimestamp(b);
    return timeB - timeA; // Newest first
  });

  // Pagination
  const totalPages = Math.ceil(sortedAttendees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAttendees = sortedAttendees.slice(startIndex, endIndex);

  const showResultDialog = (
    title: string,
    description: string,
    type: "success" | "error"
  ) => {
    setResultDialog({
      isOpen: true,
      title,
      description,
      type,
    });
  };

  const closeResultDialog = () => {
    setResultDialog({
      isOpen: false,
      title: "",
      description: "",
      type: "success",
    });
  };

  const handleEditAttendee = (attendee: Attendee) => {
    setEditingAttendee(attendee);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) setEditingAttendee(null);
  };

  const handleSelectEvent = async (eventId: string) => {
    setIsOperationLoading(true);
    try {
      const selected = events.find((e) => e.id === eventId);
      if (selected) {
        setActiveEvent(selected);
        showResultDialog(
          "Event Selected",
          `Now tracking: ${selected.name}`,
          "success"
        );
      }
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleMobileSelectEvent = async (eventId: string) => {
    setIsOperationLoading(true);
    try {
      const selected = events.find((e) => e.id === eventId);
      if (selected) {
        setActiveEvent(selected);
        setIsMobileMenuOpen(false);
        showResultDialog(
          "Event Selected",
          `Now tracking: ${selected.name}`,
          "success"
        );
      }
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleToggleAttendance = async (attendeeId: string) => {
    if (activeEvent) {
      try {
        const attendee = attendees.find((a) => a.id === attendeeId);
        const wasCheckedIn = attendee?.events_attended.includes(activeEvent.id);

        await toggleAttendance(attendeeId, activeEvent.id);

        const isNowCheckedIn = !wasCheckedIn;

        showResultDialog(
          isNowCheckedIn ? "✓ Checked In" : "✗ Checked Out",
          `${attendee?.firstname} ${attendee?.lastname} - ${
            isNowCheckedIn ? "Attendance recorded" : "Attendance removed"
          }`,
          "success"
        );
      } catch (error) {
        showResultDialog("Error", "Failed to update attendance", "error");
      }
    }
  };

  const handleAddAttendee = async (attendee: Omit<Attendee, "id">) => {
    setIsOperationLoading(true);
    try {
      const result = await addAttendee(attendee);
      setNewlyAddedId(result?.id || null); // Highlight the newly added attendee
      setCurrentPage(1); // Go to first page to see newly added attendee
      showResultDialog(
        "Success",
        `${attendee.firstname} ${attendee.lastname} added successfully`,
        "success"
      );
    } catch (error) {
      showResultDialog("Error", "Failed to add attendee", "error");
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleUpdateAttendee = async (
    id: string,
    attendee: Partial<Attendee>
  ) => {
    setIsOperationLoading(true);
    try {
      await updateAttendee(id, attendee);
      showResultDialog("Success", "Attendee updated successfully", "success");
      setIsEditDialogOpen(false);
      setEditingAttendee(null);
    } catch (error) {
      showResultDialog("Error", "Failed to update attendee", "error");
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleDeleteAttendee = async (attendeeId: string) => {
    setIsOperationLoading(true);
    try {
      const attendee = attendees.find((a) => a.id === attendeeId);
      await deleteAttendee(attendeeId);
      showResultDialog(
        "Success",
        `${attendee?.firstname} ${attendee?.lastname} deleted`,
        "success"
      );
      if (paginatedAttendees.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      showResultDialog("Error", "Failed to delete attendee", "error");
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleAddEvent = async (event: Omit<Event, "id">) => {
    setIsOperationLoading(true);
    try {
      await addEvent(event);
      showResultDialog("Success", `Event "${event.name}" created`, "success");
    } catch (error) {
      showResultDialog("Error", "Failed to create event", "error");
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setIsOperationLoading(true);
    try {
      const event = events.find((e) => e.id === eventId);
      await deleteEvent(eventId);
      showResultDialog("Success", `Event "${event?.name}" deleted`, "success");
    } catch (error) {
      showResultDialog("Error", "Failed to delete event", "error");
    } finally {
      setIsOperationLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  function cn(...classes: (string | boolean)[]): string {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Result Dialog */}
      <AlertDialog open={resultDialog.isOpen} onOpenChange={closeResultDialog}>
        <AlertDialogContent
          className={
            resultDialog.type === "error"
              ? "border-destructive/50 bg-destructive/10"
              : "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20"
          }
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              {resultDialog.type === "error" ? (
                <AlertCircle className="w-6 h-6 text-destructive" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              )}
              <AlertDialogTitle>{resultDialog.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {resultDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={closeResultDialog}
            className={
              resultDialog.type === "error"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-emerald-600 hover:bg-emerald-700"
            }
          >
            OK
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/veclogo.png"
                  alt="VECAttend Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-lg leading-tight">
                  VECAttend
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Audience Management
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-64">
                <EventSelector
                  events={events}
                  activeEvent={activeEvent}
                  onSelectEvent={handleSelectEvent}
                  onAddEvent={handleAddEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              </div>
              <AddAttendeeDialog
                activeEvent={activeEvent}
                onAddAttendee={handleAddAttendee}
              />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <EventSelector
                events={events}
                activeEvent={activeEvent}
                onSelectEvent={handleMobileSelectEvent}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
              />
              <AddAttendeeDialog
                activeEvent={activeEvent}
                onAddAttendee={(attendee) => {
                  handleAddAttendee(attendee);
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "container mx-auto px-4 py-6 space-y-6",
          isOperationLoading && "opacity-60 pointer-events-none"
        )}
      >
        {/* Active Event Banner */}
        {activeEvent && (
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Currently tracking:{" "}
                  <span className="text-orange-600 font-semibold">
                    {activeEvent.name}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Tap avatars to toggle attendance
                </p>
              </div>
            </div>
          </div>
        )}

        {!activeEvent && events.length === 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Create an event first to start tracking attendance
            </p>
          </div>
        )}

        {!activeEvent && events.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Select an event from the dropdown to start tracking attendance
            </p>
          </div>
        )}

        {/* Stats */}
        <StatsCards
          attendees={attendees}
          events={events}
          activeEvent={activeEvent}
        />

        {/* Attendee List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Audience</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {sortedAttendees.length} total • Showing{" "}
                {Math.min(ITEMS_PER_PAGE, sortedAttendees.length)} per page
              </p>
            </div>
          </div>
          <AttendeeList
            attendees={paginatedAttendees}
            activeEvent={activeEvent}
            onToggleAttendance={handleToggleAttendance}
            onDeleteAttendee={handleDeleteAttendee}
            onEditAttendee={handleEditAttendee}
            newlyAddedId={newlyAddedId}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Attendee Dialog */}
      <AddAttendeeDialog
        activeEvent={activeEvent}
        onAddAttendee={handleAddAttendee}
        editingAttendee={editingAttendee}
        onUpdateAttendee={handleUpdateAttendee}
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
      />
    </div>
  );
}
