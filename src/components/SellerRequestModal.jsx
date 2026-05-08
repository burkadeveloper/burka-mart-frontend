import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { X, Upload, Building, User, AlertCircle, Camera } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function SellerRequestModal({ onClose }) {
  const [businessType, setBusinessType] = useState("individual");
  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    nationalIdNumber: "",
    businessName: "",
    registrationNumber: "",
    tinNumber: "",
    businessAddress: "",
    address: "",
    phone: "",
  });
  const [files, setFiles] = useState({});
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const submitRequest = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post("/seller-requests/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Request submitted! Admin will review.");
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Submission failed"),
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      toast.error("Camera access denied or not available");
    }
  };

  const captureAndSubmit = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      canvasRef.current.toBlob(async (blob) => {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(blob));
        // Stop camera stream
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        setCameraActive(false);
        // Auto-submit the form
        await submitFormWithPhoto(file);
      }, "image/jpeg");
    }
  };

  const submitFormWithPhoto = async (selfieFile) => {
    const formData = new FormData();
    formData.append("businessType", businessType);
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });
    Object.keys(files).forEach((key) => {
      if (files[key]) formData.append(key, files[key]);
    });
    if (selfieFile) formData.append("selfie", selfieFile);
    setUploading(true);
    await submitRequest.mutateAsync(formData);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("businessType", businessType);
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });
    Object.keys(files).forEach((key) => {
      if (files[key]) formData.append(key, files[key]);
    });
    if (photo) formData.append("selfie", photo);
    setUploading(true);
    await submitRequest.mutateAsync(formData);
    setUploading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Become a Seller</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Business Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBusinessType("individual")}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition ${
                  businessType === "individual"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <User size={18} /> Individual
              </button>
              <button
                type="button"
                onClick={() => setBusinessType("shop")}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition ${
                  businessType === "shop"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <Building size={18} /> Shop/Business
              </button>
            </div>
          </div>

          {businessType === "individual" ? (
            <>
              <div>
                <label>Full Name *</label>
                <input
                  name="fullName"
                  required
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>National ID Number *</label>
                <input
                  name="nationalIdNumber"
                  required
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>Residential Address</label>
                <input
                  name="address"
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>Phone Number</label>
                <input
                  name="phone"
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>National ID (upload) *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "nationalId")}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label>Passport (optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "passport")}
                  className="w-full"
                />
              </div>
              <div>
                <label>Utility Bill (proof of address)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "utilityBill")}
                  className="w-full"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label>Business Name *</label>
                <input
                  name="businessName"
                  required
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>Registration Number *</label>
                <input
                  name="registrationNumber"
                  required
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>TIN Number *</label>
                <input
                  name="tinNumber"
                  required
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>Business Address *</label>
                <input
                  name="businessAddress"
                  required
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>Contact Phone</label>
                <input
                  name="phone"
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                />
              </div>
              <div>
                <label>Business License (upload) *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "businessLicense")}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label>TIN Certificate (upload) *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "tinCertificate")}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label>Utility Bill (optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "utilityBill")}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Camera Capture Section with Auto-Submit */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Camera size={18} /> Take a Selfie / Live Photo (required)
            </label>
            {!cameraActive && !photoPreview && (
              <button
                type="button"
                onClick={startCamera}
                className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Camera size={16} /> Start Camera
              </button>
            )}
            {cameraActive && (
              <div className="mt-2">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg border"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={captureAndSubmit}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Capture & Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraActive(false);
                      videoRef.current.srcObject
                        ?.getTracks()
                        .forEach((t) => t.stop());
                    }}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {photoPreview && !cameraActive && (
              <div className="mt-2">
                <img
                  src={photoPreview}
                  alt="Captured"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
                <p className="text-xs text-green-600 mt-1">
                  Photo captured. Submitting form...
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 flex gap-2">
            <AlertCircle size={16} /> Your application will be reviewed
            manually. You'll receive notifications.
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {uploading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
