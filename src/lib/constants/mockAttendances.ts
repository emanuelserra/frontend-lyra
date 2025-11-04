export const mockAttendances: Record<string, "present" | "absent"> = {
    "2025-10-06": "absent",
    "2025-10-07": "present",
    "2025-10-08": "present",
    "2025-10-09": "absent",
    "2025-10-10": "present",
    "2025-10-13": "present",
    "2025-10-14": "absent",
    "2025-10-15": "present",
    "2025-10-16": "present",
    "2025-10-17": "absent",
    "2025-10-20": "present",
    "2025-10-21": "present",
    "2025-10-22": "absent",
    "2025-10-23": "present",
    "2025-10-24": "present",
};


export async function fetchMockAttendances(): Promise<Record<string, "present" | "absent">> {
    // Simula una chiamata API con un leggero delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockAttendances;
}