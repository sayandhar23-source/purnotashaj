'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, X, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type: string;
  image?: string;
  linkType: 'product' | 'category' | 'sale' | 'none';
  linkSlug?: string;
  isRead: boolean;
  createdAt: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function linkFor(n: NotificationItem): string | null {
  if (n.linkType === 'product' && n.linkSlug) return `/products/${n.linkSlug}`;
  if (n.linkType === 'category' && n.linkSlug) return `/category/${n.linkSlug}`;
  if (n.linkType === 'sale') return '/sale';
  return null;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const poll = () => {
      api
        .get('/notifications/unread-count')
        .then((res) => setUnreadCount(res.data.count))
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    api
      .get('/notifications/me')
      .then((res) => setNotifications(res.data))
      .finally(() => setLoading(false));
  }, [open, user]);

  // Close on outside click (desktop dropdown behavior)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClickNotification = async (n: NotificationItem) => {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      api.patch(`/notifications/${n._id}/read`).catch(() => {});
    }
    const href = linkFor(n);
    setOpen(false);
    if (href) router.push(href);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.patch('/notifications/read-all');
    } catch {}
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative hover:text-brand-500"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop — mobile only, makes the panel feel like a sheet rather than a dropdown */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 top-16 bg-black/30 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div
          ref={panelRef}
          className="fixed sm:absolute left-0 right-0 sm:left-auto sm:right-0 top-16 sm:top-full sm:mt-2 sm:w-96 bg-white sm:rounded-2xl rounded-b-2xl shadow-xl z-50 max-h-[75vh] sm:max-h-[28rem] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <p className="font-semibold text-sm">Notifications</p>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-brand-500 flex items-center gap-1"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="sm:hidden" aria-label="Close">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-10">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClickNotification(n)}
                  className={`w-full flex gap-3 px-4 py-3 text-left border-b border-gray-50 last:border-0 hover:bg-gray-50 ${
                    !n.isRead ? 'bg-brand-50/40' : ''
                  }`}
                >
                  {n.image ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image src={n.image} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <Bell size={16} className="text-brand-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                      <p className="text-sm font-medium truncate">{n.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
