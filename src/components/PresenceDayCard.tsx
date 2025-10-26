"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PresenceDayCard({
    date,
    onPresenceChange,
    presences = {},
}: {
    date: Date;
    onPresenceChange?: (date: Date, status: "present" | "finished" | "none") => void;
    presences?: Record<string, "present" | "finished">;
}) {
    const [status, setStatus] = React.useState<"none" | "present" | "finished">("none");


    // TEST MODE — simula giornata specifica
    // const today = new Date("2025-10-23");

    const today = new Date();
    const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    const iso = date.toISOString().split("T")[0];

    // Sincronizza stato locale con globale
    React.useEffect(() => {
        if (presences[iso]) setStatus(presences[iso]);
        else setStatus("none");
    }, [presences, iso]);

    // Logica di click
    const handleClick = () => {
        let newStatus: "none" | "present" | "finished";
        if (status === "none") newStatus = "present";
        else if (status === "present") newStatus = "finished";
        else newStatus = "none"; // se clicchi ancora, resetta

        setStatus(newStatus);
        onPresenceChange?.(date, newStatus);
    };

    const { label, color } = (() => {
        switch (status) {
            case "present":
                return { label: "Segna uscita", color: "bg-green-500 hover:bg-green-600 text-white" };
            case "finished":
                return { label: "Presenza completata", color: "bg-blue-500 text-white hover:bg-blue-600" };
            default:
                return { label: "Segna presenza", color: "border border-gray-300 text-gray-700" };
        }
    })();

    return (
        <Card
            className={cn(
                "w-44 text-center transition-all duration-200 shadow-sm",
                status === "present" && "border-green-400 shadow-green-100",
                status === "finished" && "border-blue-400 shadow-blue-100",
                !isToday && "opacity-60"
            )}
        >
            <CardHeader>
                <CardTitle className="text-base font-semibold">
                    {date.toLocaleDateString("it-IT", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                    })}
                </CardTitle>
            </CardHeader>

            <CardContent>
                {isToday ? (
                    <Button
                        onClick={handleClick}
                        className={cn("w-full text-sm font-medium transition-all duration-200", color)}
                    >
                        {label}
                    </Button>
                ) : (
                    <p className="text-sm text-gray-500 italic mt-2">Non disponibile</p>
                )}
            </CardContent>
        </Card>
    );
}