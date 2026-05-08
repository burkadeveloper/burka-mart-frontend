import { useSelector } from "react-redux";
import {
  useSellerDashboard,
  useBuyerDashboard,
  useActivityFeed,
} from "../api/dashboardApi";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const isSeller = user?.isSeller;

  const { data: sellerData, isLoading: sellerLoading } = useSellerDashboard();
  const { data: buyerData, isLoading: buyerLoading } = useBuyerDashboard();
  const { data: activityData, isLoading: activityLoading } = useActivityFeed();

  if (isSeller && sellerLoading) return <LoadingSpinner />;
  if (!isSeller && buyerLoading) return <LoadingSpinner />;
  if (activityLoading) return <LoadingSpinner />;

  if (isSeller) {
    const dashboard = sellerData?.dashboard || {};
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            Total Sales: {dashboard.totalSales || 0}
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            Pending Orders: {dashboard.pendingOrders || 0}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="font-bold mb-2">Recent Activity</h2>
          {activityData?.activity?.recentOrders?.slice(0, 5).map((order) => (
            <div key={order._id} className="border-b py-2">
              Order #{order._id} – {order.status}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const dashboard = buyerData?.dashboard || {};
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Buyer Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        Total Orders: {dashboard.totalOrders || 0}
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="font-bold mb-2">Recent Activity</h2>
        {activityData?.activity?.recentOrders?.slice(0, 5).map((order) => (
          <div key={order._id} className="border-b py-2">
            Order #{order._id} – {order.status}
          </div>
        ))}
      </div>
    </div>
  );
}
