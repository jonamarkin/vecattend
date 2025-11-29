"use client";

import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Attendee, AttendeeCategory, Event } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

interface AddAttendeeDialogProps {
  activeEvent: Event | null;
  onAddAttendee: (attendee: Omit<Attendee, "id" | "createdAt">) => void;
  editingAttendee?: Attendee | null;
  onUpdateAttendee?: (id: string, updates: Partial<Attendee>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  category: AttendeeCategory;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  category: "regular",
};

export function AddAttendeeDialog({
  activeEvent,
  onAddAttendee,
  editingAttendee,
  onUpdateAttendee,
  open,
  onOpenChange,
}: AddAttendeeDialogProps) {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const isEditing = !!editingAttendee;

  useEffect(() => {
    if (editingAttendee) {
      setFormData({
        firstName: editingAttendee.firstname,
        lastName: editingAttendee.lastname,
        email: editingAttendee.email,
        phone: editingAttendee.phone,
        category: editingAttendee.category,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [editingAttendee, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Required";
    if (!formData.lastName.trim()) newErrors.lastName = "Required";
    if (!formData.phone.trim()) newErrors.phone = "Required";
    // Email is optional - no validation needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (isEditing && editingAttendee && onUpdateAttendee) {
      onUpdateAttendee(editingAttendee.id, {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.trim() || "", // Empty string if not provided
        phone: formData.phone.trim(),
        category: formData.category,
      });
    } else {
      // Auto-register for active event when adding new attendee
      const events_attended = activeEvent ? [activeEvent.id] : [];
      onAddAttendee({
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.trim() || "", // Empty string if not provided
        phone: formData.phone.trim(),
        category: formData.category,
        events_attended,
        registered_on: new Date().toISOString(),
        registered_by: "", // Update with actual user info
      });
    }

    setFormData(initialFormData);
    setIsOpen(false);
  };

  const formContent = (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className={errors.lastName ? "border-destructive" : ""}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">
          Email{" "}
          <span className="text-xs text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone">
          Phone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value: AttendeeCategory) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isEditing && activeEvent && (
        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          This person will be automatically registered for{" "}
          <span className="font-medium text-foreground">
            {activeEvent.name}
          </span>
        </p>
      )}
    </div>
  );

  const triggerButton = (
    <Button className="gap-2 h-11 bg-orange-600 hover:bg-orange-700">
      <UserPlus className="w-4 h-4" />
      <span className="hidden sm:inline">Register</span>
      <span className="sm:hidden">Add</span>
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {!isControlled && (
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        )}
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {isEditing ? "Edit Attendee" : "Register New Attendee"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4">{formContent}</div>
          <DrawerFooter className="pt-2">
            <Button
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isEditing ? "Save Changes" : "Register"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Attendee" : "Register New Attendee"}
          </DialogTitle>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isEditing ? "Save Changes" : "Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
