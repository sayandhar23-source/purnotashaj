'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { api } from '@/lib/api';

export default function FooterLocationTime() {
  const [location, setLocation] = useState<string | null>(null);
  const [time, setTime] = useState('');

  useEffect(() => {
    api
      .get('/geo/me')
      .then((res) => {
        const { available, city, region, country } = res.data;
        if (!available) return;
        const parts = [city, region || country].filter(Boolean);
        if (parts.length) setLocation(parts.join(', '));
      })
      .catch(() => {}); // fails quietly — footer works fine without this
  }, []);

  useEffect(() => {
    // Uses the visitor's own browser clock — already reflects their local
    // time zone automatically, no extra lookup needed for this part.
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const interval = setInterval(tick, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  if (!location && !time) return null;

  return (
    <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-3 flex-wrap">
      {location && (
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {location}
        </span>
      )}
      {time && (
        <span className="flex items-center gap-1">
          <Clock size={12} /> {time}
        </span>
      )}
    </div>
  );
}
