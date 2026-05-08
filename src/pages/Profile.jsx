import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  useProfile,
  useUpdateProfile,
  useUpdatePassword,
  useUploadProfilePicture,
} from "../api/userApi";
import { useWallet } from "../api/walletApi";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";
import SellerRequestModal from "../components/SellerRequestModal";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Wallet,
  Store,
  Camera,
  Edit2,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  // ========== ALL HOOKS (unconditional) ==========
  const { user: authUser } = useSelector((state) => state.auth);
  const { data, isLoading: profileLoading } = useProfile();
  const { data: walletData, isLoading: walletLoading } = useWallet();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const uploadPicture = useUploadProfilePicture();

  // State hooks
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    subCity: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);

  // Effect – MUST BE BEFORE EARLY RETURN
  useEffect(() => {
    if (data?.user) {
      const profile = data.user;
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        city: profile.location?.city || "",
        subCity: profile.location?.subCity || "",
      });
    }
  }, [data]);

  // ========== EARLY RETURN (after all hooks) ==========
  if (profileLoading || walletLoading) return <LoadingSpinner />;

  const profile = data?.user;
  const wallet = walletData?.wallet;

  // ========== HANDLERS ==========
  const profilePictureUrl = profile?.profilePicture
    ? `http://localhost:5000${profile.profilePicture}`
    : "/default-avatar.png";

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    await uploadPicture.mutateAsync(file);
    setUploading(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateProfile.mutateAsync({
      name: form.name,
      phone: form.phone,
      location: { city: form.city, subCity: form.subCity },
    });
    setIsEditing(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    await updatePassword.mutateAsync({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  // ========== JSX ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            My Account
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your profile and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 text-center sticky top-24">
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center overflow-hidden">
                  <img
                    src={preview || profilePictureUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-700 transition">
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="loader" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold mt-4">{profile?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {profile?.email}
              </p>
              {profile?.isSeller && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Seller
                </span>
              )}
              {profile?.sellerRequestPending && (
                <div className="mt-2 p-2 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Request pending approval
                </div>
              )}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === "profile" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <User size={18} /> Profile
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === "security" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <Lock size={18} /> Security
                </button>
                <button
                  onClick={() => setActiveTab("wallet")}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === "wallet" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <Wallet size={18} /> Wallet
                </button>
                {!profile?.isSeller && !profile?.sellerRequestPending && (
                  <button
                    onClick={() => setShowSellerModal(true)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition mt-2"
                  >
                    <Store size={18} /> Become a Seller
                  </button>
                )}
                {!profile?.isSeller && profile?.sellerRequestPending && (
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 text-gray-500">
                    <Store size={18} /> Request Pending
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                      Personal Information
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                    >
                      {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          disabled={!isEditing}
                          className={`w-full border rounded-lg p-2 ${!isEditing ? "bg-gray-50" : ""}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile?.email}
                          disabled
                          className="w-full border rounded-lg p-2 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          disabled={!isEditing}
                          className={`w-full border rounded-lg p-2 ${!isEditing ? "bg-gray-50" : ""}`}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={form.city}
                            onChange={(e) =>
                              setForm({ ...form, city: e.target.value })
                            }
                            disabled={!isEditing}
                            className={`w-full border rounded-lg p-2 ${!isEditing ? "bg-gray-50" : ""}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Sub City
                          </label>
                          <input
                            type="text"
                            value={form.subCity}
                            onChange={(e) =>
                              setForm({ ...form, subCity: e.target.value })
                            }
                            disabled={!isEditing}
                            className={`w-full border rounded-lg p-2 ${!isEditing ? "bg-gray-50" : ""}`}
                          />
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <div className="mt-6 flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Save size={16} /> Save Changes
                        </button>
                      </div>
                    )}
                  </form>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">
                    Change Password
                  </h2>
                  <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-4 max-w-md"
                  >
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      className="w-full border rounded-lg p-2 dark:bg-gray-700"
                      required
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className="w-full border rounded-lg p-2 dark:bg-gray-700"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className="w-full border rounded-lg p-2 dark:bg-gray-700"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                      Update Password
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "wallet" && (
                <motion.div
                  key="wallet"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">My Wallet</h2>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <p className="text-sm opacity-90">Available Balance</p>
                    <p className="text-4xl font-bold mt-1">
                      ETB {wallet?.balance?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Transaction History</h3>
                    <p className="text-gray-500 text-center py-8">
                      No transactions yet
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Seller Request Modal */}
      {showSellerModal && (
        <SellerRequestModal onClose={() => setShowSellerModal(false)} />
      )}
    </div>
  );
}
