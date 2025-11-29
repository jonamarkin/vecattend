"use client"

import { useState } from "react"
import { Music2, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventSelector } from "@/components/event-selector"
import { StatsCards } from "@/components/stats-cards"
import { AttendeeList } from "@/components/member-list"
import { AddAttendeeDialog } from "@/components/add-member-dialog"
import { useChoirData } from "@/hooks/use-choir-data"
import type { Attendee } from "@/lib/types"

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
  } = useChoirData()

  const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleEditAttendee = (attendee: Attendee) => {
    setEditingAttendee(attendee)
    setIsEditDialogOpen(true)
  }

  const handleCloseEditDialog = (open: boolean) => {
    setIsEditDialogOpen(open)
    if (!open) setEditingAttendee(null)
  }

  const handleToggleAttendance = (attendeeId: string) => {
    if (activeEvent) {
      toggleAttendance(attendeeId, activeEvent.id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                <Music2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-lg leading-tight">ChoirCheck</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Audience Management</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-64">
                <EventSelector
                  events={events}
                  activeEvent={activeEvent}
                  onSelectEvent={setActiveEvent}
                  onAddEvent={addEvent}
                  onDeleteEvent={deleteEvent}
                />
              </div>
              <AddAttendeeDialog activeEvent={activeEvent} onAddAttendee={addAttendee} />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <EventSelector
                events={events}
                activeEvent={activeEvent}
                onSelectEvent={(id) => {
                  setActiveEvent(id)
                  setIsMobileMenuOpen(false)
                }}
                onAddEvent={addEvent}
                onDeleteEvent={deleteEvent}
              />
              <AddAttendeeDialog
                activeEvent={activeEvent}
                onAddAttendee={(attendee) => {
                  addAttendee(attendee)
                  setIsMobileMenuOpen(false)
                }}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Active Event Banner */}
        {activeEvent && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Currently tracking: <span className="text-primary">{activeEvent.name}</span>
                </p>
                <p className="text-xs text-muted-foreground">Tap avatars to toggle attendance</p>
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

        {/* Stats - Updated prop name */}
        <StatsCards attendees={attendees} events={events} activeEvent={activeEvent} />

        {/* Attendee List - Updated section title and props */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Audience</h2>
          </div>
          <AttendeeList
            attendees={attendees}
            activeEvent={activeEvent}
            onToggleAttendance={handleToggleAttendance}
            onDeleteAttendee={deleteAttendee}
            onEditAttendee={handleEditAttendee}
          />
        </div>
      </main>

      {/* Edit Attendee Dialog - Updated props */}
      <AddAttendeeDialog
        activeEvent={activeEvent}
        onAddAttendee={addAttendee}
        editingAttendee={editingAttendee}
        onUpdateAttendee={updateAttendee}
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
      />
    </div>
  )
}
