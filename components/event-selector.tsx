"use client"

import { useState } from "react"
import { CalendarDays, ChevronDown, Plus, Radio, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Event } from "@/lib/types"

interface EventSelectorProps {
  events: Event[]
  activeEvent: Event | null
  onSelectEvent: (eventId: string | null) => void
  onAddEvent: (event: Omit<Event, "id" | "createdAt">) => void
  onDeleteEvent: (id: string) => void
}

export function EventSelector({ events, activeEvent, onSelectEvent, onAddEvent, onDeleteEvent }: EventSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEventName, setNewEventName] = useState("")
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split("T")[0])

  const handleAddEvent = () => {
    if (!newEventName.trim()) return
    onAddEvent({
      name: newEventName.trim(),
      date: newEventDate,
      isActive: true,
    })
    setNewEventName("")
    setNewEventDate(new Date().toISOString().split("T")[0])
    setIsDialogOpen(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between gap-2 h-12 px-4 bg-card border-border hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                {activeEvent ? (
                  <>
                    <p className="text-sm font-medium text-foreground">{activeEvent.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(activeEvent.date)}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Select an event</p>
                )}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          {events.length > 0 ? (
            events.map((event) => (
              <DropdownMenuItem
                key={event.id}
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => onSelectEvent(event.id)}
              >
                <div className="flex items-center gap-3">
                  {activeEvent?.id === event.id && <Radio className="w-4 h-4 text-primary fill-primary" />}
                  {activeEvent?.id !== event.id && (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteEvent(event.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No events yet</div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="p-3 cursor-pointer" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create new event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                placeholder="e.g., Sunday Service Concert"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-date">Date</Label>
              <Input
                id="event-date"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent} disabled={!newEventName.trim()}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
