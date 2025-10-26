"use client";

import * as React from "react";
import PresenceDayCard from "./PresenceDayCard";

function getWeekDays(baseDate: Date) {
    const day = baseDate.getDay(); // 0 = domenica
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + mondayOffset);
    return Array.from({ length: 5 }).map((_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
}

export default function WeekModal({
    selectedDate,
    presences = {},
    onPresenceChange,
}: {
    selectedDate: Date;
    presences?: Record<string, "present" | "finished">;
    onPresenceChange?: (date: Date, status: "present" | "finished" | "none") => void;
}) {
    const weekDays = getWeekDays(selectedDate);

    return (
        <div className="grid grid-cols-5 gap-4 justify-items-center mt-6">
            {weekDays.map((d) => (
                <PresenceDayCard
                    key={d.toISOString()}
                    date={d}
                    presences={presences}
                    onPresenceChange={onPresenceChange}
                />
            ))}
        </div>
    );
}
