import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useChapaPayment } from "../hooks/useChapaPayment";
import { useGeolocation } from "../hooks/useGeolocation";
import { useSellerLocation } from "../api/locationApi";
import api from "../api/axiosClient";
import OrderMap from "../components/OrderMap";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  MapPin,
  Truck,
  CreditCard,
  Shield,
  Navigation,
  ArrowRight,
} from "lucide-react";

export default function Checkout() {
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { mutate: initiatePayment, isLoading } = useChapaPayment();
  const {
    location: rawLocation,
    loading: geoLoading,
    getLocation,
  } = useGeolocation();
  const [isLocating, setIsLocating] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    city: "",
    subCity: "",
    detailedAddress: "",
  });
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [isReversing, setIsReversing] = useState(false);
  const [distance, setDistance] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);

  // Get product details to fetch seller ID and shipping options
  const productId = items[0]?.productId;
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ["checkoutProduct", productId],
    queryFn: () => api.get(`/products/${productId}`).then((res) => res.data),
    enabled: !!productId,
  });
  const sellerId = productData?.product?.seller?._id;
  const { data: sellerLocationData, isLoading: sellerLocLoading } =
    useSellerLocation(sellerId);
  const sellerLocation = sellerLocationData?.location?.coordinates;
  const sellerName = sellerLocationData?.sellerName;
  const product = productData?.product;
  const shippingOptions = product?.shippingOptions || [];

  const baseShippingCost =
    shippingOptions.find((opt) => opt.method === shippingMethod)?.cost || 0;
  const freeDistance = 5; // km
  const costPerKm = 5; // ETB per km

  // Update shipping cost when distance or base cost changes
  useEffect(() => {
    if (distance !== null && distance > freeDistance) {
      const extra = (distance - freeDistance) * costPerKm;
      setShippingCost(baseShippingCost + extra);
    } else {
      setShippingCost(baseShippingCost);
    }
  }, [distance, baseShippingCost]);

  // Auto‑fetch location and reverse geocode when rawLocation changes (only once)
  useEffect(() => {
    if (rawLocation && !deliveryLocation && !isLocating) {
      setDeliveryLocation(rawLocation);
      const reverseGeocode = async () => {
        setIsReversing(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${rawLocation.lat}&lon=${rawLocation.lng}&zoom=18&addressdetails=1`,
          );
          const data = await res.json();
          const address = data.address;
          setShippingAddress((prev) => ({
            ...prev,
            city:
              address.city ||
              address.town ||
              address.village ||
              address.state ||
              "",
            subCity:
              address.suburb || address.neighbourhood || address.district || "",
          }));
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        } finally {
          setIsReversing(false);
        }
      };
      reverseGeocode();
    }
  }, [rawLocation, deliveryLocation, isLocating]);

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (
      !shippingAddress.city ||
      !shippingAddress.subCity ||
      !shippingAddress.detailedAddress
    ) {
      toast.error("Please fill all address fields");
      return;
    }
    setStep(2);
  };

  const handleLocationConfirm = () => {
    if (!deliveryLocation) {
      toast.error("Please select your delivery location on the map");
      return;
    }
    setStep(3);
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    getLocation(); // triggers browser prompt
    let attempts = 0;
    const interval = setInterval(() => {
      if (rawLocation) {
        clearInterval(interval);
        setDeliveryLocation(rawLocation);
        setIsLocating(false);
        toast.success("Location set to your current position");
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${rawLocation.lat}&lon=${rawLocation.lng}&zoom=18&addressdetails=1`,
        )
          .then((res) => res.json())
          .then((data) => {
            const address = data.address;
            setShippingAddress((prev) => ({
              ...prev,
              city:
                address.city ||
                address.town ||
                address.village ||
                address.state ||
                "",
              subCity:
                address.suburb ||
                address.neighbourhood ||
                address.district ||
                "",
            }));
          })
          .catch(console.error);
      } else if (attempts >= 20) {
        clearInterval(interval);
        setIsLocating(false);
        toast.error(
          "Unable to get your location. Please allow location access.",
        );
      }
      attempts++;
    }, 500);
  };

  const handleFinalSubmit = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    if (!deliveryLocation) {
      toast.error("Delivery location not set");
      return;
    }

    const orderData = {
      productId: items[0].productId,
      quantity: items[0].quantity,
      shippingAddress,
      shippingMethod,
      location: deliveryLocation,
      shippingCost, // send calculated shipping cost to backend
    };
    initiatePayment(orderData);
  };

  if (productLoading || sellerLocLoading || geoLoading || isReversing)
    return <LoadingSpinner />;

  const steps = [
    { id: 1, label: "Shipping Address", icon: MapPin },
    { id: 2, label: "Delivery Location", icon: Navigation },
    { id: 3, label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Checkout
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Complete your order in three easy steps
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-8 bg-white dark:bg-gray-800 rounded-full shadow-md px-6 py-3">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${step >= s.id ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}
                >
                  <s.icon size={16} />
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${step >= s.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {s.label}
                </span>
                {idx < steps.length - 1 && (
                  <ArrowRight
                    size={14}
                    className="text-gray-300 dark:text-gray-600"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Card */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Shipping Address
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Where should we deliver your order?
                  </p>
                  <form onSubmit={handleAddressSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Sub City / Area"
                        value={shippingAddress.subCity}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            subCity: e.target.value,
                          })
                        }
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <textarea
                      placeholder="Detailed Address (street, building, apartment number)"
                      value={shippingAddress.detailedAddress}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          detailedAddress: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Delivery Location
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Set the exact point where you want your order delivered.
                  </p>
                  <OrderMap
                    sellerLocation={sellerLocation}
                    sellerName={sellerName}
                    deliveryLocation={deliveryLocation}
                    onDeliveryLocationChange={setDeliveryLocation}
                    onUseCurrentLocation={handleUseCurrentLocation}
                    isLocating={isLocating}
                    onDistanceChange={setDistance}
                  />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleLocationConfirm}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Shipping & Payment
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Choose how you want your order shipped.
                  </p>
                  <div className="space-y-4 mb-8">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.method}
                        className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${shippingMethod === opt.method ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={opt.method}
                          checked={shippingMethod === opt.method}
                          onChange={() => setShippingMethod(opt.method)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <span className="capitalize font-semibold">
                            {opt.method}
                          </span>
                          <p className="text-sm text-gray-500">
                            {opt.estimatedDays} days
                          </p>
                        </div>
                        <span className="font-bold text-lg">
                          Base ETB {opt.cost}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CreditCard size={18} /> Payment Method
                    </h3>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <img
                        src="/chapa-logo.svg"
                        alt="Chapa"
                        className="h-8"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <span>Chapa (TeleBirr, CBE Birr, Cards)</span>
                      <Shield size={16} className="text-green-500 ml-auto" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.title} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ETB {item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span>ETB {totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Shipping
                  </span>
                  <span>ETB {shippingCost.toLocaleString()}</span>
                </div>
                {distance !== null && distance > freeDistance && (
                  <div className="text-xs text-gray-500 text-right">
                    (Base + {((distance - freeDistance) * costPerKm).toFixed(0)}{" "}
                    ETB for extra {(distance - freeDistance).toFixed(1)} km)
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">
                    ETB {(totalAmount + shippingCost).toLocaleString()}
                  </span>
                </div>
              </div>
              {step === 3 && (
                <button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {isLoading
                    ? "Processing..."
                    : `Pay ETB ${(totalAmount + shippingCost).toLocaleString()} via Chapa`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
