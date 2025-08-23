import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { LogOut, MessageSquare, Settings, User, Bell, Users } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../utils/axios";

const Navbar = () => {
  const { logout, authUser, socket } = useAuthStore();
  const { getUsers } = useChatStore();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!authUser) return;
    const fetchNotifs = async () => {
      try {
        const res = await axiosInstance.get("/friends/notifications");
        setNotifications(res.data.notifications || []);
      } catch (err) {
        // ignore silently
      }
    };
    fetchNotifs();
    // listen for realtime notification events from socket
    if (socket) {
      const onNotif = (payload) => {
        setNotifications(prev => [{
          _id: `local_${Date.now()}`,
          type: payload.type,
          from: { _id: payload.from },
          message: payload.message,
          read: false,
          createdAt: new Date().toISOString()
        }, ...prev]);
      };
      socket.on('notification', onNotif);
      return () => socket.off('notification', onNotif);
    }
  }, [authUser]);

  // close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      await axiosInstance.post("/friends/notifications/read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      // ignore
    }
  };

  const acceptNotification = async (notif) => {
    try {
  // support populated { from: { _id } } or raw ObjectId/string in from
  const requesterId = notif.from?._id || notif.from;
  if (!requesterId) return;
  await axiosInstance.post('/friends/accept', { requesterId });
  // mark this notification read locally (and keep it visible briefly)
  setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
  // refetch remote notifications so the server state is consistent
  const res = await axiosInstance.get('/friends/notifications');
  setNotifications(res.data.notifications || []);
  // refresh users list and notify other components via socket
  getUsers?.();
  socket?.emit('friendUpdate');
  // give user feedback
  import('react-hot-toast').then(({ default: toast }) => toast.success('Friend added'));
    } catch (err) {
  import('react-hot-toast').then(({ default: toast }) => toast.error(err?.response?.data?.message || 'Failed to accept'));
    }
  };

  const dismissNotification = (notif) => {
    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
  };

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="btn btn-ghost btn-sm relative flex items-center gap-2"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-base-100 border border-base-300 rounded-md overflow-hidden z-50 shadow-lg">
                  <div className="p-3 border-b flex items-center justify-between bg-base-200">
                    <div className="font-semibold">Notifications</div>
                    <button onClick={markAllRead} className="btn btn-xs btn-ghost">Mark all</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 && <div className="p-4 text-sm text-base-content/60">You're all caught up 🎉</div>}
                    {notifications.map((n) => (
                      <div key={n._id} className={`p-3 border-b hover:bg-base-200 ${n.read ? 'bg-base-100' : 'bg-primary/10'}`}>
                        <div className="flex items-start gap-3">
                          <img src={n.from?.profilePic || '/avatar.png'} alt={n.from?.fullName} className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-base-content">{n.from?.fullName || 'System'}</div>
                            <div className="text-xs text-base-content/70">{n.message || n.text}</div>
                            <div className="text-[10px] text-base-content/50 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                            {n.type === 'friend_request' && !n.read && (
                              <div className="mt-2 flex items-center gap-2">
                                <button className="btn btn-xs btn-success" onClick={() => acceptNotification(n)}>Accept</button>
                                <button className="btn btn-xs btn-ghost" onClick={() => dismissNotification(n)}>Dismiss</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              to={'/settings'}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;