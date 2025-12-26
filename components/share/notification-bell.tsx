"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  dismissed: boolean;
  createdAt: string;
  shareRequestId: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read && !n.dismissed).length;

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?undismissedOnly=true");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds: [notificationId],
          action: "read",
        }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds: [notificationId],
          action: "dismiss",
        }),
      });

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    setIsOpen(false);
    router.push("/settings?tab=sharing");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isOpen ? "var(--surface-secondary)" : "transparent",
          color: "var(--text-secondary)",
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: "var(--primary)",
              color: "#1a1a1a",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border overflow-hidden"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            zIndex: 1000,
          }}
        >
          <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Notifications
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell size={32} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No new notifications
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="p-3 border-b cursor-pointer transition-colors hover:bg-opacity-50"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: notification.read ? "transparent" : "var(--surface-secondary)",
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <span
                        className="w-2 h-2 rounded-full mt-1"
                        style={{ backgroundColor: "var(--primary)" }}
                      />
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                    {notification.message}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(notification.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/settings?tab=sharing");
                }}
                className="w-full text-center text-sm py-2 rounded transition-colors"
                style={{ color: "var(--primary)" }}
              >
                View all in Settings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
