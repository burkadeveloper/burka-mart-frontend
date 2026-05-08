import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  User,
  Building,
  RefreshCw,
  Camera,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const getFileUrl = (path) => {
  if (!path) return "#";
  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";
  return `${baseUrl}${path}`;
};

export default function AdminSellerRequests() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionType, setActionType] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["sellerRequests"],
    queryFn: () => api.get("/seller-requests/admin").then((res) => res.data),
    refetchInterval: 30000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, note }) =>
      api.put(`/seller-requests/admin/${id}/status`, {
        status,
        adminNote: note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["sellerRequests"]);
      toast.success("Request updated");
      setSelectedRequest(null);
      setAdminNote("");
      setActionType(null);
    },
  });

  const requests = data?.requests || [];

  const handleAction = (id, status) => {
    if (status === "rejected" || status === "more_info_needed") {
      setActionType(status);
      setSelectedRequest({ _id: id });
      return;
    }
    updateStatus.mutate({ id, status });
  };

  const submitNote = () => {
    if (!adminNote.trim()) {
      toast.error("Please provide a reason/note");
      return;
    }
    updateStatus.mutate({
      id: selectedRequest._id,
      status: actionType,
      note: adminNote,
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Seller Verification Requests</h1>
      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center text-gray-500">
          No requests
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-yellow-500"
            >
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-lg">{req.user?.name}</p>
                  <p className="text-sm text-gray-500">
                    {req.user?.email} | {req.user?.phone}
                  </p>
                  <p className="text-sm mt-1">
                    Type: <span className="capitalize">{req.businessType}</span>
                  </p>
                  {req.businessType === "shop" && (
                    <p className="text-sm">TIN: {req.tinNumber}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted{" "}
                    {formatDistanceToNow(new Date(req.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {req.status === "pending" && (
                    <Clock className="text-yellow-500" size={20} />
                  )}
                  {req.status === "approved" && (
                    <CheckCircle className="text-green-500" size={20} />
                  )}
                  {req.status === "rejected" && (
                    <XCircle className="text-red-500" size={20} />
                  )}
                  {req.status === "more_info_needed" && (
                    <RefreshCw className="text-orange-500" size={20} />
                  )}
                  <span className="capitalize font-medium">{req.status}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(req)}
                className="mt-3 text-blue-600 text-sm flex items-center gap-1 hover:underline"
              >
                <Eye size={14} /> View Full Details
              </button>
              {req.status === "pending" && (
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => handleAction(req._id, "approved")}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req._id, "rejected")}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(req._id, "more_info_needed")}
                    className="bg-orange-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Request More Info
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedRequest && selectedRequest._id && !actionType && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 pb-2">
              <h2 className="text-xl font-bold">
                Verification Request Details
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <strong>Name:</strong> {selectedRequest.user?.name}
              </div>
              <div>
                <strong>Email:</strong> {selectedRequest.user?.email}
              </div>
              <div>
                <strong>Phone:</strong> {selectedRequest.user?.phone}
              </div>
              <div>
                <strong>Business Type:</strong> {selectedRequest.businessType}
              </div>
              {selectedRequest.businessType === "individual" ? (
                <>
                  <div>
                    <strong>Full Name:</strong> {selectedRequest.fullName}
                  </div>
                  <div>
                    <strong>Date of Birth:</strong>{" "}
                    {selectedRequest.dateOfBirth?.split("T")[0]}
                  </div>
                  <div>
                    <strong>National ID Number:</strong>{" "}
                    {selectedRequest.nationalIdNumber}
                  </div>
                  <div>
                    <strong>Residential Address:</strong>{" "}
                    {selectedRequest.address}
                  </div>
                  <div>
                    <strong>Phone (submitted):</strong> {selectedRequest.phone}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong>Business Name:</strong>{" "}
                    {selectedRequest.businessName}
                  </div>
                  <div>
                    <strong>Registration Number:</strong>{" "}
                    {selectedRequest.registrationNumber}
                  </div>
                  <div>
                    <strong>TIN Number:</strong> {selectedRequest.tinNumber}
                  </div>
                  <div>
                    <strong>Business Address:</strong>{" "}
                    {selectedRequest.businessAddress}
                  </div>
                  <div>
                    <strong>Contact Phone:</strong> {selectedRequest.phone}
                  </div>
                </>
              )}
              <div>
                <strong>Uploaded Documents:</strong>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedRequest.documents?.nationalId && (
                  <a
                    href={getFileUrl(selectedRequest.documents.nationalId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 flex items-center gap-1"
                  >
                    <FileText size={14} /> National ID
                  </a>
                )}
                {selectedRequest.documents?.passport && (
                  <a
                    href={getFileUrl(selectedRequest.documents.passport)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 flex items-center gap-1"
                  >
                    <FileText size={14} /> Passport
                  </a>
                )}
                {selectedRequest.documents?.utilityBill && (
                  <a
                    href={getFileUrl(selectedRequest.documents.utilityBill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 flex items-center gap-1"
                  >
                    <FileText size={14} /> Utility Bill
                  </a>
                )}
                {selectedRequest.documents?.businessLicense && (
                  <a
                    href={getFileUrl(selectedRequest.documents.businessLicense)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 flex items-center gap-1"
                  >
                    <FileText size={14} /> Business License
                  </a>
                )}
                {selectedRequest.documents?.tinCertificate && (
                  <a
                    href={getFileUrl(selectedRequest.documents.tinCertificate)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 flex items-center gap-1"
                  >
                    <FileText size={14} /> TIN Certificate
                  </a>
                )}
                {selectedRequest.documents?.selfie && (
                  <a
                    href={getFileUrl(selectedRequest.documents.selfie)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 flex items-center gap-1"
                  >
                    <Camera size={14} /> Selfie / Live Photo
                  </a>
                )}
              </div>
              {selectedRequest.adminNote && (
                <div>
                  <strong>Admin Note:</strong> {selectedRequest.adminNote}
                </div>
              )}
              {selectedRequest.status === "pending" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      handleAction(selectedRequest._id, "approved")
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleAction(selectedRequest._id, "rejected")
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() =>
                      handleAction(selectedRequest._id, "more_info_needed")
                    }
                    className="bg-orange-600 text-white px-4 py-2 rounded"
                  >
                    Request More Info
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {actionType && selectedRequest && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setActionType(null);
            setSelectedRequest(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">
              {actionType === "rejected"
                ? "Reject Request"
                : "Request More Information"}
            </h3>
            <textarea
              placeholder="Provide reason or details..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows="4"
              className="w-full border rounded-lg p-2 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActionType(null);
                  setSelectedRequest(null);
                }}
                className="flex-1 border rounded-lg py-2"
              >
                Cancel
              </button>
              <button
                onClick={submitNote}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
