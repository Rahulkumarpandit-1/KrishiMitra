import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '../lib/api';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    notificationsApi.unreadCount()
      .then((res) => setCount(res.data.count))
      .catch(() => {});
    
    const interval = setInterval(() => {
      notificationsApi.unreadCount()
        .then((res) => setCount(res.data.count))
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => navigate('/notifications')}
      aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
      className="relative w-10 h-10 rounded-full glass-card flex items-center justify-center
                 text-emerald-300 hover:text-white hover:border-emerald-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 transition-all shadow-sm"
      title="Notifications"
    >
      <Bell className="w-4 h-4" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] rounded-full
                        w-4 h-4 flex items-center justify-center font-bold shadow-md">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
