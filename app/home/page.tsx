"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const isLogged = localStorage.getItem("loggedIn");
        if (!isLogged) {
            router.push("/login");
        }
    },[router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
            <h1 className="text-3xl text-stone-900 font-bold mb-4">Benvenuto nella Home</h1>
            <button
            onClick={() => {
                localStorage.removeItem("loggedIn");
                router.push("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
            >
                Logout
            </button>
        </div>
    );
}