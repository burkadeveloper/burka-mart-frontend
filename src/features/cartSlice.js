import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => {
  try {
    const stored = localStorage.getItem("cart");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // Validate each item has required fields and numbers are valid
    return parsed
      .filter(
        (item) =>
          item.productId &&
          typeof item.title === "string" &&
          typeof item.price === "number" &&
          !isNaN(item.price) &&
          typeof item.quantity === "number" &&
          !isNaN(item.quantity) &&
          item.quantity > 0,
      )
      .map((item) => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));
  } catch (e) {
    console.error("Failed to load cart:", e);
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const recalcTotals = (items) => {
  const totalQuantity = items.reduce((sum, item) => {
    const qty = Number(item.quantity);
    return sum + (isNaN(qty) ? 0 : qty);
  }, 0);
  const totalAmount = items.reduce((sum, item) => {
    const price = Number(item.price);
    const qty = Number(item.quantity);
    return sum + (isNaN(price) || isNaN(qty) ? 0 : price * qty);
  }, 0);
  return { totalQuantity, totalAmount };
};

const initialState = {
  items: loadCart(),
  ...recalcTotals([]),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const {
        productId,
        title,
        price,
        image,
        quantity = 1,
        stock = Infinity,
      } = action.payload;
      if (!productId || typeof price !== "number" || isNaN(price) || price <= 0)
        return;
      const existing = state.items.find((i) => i.productId === productId);
      const addQty = Math.max(1, Number(quantity) || 1);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + addQty;
      // Cap at stock
      const cappedQty = Math.min(newQty, stock);
      if (existing) {
        existing.quantity = cappedQty;
        existing.price = price;
      } else {
        state.items.push({
          productId,
          title: title || "Unknown",
          price,
          image: image || "",
          quantity: cappedQty,
          stock,
        });
      }
      const totals = recalcTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      const totals = recalcTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalAmount = totals.totalAmount;
      saveCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity, stock } = action.payload;
      let newQty = Math.max(1, Number(quantity) || 1);
      if (stock && newQty > stock) newQty = stock;
      const item = state.items.find((i) => i.productId === productId);
      if (item) {
        item.quantity = newQty;
        const totals = recalcTotals(state.items);
        state.totalQuantity = totals.totalQuantity;
        state.totalAmount = totals.totalAmount;
        saveCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      saveCart([]);
    },
    // New: update stock for an item (e.g., after fetching product)
    updateItemStock: (state, action) => {
      const { productId, stock } = action.payload;
      const item = state.items.find((i) => i.productId === productId);
      if (item) {
        item.stock = stock;
        if (item.quantity > stock) {
          item.quantity = stock;
          const totals = recalcTotals(state.items);
          state.totalQuantity = totals.totalQuantity;
          state.totalAmount = totals.totalAmount;
          saveCart(state.items);
        }
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  updateItemStock,
} = cartSlice.actions;
export default cartSlice.reducer;
