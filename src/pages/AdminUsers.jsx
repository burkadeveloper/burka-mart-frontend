import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => api.get("/admin/users").then((res) => res.data),
  });
  const updateStatus = useMutation({
    mutationFn: ({ userId, status }) =>
      api.put(`/admin/users/${userId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminUsers"]);
      toast.success("User status updated");
    },
  });
  const users = data?.users || [];
  if (isLoading) return <div>Loading users...</div>;
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">User Management</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th>Email</th>
              <th>Role</th>
              <th>Seller</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 text-sm">{user.name}</td>
                <td className="px-6 py-4 text-sm">{user.email}</td>
                <td className="px-6 py-4 text-sm capitalize">{user.role}</td>
                <td className="px-6 py-4 text-sm">
                  {user.isSeller ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      updateStatus.mutate({
                        userId: user._id,
                        status:
                          user.status === "active" ? "suspended" : "active",
                      })
                    }
                    className={`px-3 py-1 text-sm rounded ${user.status === "active" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}
                  >
                    {user.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
