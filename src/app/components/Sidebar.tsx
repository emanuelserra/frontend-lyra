"use client";

import { motion } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import Link from "next/link";
import { FaHome, FaUserGraduate, FaChalkboardTeacher, FaCalendarAlt } from "react-icons/fa";
import { useState } from "react";

const menuItems = [
  { name: "Home", icon: <FaHome />, href: "/home" },
  { name: "Studenti", icon: <FaUserGraduate />, href: "/students" },
  { name: "Corsi", icon: <FaChalkboardTeacher />, href: "/courses" },
  { name: "Calendario", icon: <FaCalendarAlt />, href: "/calendar" }, 
];

export default function Sidebar() {
  const [active, setActive] = useState("Dashboard");

  // helper per colori con fallback
  const sidebarBg = "var(--sidebar)";
  const sidebarFg = "var(--sidebar-foreground)";
  const activeBg = "var(--sidebar-primary)";
  const activeFg = "var(--sidebar-primary-foreground)";

  return (
    <Tooltip.Provider delayDuration={150}>
      <motion.aside
        className="w-64 flex flex-col h-screen shadow-lg"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: sidebarBg,
          color: sidebarFg,
          transition: "background-color .18s ease, color .18s ease",
        }}
      >
        <div
          className="flex items-center justify-center h-20"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            color: sidebarFg,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 20 }}>Lyra</span>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-1" aria-label="Sidebar principale">
          {menuItems.map((item) => {
            const isActive = active === item.name;

            return (
              <Tooltip.Root key={item.name}>
                <Tooltip.Trigger asChild>
                  
                  {/* USA <Link> PER LA NAVIGAZIONE */}
                  <Link
                    href={item.href}
                    onClick={() => setActive(item.name)}
                    className="flex items-center w-full px-4 py-3 rounded-lg transition-colors"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      gap: 12,
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 12,
                      paddingBottom: 12,
                      borderRadius: 10,
                      cursor: "pointer",
                      textDecoration: "none",
                      backgroundColor: isActive ? activeBg : "transparent",
                      color: isActive ? activeFg : sidebarFg,
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 0 }}>{item.icon}</span>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                  </Link>

                </Tooltip.Trigger>

                <Tooltip.Portal>
                  <Tooltip.Content
                    className="text-xs px-2 py-1 rounded shadow"
                    side="right"
                    sideOffset={5}
                    style={{
                      background: "rgba(0,0,0,0.85)",
                      color: "#fff",
                    }}
                  >
                    {item.name}
                    <Tooltip.Arrow className="fill-current" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </nav>
      </motion.aside>
    </Tooltip.Provider>
  );
}
