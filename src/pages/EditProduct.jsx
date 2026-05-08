import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct, useUpdateProduct, useCategories } from "../api/productApi";
import { motion } from "framer-motion";
import { Plus, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { getImageUrl } from "../utils/imageHelper";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();
  const { data: categoriesData } = useCategories();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    quantity: 1,
    location: { city: "", subCity: "" },
    shippingOptions: [{ method: "standard", cost: "", estimatedDays: 3 }],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data?.product) {
      const p = data.product;
      setForm({
        title: p.title,
        description: p.description,
        price: p.price,
        category: p.category?._id || "",
        quantity: p.quantity,
        location: p.location || { city: "", subCity: "" },
        shippingOptions: p.shippingOptions || [
          { method: "standard", cost: "", estimatedDays: 3 },
        ],
      });
      setExistingImages(p.images || []);
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
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
    const totalAfterAdd =
      existingImages.length + newImages.length + files.length;
    if (totalAfterAdd > 5) {
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

    setNewImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index) => {
    const imgToRemove = existingImages[index];
    setRemovedImages((prev) => [...prev, imgToRemove]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title required";
    if (!form.description.trim())
      newErrors.description = "Description required";
    if (!form.price || parseFloat(form.price) <= 0)
      newErrors.price = "Valid price required";
    if (!form.category) newErrors.category = "Category required";
    if (parseInt(form.quantity) < 1)
      newErrors.quantity = "Quantity must be at least 1";
    if (!form.location.city) newErrors.city = "City required";
    form.shippingOptions.forEach((opt, idx) => {
      if (!opt.cost || parseFloat(opt.cost) < 0)
        newErrors[`shipping_${idx}`] = "Valid cost required";
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
    formData.append("existingImages", JSON.stringify(existingImages));
    formData.append("removedImages", JSON.stringify(removedImages));

    newImages.forEach((image) => {
      formData.append("images", image);
    });

    try {
      await updateProduct.mutateAsync({ id, data: formData });
      toast.success("Product updated successfully");
      navigate("/my-products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  const categories = categoriesData?.categories || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Edit Product</h1>
          <p className="text-blue-100 text-sm">
            Update your product information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
              required
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Price & Quantity */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (ETB) *
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                className={`w-full border rounded-lg p-3 ${errors.price ? "border-red-500" : ""}`}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                className={`w-full border rounded-lg p-3 ${errors.quantity ? "border-red-500" : ""}`}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 ${errors.category ? "border-red-500" : ""}`}
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

          {/* Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                type="text"
                value={form.location.city}
                onChange={(e) => handleLocationChange("city", e.target.value)}
                className={`w-full border rounded-lg p-3 ${errors.city ? "border-red-500" : ""}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sub City</label>
              <input
                type="text"
                value={form.location.subCity}
                onChange={(e) =>
                  handleLocationChange("subCity", e.target.value)
                }
                className="w-full border rounded-lg p-3"
              />
            </div>
          </div>

          {/* Shipping Options */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium">
                Shipping Options
              </label>
              <button
                type="button"
                onClick={addShippingOption}
                className="text-blue-600 text-sm flex items-center gap-1"
              >
                <Plus size={16} /> Add Option
              </button>
            </div>
            <div className="space-y-3">
              {form.shippingOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
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
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images Management */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Images (Max 5)
            </label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Current Images:</p>
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={getImageUrl(img)}
                        alt=""
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">New Images to Add:</p>
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt=""
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="edit-upload"
              />
              <label
                htmlFor="edit-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">
                  Add more images (max 5 total)
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              You can add up to 5 images total.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/my-products")}
              className="flex-1 px-6 py-3 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Update Product
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
