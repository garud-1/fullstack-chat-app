import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Bell, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axios";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  useEffect(() => {
    if (!authUser) return;
    axiosInstance.get("/friends/notifications").then(res => {
      setNotifications(res.data.notifications || []);
    });
  }, [authUser]);
  const unreadCount = notifications.filter(n => !n.read).length;

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
            <div className="relative">
              <button className="btn btn-ghost btn-circle" tabIndex={0} onClick={() => setNotifOpen(v => !v)}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="badge badge-error badge-xs absolute -top-1 -right-1">{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-base-100 border border-base-300 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-5 py-3 font-bold text-base border-b bg-base-200 flex items-center gap-2 rounded-t-2xl">
                    <Bell className="w-5 h-5 text-primary" /> Notifications
                  </div>
                  <ul className="max-h-72 overflow-y-auto divide-y divide-base-300">
                    {notifications.length === 0 && (
                      <li className="px-5 py-6 text-center text-base-content/60">No notifications</li>
                    )}
                    {notifications.map((n, i) => (
                      <li key={i} className={`flex items-start gap-3 px-5 py-4 hover:bg-base-200 transition cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}>
                        <span className={`rounded-full p-2 flex items-center justify-center ${n.type === 'group_invite' ? 'bg-primary/10 text-primary' : n.type === 'friend_request' ? 'bg-success/10 text-success' : 'bg-base-300/40 text-base-content/70'}`}>
                          {n.type === 'group_invite' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </span>
                        <div className="flex-1">
                          <div className="font-semibold capitalize">{n.type.replace('_', ' ')}</div>
                          <div className="text-sm text-base-content/70">{n.message}</div>
                          {/* Optionally, add Accept/Decline for invites/requests */}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 text-center text-sm text-primary cursor-pointer hover:underline bg-base-200 rounded-b-2xl">View all notifications</div>
                </div>
              )}
            </div>
            <Link
              to={"/settings"}
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