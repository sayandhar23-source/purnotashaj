'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { getChatSessionId } from '@/lib/chatSession';
import { useAuth } from '@/lib/auth-context';

type ChatMessage = {
  _id: string;
  sender: 'customer' | 'admin';
  text: string;
  createdAt: string;
};

export default function LiveChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const sessionId = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    sessionId.current = getChatSessionId();
  }, []);

  const fetchMessages = async () => {
    if (!sessionId.current) return;
    try {
      const res = await api.get('/chat/messages', { params: { sessionId: sessionId.current } });
      const msgs: ChatMessage[] = res.data || [];
      setMessages(msgs);
      if (!open && msgs.length > lastCountRef.current) {
        setUnread((u) => u + (msgs.length - lastCountRef.current));
      }
      lastCountRef.current = msgs.length;
    } catch {
      // silently retry on next poll
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    try {
      await api.post('/chat/messages', {
        sessionId: sessionId.current,
        text: trimmed,
        customerName: user?.name,
      });
      await fetchMessages();
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open live chat'}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Chat panel — full-screen sheet on mobile, floating card on desktop */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-5 z-50 sm:w-96 sm:h-[520px] sm:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-brand-500 text-white px-4 py-4 sm:py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="font-semibold text-sm">Chat with us</p>
              <p className="text-xs text-white/80">We usually reply within a few hours</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="sm:hidden">
              <X size={22} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center mt-8">
                Send us a message and we'll get back to you here.
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m._id}
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    m.sender === 'customer'
                      ? 'bg-brand-500 text-white ml-auto rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-100 flex items-center gap-2 shrink-0">
            <input
              className="input flex-1 text-sm"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !text.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white flex items-center justify-center shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
