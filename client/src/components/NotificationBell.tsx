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
      className="relative w-10 h-10 rounded-full glass-card flex items-center justify-center
                 text-emerald-300 hover:text-white hover:border-emerald-400/40 transition-all shadow-sm"
      title="Notifications"
    >
      <Bell className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] rounded-full
                        w-4 h-4 flex items-center justify-center font-bold shadow-md">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
