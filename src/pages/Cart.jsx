import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  updateItemStock,
} from "../features/cartSlice";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Plus,
  Minus,
  Ticket,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { getImageUrl } from "../utils/imageHelper";

export default function Cart() {
  const { items, totalAmount, totalQuantity } = useSelector(
    (state) => state.cart,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Validate each item's stock on mount and after any quantity change
  useEffect(() => {
    items.forEach(async (item) => {
      try {
        const { data } = await api.get(`/products/${item.productId}`);
        const stock = data.product?.quantity || 0;
        dispatch(updateItemStock({ productId: item.productId, stock }));
      } catch (err) {
        // Product may have been deleted – remove from cart
        dispatch(removeFromCart(item.productId));
        toast.error(
          `${item.title} is no longer available and has been removed.`,
        );
      }
    });
  }, [items, dispatch]);

  const safeTotalAmount = isNaN(totalAmount) ? 0 : totalAmount;
  const safeTotalQuantity = isNaN(totalQuantity) ? 0 : totalQuantity;
  const shippingCost = safeTotalAmount > 0 ? 50 : 0; // flat rate for demo, can be dynamic
  const finalTotal = safeTotalAmount + shippingCost - discount;

  const handleUpdateQuantity = (productId, currentQty, delta, stock) => {
    let newQty = currentQty + delta;
    if (newQty < 1) {
      dispatch(removeFromCart(productId));
      toast.success("Item removed");
    } else if (newQty > stock) {
      toast.error(`Only ${stock} items available in stock`);
      newQty = stock;
      dispatch(updateQuantity({ productId, quantity: newQty, stock }));
    } else {
      dispatch(updateQuantity({ productId, quantity: newQty, stock }));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
    toast.success("Item removed");
  };

  const handleClearCart = () => {
    if (window.confirm("Clear your entire cart?")) {
      dispatch(clearCart());
      toast.success("Cart cleared");
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "save10") {
      setDiscount(safeTotalAmount * 0.1);
      toast.success("Promo code applied! 10% off");
    } else {
      toast.error("Invalid promo code");
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Looks like you haven't added any items yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition shadow-md"
            >
              Start Shopping <ArrowLeft size={18} className="rotate-180" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {safeTotalQuantity} items
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
          >
            <Trash2 size={16} /> Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, idx) => {
                const itemPrice = isNaN(item.price) ? 0 : item.price;
                const itemQty = isNaN(item.quantity) ? 1 : item.quantity;
                const itemStock = item.stock || Infinity;
                const itemTotal = itemPrice * itemQty;
                return (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      <div className="w-28 h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <Link
                              to={`/product/${item.productId}`}
                              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition"
                            >
                              {item.title}
                            </Link>
                            <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                              ETB {itemPrice.toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            ETB {itemTotal.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  itemQty,
                                  -1,
                                  itemStock,
                                )
                              }
                              className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-full transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-4 py-1.5 text-sm font-medium">
                              {itemQty}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.productId,
                                  itemQty,
                                  1,
                                  itemStock,
                                )
                              }
                              className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-full transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                        {itemQty >= itemStock && itemStock !== Infinity && (
                          <p className="text-red-500 text-xs mt-2">
                            Only {itemStock} left in stock
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div className="text-center mt-4">
              <Link
                to="/products"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft size={16} /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({safeTotalQuantity} items)</span>
                  <span>ETB {safeTotalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>ETB {shippingCost.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ETB {discount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between font-bold text-lg py-4">
                <span>Total</span>
                <span className="text-green-600">
                  ETB {finalTotal.toLocaleString()}
                </span>
              </div>

              {/* Promo Code */}
              <div className="mt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-xl transition"
                  >
                    <Ticket size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Try "SAVE10" for 10% off
                </p>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                <CreditCard size={18} /> Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
