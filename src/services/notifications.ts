import { api } from "@/src/services/api";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: "checkmark-circle-outline" | "alert-circle-outline" | "document-text-outline" | "notifications-outline";
  tint: string;
  read?: boolean;
  createdAt?: string;
};

const FALLBACK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "1",
    title: "Invoice paid",
    body: "Northwind Studio completed payment for INV-2026-001.",
    time: "2 mins ago",
    icon: "checkmark-circle-outline",
    tint: "#1F9D72",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Payment reminder due",
    body: "Bell & Bloom is now overdue on INV-2026-003.",
    time: "18 mins ago",
    icon: "alert-circle-outline",
    tint: "#C24E32",
    read: false,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Draft ready",
    body: "Granite Ops draft invoice is ready to review and send.",
    time: "1 hour ago",
    icon: "document-text-outline",
    tint: "#667085",
    read: true,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "New invoice created",
    body: "Invoice INV-2026-004 created for Acme Corp.",
    time: "2 hours ago",
    icon: "document-text-outline",
    tint: "#667085",
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    title: "Reminder sent",
    body: "A reminder has been sent to Northwind Studio.",
    time: "1 day ago",
    icon: "notifications-outline",
    tint: "#0A84FF",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    title: "Invoice overdue warning",
    body: "Bell & Bloom INV-2026-002 is approaching overdue status.",
    time: "2 days ago",
    icon: "alert-circle-outline",
    tint: "#C24E32",
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    title: "Stripe connection updated",
    body: "Your Stripe account was successfully re-authorized.",
    time: "3 days ago",
    icon: "checkmark-circle-outline",
    tint: "#1F9D72",
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
}): Promise<AppNotification[]> {
  try {
    const response = await api.get<any>("/notifications", { params });
    
    // Check various formats response data can arrive in
    let rawList: any = null;
    if (Array.isArray(response.data)) {
      rawList = response.data;
    } else if (response.data && Array.isArray(response.data.notifications)) {
      rawList = response.data.notifications;
    } else if (response.data && Array.isArray(response.data.data)) {
      rawList = response.data.data;
    }

    if (rawList) {
      return rawList.map((item: any, idx: number) => ({
        id: item._id || item.id || String(idx),
        title: item.title || "Notification",
        body: item.body || item.message || "",
        time: item.time || (item.createdAt ? formatTimeAgo(item.createdAt) : "Just now"),
        icon: mapIcon(item.type || item.icon),
        tint: item.tint || mapTint(item.type || item.icon),
        read: !!item.read,
        createdAt: item.createdAt,
      }));
    }
  } catch (error) {
    console.warn("Backend notifications endpoint failed, falling back to local storage:", error);
  }
  
  return FALLBACK_NOTIFICATIONS;
}

function mapIcon(type?: string): any {
  if (!type) return "notifications-outline";
  const t = type.toLowerCase();
  if (t.includes("paid") || t.includes("success") || t.includes("check")) return "checkmark-circle-outline";
  if (t.includes("overdue") || t.includes("alert") || t.includes("warn")) return "alert-circle-outline";
  if (t.includes("draft") || t.includes("doc")) return "document-text-outline";
  return "notifications-outline";
}

function mapTint(type?: string): string {
  if (!type) return "#667085";
  const t = type.toLowerCase();
  if (t.includes("paid") || t.includes("success") || t.includes("check")) return "#1F9D72";
  if (t.includes("overdue") || t.includes("alert") || t.includes("warn")) return "#C24E32";
  if (t.includes("draft") || t.includes("doc")) return "#667085";
  return "#0A84FF";
}

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "Some time ago";
  }
}
