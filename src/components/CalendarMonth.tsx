"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import WeekModal from "./WeekModal";

export default function CalendarMonth() {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [open, setOpen] = React.useState(false);

  const [presences, setPresences] = React.useState<Record<string, "present" | "finished">>({});

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setOpen(true);
  };

  const handlePresenceChange = (date: Date, status: "present" | "finished" | "none") => {
    const iso = date.toISOString().split("T")[0];
    setPresences((prev) => {
      const updated = { ...prev };
      if (status === "none") delete updated[iso];
      else updated[iso] = status;
      return updated;
    });
  };

  return (
    <>
      <Calendar
        mode="single"
        selected={selectedDate ?? undefined}
        onSelect={handleDayClick}
        className="rounded-md border shadow"
        modifiers={{
          today: new Date(),
        }}
        modifiersClassNames={{
          today: "ring-2 ring-blue-400",
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-full">
          <DialogHeader>
            <DialogTitle>
              Settimana di {selectedDate?.toLocaleDateString("it-IT")}
            </DialogTitle>
          </DialogHeader>

          {selectedDate && (
            <WeekModal
              selectedDate={selectedDate}
              presences={presences}
              onPresenceChange={handlePresenceChange}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
