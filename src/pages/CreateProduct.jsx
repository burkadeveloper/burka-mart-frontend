import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProduct } from "../api/productApi";
import { useCategories } from "../api/productApi";
import { motion } from "framer-motion";
import { Plus, Trash2, Upload, X, MapPin, Loader } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function CreateProduct() {
  const navigate = useNavigate();
  const { mutateAsync: createProduct, isLoading: isCreating } =
    useCreateProduct();
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    quantity: 1,
    location: {
      city: "",
      subCity: "",
      woreda: "",
      coordinates: { lat: "", lng: "" },
    },
    shippingOptions: [{ method: "standard", cost: "", estimatedDays: 3 }],
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [gettingLocation, setGettingLocation] = useState(false);

  const categories =
    categoriesData?.categories || categoriesData?.data?.categories || [];

  // Helper to reverse geocode (lat/lng → city/subCity)
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      );
      const data = await response.json();
      const address = data.address;
      return {
        city:
          address.city ||
          address.town ||
          address.village ||
          address.state ||
          "",
        subCity:
          address.suburb || address.neighbourhood || address.district || "",
      };
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      return { city: "", subCity: "" };
    }
  };

  // Get current location using browser Geolocation API
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Reverse geocode to get city and subCity
        const { city, subCity } = await reverseGeocode(latitude, longitude);
        setForm((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            city: city || prev.location.city,
            subCity: subCity || prev.location.subCity,
            coordinates: { lat: latitude, lng: longitude },
          },
        }));
        toast.success("Location captured! You can still edit the address.");
        setGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let message = "Unable to get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message += "Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message += "Request timed out.";
            break;
        }
        toast.error(message);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLocationChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const handleCoordinateChange = (coord, value) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [coord]: parseFloat(value) || "",
        },
      },
    }));
  };

  const handleShippingChange = (index, field, value) => {
    const updated = [...form.shippingOptions];
    updated[index][field] = field === "cost" ? parseFloat(value) || 0 : value;
    setForm((prev) => ({ ...prev, shippingOptions: updated }));
  };

  const addShippingOption = () => {
    setForm((prev) => ({
      ...prev,
      shippingOptions: [
        ...prev.shippingOptions,
        { method: "standard", cost: "", estimatedDays: 3 },
      ],
    }));
  };

  const removeShippingOption = (index) => {
    if (form.shippingOptions.length === 1) {
      toast.error("At least one shipping option required");
      return;
    }
    const updated = form.shippingOptions.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, shippingOptions: updated }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
      ].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) toast.error(`${file.name} is not a valid image type`);
      if (!isValidSize) toast.error(`${file.name} exceeds 5MB`);
      return isValidType && isValidSize;
    });

    setImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.price) newErrors.price = "Price is required";
    if (parseFloat(form.price) <= 0)
      newErrors.price = "Price must be greater than 0";
    if (!form.category) newErrors.category = "Category is required";
    if (parseInt(form.quantity) < 1)
      newErrors.quantity = "Quantity must be at least 1";
    if (!form.location.city) newErrors.city = "City is required";
    if (!form.location.coordinates.lat || !form.location.coordinates.lng) {
      newErrors.coordinates =
        "Please set product location (use current location or enter manually)";
    }
    form.shippingOptions.forEach((opt, idx) => {
      if (!opt.cost || parseFloat(opt.cost) < 0) {
        newErrors[`shipping_${idx}`] = "Valid cost required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix form errors");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("price", parseFloat(form.price));
    formData.append("category", form.category);
    formData.append("quantity", parseInt(form.quantity));
    formData.append("location", JSON.stringify(form.location));
    formData.append("shippingOptions", JSON.stringify(form.shippingOptions));

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await createProduct(formData);
      toast.success("Product created successfully!");
      navigate("/my-products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    }
  };

  if (categoriesLoading) return <LoadingSpinner />;
  if (categoriesError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-600 font-semibold mb-2">
            Failed to load categories
          </h2>
          <p className="text-gray-600">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">List a New Product</h1>
          <p className="text-blue-100 text-sm">
            Fill in the details below to start selling
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"}`}
              placeholder="e.g., Premium Cotton T-Shirt"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-500" : "border-gray-300"}`}
              placeholder="Describe your product in detail..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Price & Quantity */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (ETB) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full border rounded-lg p-3 ${errors.price ? "border-red-500" : "border-gray-300"}`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full border rounded-lg p-3 ${errors.quantity ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 ${errors.category ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Location with Geolocation */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Product Location
              </label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                {gettingLocation ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <MapPin size={16} />
                )}
                {gettingLocation
                  ? "Getting location..."
                  : "Use my current location"}
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={form.location.city}
                onChange={(e) => handleLocationChange("city", e.target.value)}
                className={`border rounded-lg p-3 ${errors.city ? "border-red-500" : "border-gray-300"}`}
              />
              <input
                type="text"
                placeholder="Sub City / Area"
                value={form.location.subCity}
                onChange={(e) =>
                  handleLocationChange("subCity", e.target.value)
                }
                className="border border-gray-300 rounded-lg p-3"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Latitude"
                value={form.location.coordinates.lat}
                onChange={(e) => handleCoordinateChange("lat", e.target.value)}
                className="border border-gray-300 rounded-lg p-3"
              />
              <input
                type="text"
                placeholder="Longitude"
                value={form.location.coordinates.lng}
                onChange={(e) => handleCoordinateChange("lng", e.target.value)}
                className="border border-gray-300 rounded-lg p-3"
              />
            </div>
            {errors.coordinates && (
              <p className="text-red-500 text-sm">{errors.coordinates}</p>
            )}
          </div>

          {/* Shipping Options */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Shipping Options
              </label>
              <button
                type="button"
                onClick={addShippingOption}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus size={16} /> Add Option
              </button>
            </div>
            <div className="space-y-3">
              {form.shippingOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg"
                >
                  <select
                    value={opt.method}
                    onChange={(e) =>
                      handleShippingChange(idx, "method", e.target.value)
                    }
                    className="border rounded-lg p-2 flex-1"
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="pickup">Pickup</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Cost (ETB)"
                    value={opt.cost}
                    onChange={(e) =>
                      handleShippingChange(idx, "cost", e.target.value)
                    }
                    className="border rounded-lg p-2 w-32"
                  />
                  <input
                    type="number"
                    placeholder="Days"
                    value={opt.estimatedDays}
                    onChange={(e) =>
                      handleShippingChange(idx, "estimatedDays", e.target.value)
                    }
                    className="border rounded-lg p-2 w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeShippingOption(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-gray-400 text-sm">
                  JPEG, PNG, WEBP up to 5MB each
                </span>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/my-products")}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
