import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axios";
import { UserPlus, UserCheck, UserX, Ban, MailX, MailCheck, UserMinus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const FriendsSidebar = () => {
  const { authUser, socket } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState({ type: null, user: null });
  const [mutualFriends, setMutualFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [nickname, setNickname] = useState("");
  const [badge, setBadge] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  // Add/remove group members (top-level, before return)
  const [groupMembersLoading, setGroupMembersLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    if (modal.type === 'groupMembers' && modal.group) {
      setGroupMembers(modal.group.members || []);
    }
  }, [modal]);

  const handleAddMember = async (userId) => {
    setGroupMembersLoading(true);
    try {
      await axiosInstance.post('/friends/group/add', { groupName: modal.group.name, friendId: userId });
      setGroupMembers(prev => [...prev, userId]);
      toast.success('Member added');
      // Optionally refetch groups
      const friendsRes = await axiosInstance.get('/friends');
      setGroups(friendsRes.data.groups || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setGroupMembersLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    setGroupMembersLoading(true);
    try {
      await axiosInstance.post('/friends/groups/remove', { groupName: modal.group.name, userId });
      setGroupMembers(prev => prev.filter(id => id !== userId));
      toast.success('Member removed');
      // Optionally refetch groups
      const friendsRes = await axiosInstance.get('/friends');
      setGroups(friendsRes.data.groups || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setGroupMembersLoading(false);
    }
  };
  const [sentRequests, setSentRequests] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [privacy, setPrivacy] = useState({ canReceiveRequests: true, showOnlineStatus: true });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [bulkSelected, setBulkSelected] = useState([]);
  const [showBulk, setShowBulk] = useState(false);

  // Fetch all users and friend data
  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, friendsRes, requestsRes, blockedRes, groupsRes] = await Promise.all([
        axiosInstance.get("/messages/users"),
        axiosInstance.get("/friends"),
        axiosInstance.get("/friends/requests"),
        axiosInstance.get("/blocked"),
        axiosInstance.get("/friends/groups"),
      ]);
      
      setUsers(usersRes.data.filter(u => u._id !== authUser?._id));
      setFriends(friendsRes.data || []);
      setGroups(groupsRes.data || []);
      setPrivacy(authUser?.privacy || { canReceiveRequests: true, showOnlineStatus: true });
      setRequests(requestsRes.data || []);
      setBlocked(blockedRes.data || []);
      const sent = usersRes.data.filter(u =>
        u._id !== authUser?._id &&
        !friendsRes.data.friends.some(f => f._id === u._id) &&
        !blockedRes.data.blockedUsers.some(b => b._id === u._id) &&
        requestsRes.data.friendRequests.every(r => r._id !== u._id) &&
        u.friendRequests?.includes(authUser?._id)
      );
      setSentRequests(sent);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load friends data");
      toast.error("Failed to load friends data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    if (socket) {
  socket.on("friendUpdate", fetchAll);
  // Fetch mutual friends and suggestions for profile modal
  const openProfileModal = async (user) => {
    setModal({ type: "profile", user });
    try {
      const [mutualRes, suggRes] = await Promise.all([
        axiosInstance.get(`/friends/mutual?userId=${user._id}`),
        axiosInstance.get(`/friends/suggestions`),
      ]);
      setMutualFriends(mutualRes.data.mutual || []);
      setSuggestions(suggRes.data.suggestions || []);
    } catch {
      setMutualFriends([]);
      setSuggestions([]);
    }
  };
    }
    return () => {
      if (socket) socket.off("friendUpdate", fetchAll);
    };
    // eslint-disable-next-line
  }, [authUser, socket]);

  // Actions
  const sendRequest = async (userId) => {
    try {
      await axiosInstance.post("/friends/request", { userId });
      toast.success("Friend request sent");
      fetchAll();
      socket?.emit("friendUpdate");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send request");
    }
  };
  const acceptRequest = async (requesterId) => {
    try {
      await axiosInstance.post("/friends/accept", { requesterId });
      toast.success("Friend request accepted");
      fetchAll();
      socket?.emit("friendUpdate");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to accept request");
    }
  };
  const cancelRequest = async (userId) => {
    try {
      await axiosInstance.post("/friends/cancel", { userId });
      toast.success("Friend request cancelled");
      fetchAll();
      socket?.emit("friendUpdate");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to cancel request");
    }
  };
  const removeFriend = async (userId) => {
    try {
      await axiosInstance.post("/friends/remove", { userId });
      toast.success("Friend removed");
      fetchAll();
      socket?.emit("friendUpdate");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to remove friend");
    }
  };
  const blockUser = async (blockUserId) => {
    try {
      await axiosInstance.post("/block", { blockUserId });
      toast.success("User blocked");
      fetchAll();
      socket?.emit("friendUpdate");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to block user");
    }
  };
  const unblockUser = async (unblockUserId) => {
    try {
      await axiosInstance.post("/unblock", { unblockUserId });
      toast.success("User unblocked");
      fetchAll();
      socket?.emit("friendUpdate");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to unblock user");
    }
  };

  // Helper to get user status
  const getStatus = (user) => {
    if (blocked.some(b => b._id === user._id)) return "blocked";
    if (friends.some(f => f._id === user._id)) return "friend";
    if (requests.some(r => r._id === user._id)) return "request";
    if (user.friendRequests?.includes(authUser?._id)) return "sent";
    return "none";
  };

  // Filtered users by search
  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-80 bg-base-200 p-4 h-full flex flex-col gap-6 overflow-y-auto">
      <div className="mb-2">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <form
          onSubmit={async e => {
            e.preventDefault();
            if (!groupName.trim()) return;
            try {
              await axiosInstance.post("/friends/groups", { name: groupName });
              toast.success("Group created");
              // Refetch groups from backend
              const friendsRes = await axiosInstance.get("/friends");
              setGroups(friendsRes.data.groups || []);
              setGroupName("");
            } catch (err) {
              toast.error(err.response?.data?.message || "Failed to create group");
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            className="input input-sm input-bordered flex-1"
            placeholder="New group name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
          <button className="btn btn-sm btn-primary" type="submit">Add</button>
        </form>
        <div className="mt-2 flex flex-col gap-2">
          {groups.map(g => (
            <div key={g.name} className="flex items-center gap-2">
              <span className="badge badge-outline flex-1">{g.name}</span>
              <button className="btn btn-xs btn-outline" onClick={() => setModal({ type: 'groupMembers', group: g })}>Manage</button>
            </div>
          ))}
        </div>
    {/* Group Members Modal */}
    {modal.type === 'groupMembers' && modal.group && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-base-100 p-6 rounded shadow-lg w-96 relative">
          <button className="absolute top-2 right-2 btn btn-xs" onClick={() => setModal({ type: null, group: null })}>✕</button>
          <h3 className="text-lg font-bold mb-2">Manage Members: {modal.group.name}</h3>
          <div className="mb-2">
            <div className="font-semibold mb-1">Current Members:</div>
            {groupMembers.length === 0 && <div className="text-gray-400 text-sm mb-2">No members yet.</div>}
            {groupMembers.map(memberId => {
              const member = users.find(u => u._id === memberId);
              return member ? (
                <div key={member._id} className="flex items-center gap-2 mb-1">
                  <img src={member.profilePic || '/avatar.png'} alt="" className="w-6 h-6 rounded-full" />
                  <span className="flex-1">{member.fullName}</span>
                  <button className="btn btn-xs btn-error" disabled={groupMembersLoading} onClick={() => handleRemoveMember(member._id)}>Remove</button>
                </div>
              ) : null;
            })}
          </div>
          <div className="mb-2">
            <div className="font-semibold mb-1">Add User:</div>
            {users.filter(u => !groupMembers.includes(u._id)).length === 0 && <div className="text-gray-400 text-sm">No users to add.</div>}
            {users.filter(u => !groupMembers.includes(u._id)).map(u => (
              <div key={u._id} className="flex items-center gap-2 mb-1">
                <img src={u.profilePic || '/avatar.png'} alt="" className="w-6 h-6 rounded-full" />
                <span className="flex-1">{u.fullName}</span>
                <button className="btn btn-xs btn-success" disabled={groupMembersLoading} onClick={() => handleAddMember(u._id)}>Add</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
      </div>
      <h2 className="font-bold text-lg mb-2">All Users</h2>
      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error}</div>
      ) : (
        filteredUsers.length === 0 ? <p className="text-gray-400">No users found.</p> :
        filteredUsers.map((user) => {
          const status = getStatus(user);
          return (
            <div key={user._id} className="flex items-center gap-3 mb-2 p-2 rounded hover:bg-base-300 transition">
              <input type="checkbox" className="checkbox checkbox-xs mr-1" checked={bulkSelected.includes(user._id)} onChange={e => {
                setBulkSelected(e.target.checked ? [...bulkSelected, user._id] : bulkSelected.filter(id => id !== user._id));
              }} />
              <img src={user.profilePic || "/avatar.png"} alt="" className="w-8 h-8 rounded-full cursor-pointer" onClick={() => openProfileModal(user)} />
              <span className="truncate flex-1 cursor-pointer" onClick={() => openProfileModal(user)}>{user.fullName}</span>
              {/* Activity status (simulate) */}
              <span className="text-xs text-gray-400 ml-2">{user.isOnline ? "Online" : user.lastSeen ? `Last seen: ${new Date(user.lastSeen).toLocaleString()}` : "Offline"}</span>
              {/* ...existing status/action buttons... */}
              {status === "friend" && (
                <>
                  <span className="text-green-500 text-xs font-semibold mr-2">Friend</span>
                  <button className="btn btn-xs btn-outline btn-error" title="Remove Friend" onClick={() => removeFriend(user._id)}><UserMinus size={16} /></button>
                  <button className="btn btn-xs btn-outline btn-warning ml-1" title="Block" onClick={() => blockUser(user._id)}><Ban size={16} /></button>
                </>
              )}
              {status === "request" && (
                <>
                  <button className="btn btn-xs btn-success" title="Accept" onClick={() => acceptRequest(user._id)}><UserCheck size={16} /></button>
                  <button className="btn btn-xs btn-outline btn-error ml-1" title="Block" onClick={() => blockUser(user._id)}><Ban size={16} /></button>
                </>
              )}
              {status === "sent" && (
                <>
                  <span className="text-blue-500 text-xs font-semibold mr-2">Pending</span>
                  <button className="btn btn-xs btn-outline btn-error" title="Cancel Request" onClick={() => cancelRequest(user._id)}><MailX size={16} /></button>
                </>
              )}
              {status === "blocked" && (
                <button className="btn btn-xs btn-outline btn-success" title="Unblock" onClick={() => unblockUser(user._id)}><UserPlus size={16} /></button>
              )}
              {/* Block with reason */}
              <button className="btn btn-xs btn-outline btn-error ml-1" title="Block with reason" onClick={() => setModal({ type: "blockReason", user })}><Ban size={16} /></button>
            </div>
          );
        })
      )}

      {/* Privacy Settings Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded shadow-lg w-96 relative">
            <button className="absolute top-2 right-2 btn btn-xs" onClick={() => setShowPrivacy(false)}>✕</button>
            <h3 className="text-lg font-bold mb-2">Privacy Settings</h3>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" className="checkbox" checked={privacy.canReceiveRequests} onChange={e => setPrivacy(p => ({ ...p, canReceiveRequests: e.target.checked }))} />
              Allow friend requests from anyone
            </label>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" className="checkbox" checked={privacy.showOnlineStatus} onChange={e => setPrivacy(p => ({ ...p, showOnlineStatus: e.target.checked }))} />
              Show my online status
            </label>
            <button className="btn btn-sm btn-primary mt-2" onClick={async () => {
              await axiosInstance.post("/friends/privacy", privacy);
              toast.success("Privacy updated");
              setShowPrivacy(false);
            }}>Save</button>
          </div>
        </div>
      )}

      {/* Block Reason Modal */}
      {modal.type === "blockReason" && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded shadow-lg w-96 relative">
            <button className="absolute top-2 right-2 btn btn-xs" onClick={() => setModal({ type: null, user: null })}>✕</button>
            <h3 className="text-lg font-bold mb-2">Block User</h3>
            <p className="mb-2">Why are you blocking <b>{modal.user.fullName}</b>?</p>
            <textarea className="textarea textarea-bordered w-full mb-2" placeholder="Reason (optional)" value={blockReason} onChange={e => setBlockReason(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button className="btn btn-sm btn-outline" onClick={() => setModal({ type: null, user: null })}>Cancel</button>
              <button className="btn btn-sm btn-error" onClick={async () => {
                await axiosInstance.post("/block-reason", { blockUserId: modal.user._id, reason: blockReason });
                toast.success("User blocked");
                setModal({ type: null, user: null });
                setBlockReason("");
                fetchAll();
                socket?.emit("friendUpdate");
              }}>Block</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulk && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded shadow-lg w-96 relative">
            <button className="absolute top-2 right-2 btn btn-xs" onClick={() => setShowBulk(false)}>✕</button>
            <h3 className="text-lg font-bold mb-2">Bulk Actions</h3>
            <p className="mb-2">Selected: {bulkSelected.length}</p>
            <div className="flex gap-2 mb-2">
              <button className="btn btn-sm btn-error" onClick={async () => {
                await axiosInstance.post("/friends/bulk", { action: "block", userIds: bulkSelected });
                toast.success("Users blocked");
                setShowBulk(false);
                setBulkSelected([]);
                fetchAll();
                socket?.emit("friendUpdate");
              }}>Block</button>
              <button className="btn btn-sm btn-success" onClick={async () => {
                await axiosInstance.post("/friends/bulk", { action: "unblock", userIds: bulkSelected });
                toast.success("Users unblocked");
                setShowBulk(false);
                setBulkSelected([]);
                fetchAll();
                socket?.emit("friendUpdate");
              }}>Unblock</button>
              <button className="btn btn-sm btn-warning" onClick={async () => {
                await axiosInstance.post("/friends/bulk", { action: "removeFriend", userIds: bulkSelected });
                toast.success("Friends removed");
                setShowBulk(false);
                setBulkSelected([]);
                fetchAll();
                socket?.emit("friendUpdate");
              }}>Remove Friend</button>
            </div>
            <button className="btn btn-sm btn-outline mt-2" onClick={() => setShowBulk(false)}>Close</button>
          </div>
        </div>
      )}


    {/* Profile Preview Modal */}
    {modal.type === "profile" && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-base-100 p-6 rounded shadow-lg w-96 relative">
          <button className="absolute top-2 right-2 btn btn-xs" onClick={() => setModal({ type: null, user: null })}>✕</button>
          <img src={modal.user.profilePic || "/avatar.png"} alt="" className="w-20 h-20 rounded-full mx-auto mb-2" />
        </div>
      </div>
    )}
  </aside>
  );
}

export default FriendsSidebar;
