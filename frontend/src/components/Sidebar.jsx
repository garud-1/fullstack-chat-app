
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeleton/SidebarSkeleton";
import { Users } from "lucide-react";
import { axiosInstance } from "../utils/axios";
import toast from "react-hot-toast";


const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [view, setView] = useState("users"); // 'users' | 'friends'
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  // Removed groups state and loadingGroups state because /friends endpoint is gone

  useEffect(() => {
    // always fetch users for the users view and warm cache
    getUsers();
    // Removed fetchGroups because /friends endpoint is gone
  }, [getUsers]);

  // load sent friend requests from localStorage so they survive page refresh
  useEffect(() => {
    try {
      const raw = localStorage.getItem('chatty_sentRequests');
      if (raw) setSentRequests(JSON.parse(raw));
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  // persist sentRequests to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('chatty_sentRequests', JSON.stringify(sentRequests));
    } catch (err) {
      // ignore storage errors
    }
  }, [sentRequests]);

  // fetch friends when switching to friends view
  useEffect(() => {
    if (view !== "friends") return;
    const fetchFriends = async () => {
      setFriendsLoading(true);
      try {
        const res = await axiosInstance.get("/friends");
        // backend returns an array where each item may be { user: {...} } or a plain user
        const list = (res.data || []).map((f) => (f?.user ? f.user : f));
        setFriends(list);
      } catch (err) {
        setFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    };
    fetchFriends();
  }, [view]);

  // keep friends up-to-date when switching to users view as well
  useEffect(() => {
    if (view !== 'users') return;
    const fetchFriendsOnUsers = async () => {
      setFriendsLoading(true);
      try {
        const res = await axiosInstance.get('/friends');
        const list = (res.data || []).map((f) => (f?.user ? f.user : f));
        setFriends(list);
      } catch (err) {
        setFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    };
    fetchFriendsOnUsers();
  }, [view]);

  // search users (client-side filter of /messages/users)
  const doSearch = async (q) => {
    const trimmed = q.trim();
    setSearchQuery(trimmed);
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await axiosInstance.get('/messages/users');
      const all = res.data || [];
      // exclude self and existing friends
      const friendIds = new Set(friends.map(f => f._id));
      const filtered = all.filter(u => u._id !== authUser?._id && !friendIds.has(u._id) && (u.fullName.toLowerCase().includes(trimmed.toLowerCase()) || (u.email || '').toLowerCase().includes(trimmed.toLowerCase())));
      setSearchResults(filtered);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axiosInstance.post('/friends/request', { userId });
      setSentRequests(prev => [...prev, userId]);
      toast.success('Friend request sent');
      // optionally remove from search results
      setSearchResults(prev => prev.filter(p => p._id !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send request');
    }
  };

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full flex flex-col transition-all duration-200 pt-2 bg-base-200 text-base-content">
      <div className="w-full p-3 md:p-4">
        <div className="flex items-center gap-3">
          <Users className="size-6 text-base-content" />
          <span className="font-semibold hidden md:block">Chats</span>
        </div>

  <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setView("users")}
            className={`btn btn-ghost btn-sm rounded-md text-sm font-medium ${view === "users" ? 'btn-active' : ''}`}
          >
            Users
          </button>
          <button
            onClick={() => setView("friends")}
            className={`btn btn-ghost btn-sm rounded-md text-sm font-medium ${view === "friends" ? 'btn-active' : ''}`}
          >
            Friends
          </button>
        </div>

  <div className="mt-3 hidden md:block">
          {view === 'users' && (
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-base-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-base-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                <span className="ms-3 text-sm font-medium text-base-content">Online only</span>
              </label>
              <span className="block mt-1 text-xs text-base-content">({onlineUsers.length - 1} online)</span>
            </div>
          )}
          {view === 'friends' && (
            <div className="text-xs text-indigo-200">Manage your friends — click a friend to open chat</div>
          )}
        </div>
        {/* Search box for Friends view (visible on all sizes) */}
        {view === 'friends' && (
          <div className="mt-3 px-2 w-full">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => doSearch(e.target.value)}
                placeholder="Search people to add..."
                className="input input-sm w-full pr-20"
              />
              {searching ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-content/60">Searching...</span>
              ) : searchQuery ? (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="btn btn-xs btn-ghost absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="overflow-y-auto w-full py-2 px-1 md:px-3">
        {/* Individual Chats Section */}
  <div className="font-semibold text-xs px-3 mb-1">{view === 'users' ? 'My Friends' : 'Find people'}</div>
  {(view === 'users' ? friends : (searchResults.length ? searchResults : friends)).map((user) => (
          <div
            key={user._id}
            role="button"
            tabIndex={0}
            onClick={() => {
              // friend objects may be raw user or wrapped under user
              const resolved = user?.user ? user.user : user;
              setSelectedUser(resolved);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const resolved = user?.user ? user.user : user;
                setSelectedUser(resolved);
              }
            }}
            className={`w-full p-2 md:p-3 flex items-center gap-3 rounded-md hover:bg-base-300/50 transition-colors ${selectedUser?._id === user._id ? "bg-base-300/50 ring-1 ring-base-content/20" : ""}`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={(user.profilePic || user.user?.profilePic) || "/avatar.png"}
                alt={(user.fullName || user.user?.fullName) || 'avatar'}
                className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full"
              />
              {onlineUsers.includes((user._id) || (user.user && user.user._id)) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-base-200" />
              )}
            </div>
            <div className="hidden md:flex flex-col text-left min-w-0">
              <div className="font-medium text-sm truncate">{user.fullName || (user.user && user.user.fullName)}</div>
              <div className="text-xs">{onlineUsers.includes((user._id) || (user.user && user.user._id)) ? "Online" : "Offline"}</div>
            </div>
            {view === 'friends' && searchResults.length > 0 && (
              <div className="ml-auto">
                {sentRequests.includes(user._id) ? (
                  <button className="btn btn-xs btn-outline" disabled>Requested</button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); sendFriendRequest(user._id); }} className="btn btn-xs">Add</button>
                )}
              </div>
            )}
          </div>
        ))}
        {/* Empty states */}
        {view === 'users' && friends.length === 0 && (
          <div className="text-center text-neutral-500 py-4">You don't have any friends yet.</div>
        )}
        {view === 'friends' && searchQuery && searchResults.length === 0 && (
          <div className="text-center text-neutral-500 py-4">No users found for "{searchQuery}"</div>
        )}
        {view === 'friends' && !searchQuery && friends.length === 0 && (
          <div className="text-center text-neutral-500 py-4">You don't have friends yet — search to add people.</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;