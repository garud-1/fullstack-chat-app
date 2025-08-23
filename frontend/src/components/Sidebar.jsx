
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeleton/SidebarSkeleton";
import { Users } from "lucide-react";
import { axiosInstance } from "../utils/axios";


const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    getUsers();
    // Fetch groups from backend
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await axiosInstance.get("/friends");
        setGroups(res.data.groups || []);
      } catch {
        setGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading || loadingGroups) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Chats</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* Group Chats Section */}
        <div className="mb-4">
          <div className="font-semibold text-xs text-zinc-500 px-3 mb-1">Groups</div>
          {groups.length === 0 && <div className="text-center text-zinc-400 text-xs">No groups</div>}
          {groups.map((group) => (
            <button
              key={group.name}
              onClick={() => setSelectedUser({ ...group, isGroup: true })}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?.name === group.name ? "bg-base-300 ring-1 ring-base-300" : ""}`}
            >
              <div className="relative mx-auto lg:mx-0">
                <div className="size-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                  {group.name[0]}
                </div>
              </div>
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{group.name}</div>
                <div className="text-xs text-zinc-400">Group chat</div>
              </div>
            </button>
          ))}
        </div>

        {/* Individual Chats Section */}
        <div className="font-semibold text-xs text-zinc-500 px-3 mb-1">Users</div>
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">{onlineUsers.includes(user._id) ? "Online" : "Offline"}</div>
            </div>
          </button>
        ))}
        {filteredUsers.length === 0 && <div className="text-center text-zinc-500 py-4">No online users</div>}
      </div>
    </aside>
  );
};
export default Sidebar;