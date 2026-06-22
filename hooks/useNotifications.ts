"use client";
import { useState, useEffect } from "react";
export function useNotifications() {
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        setItems(data.notifications || []);
        setUnread(data.unread || 0);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);
  return { items, unread };
}