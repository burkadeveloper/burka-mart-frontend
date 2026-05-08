import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clearCart } from "./cartSlice";

// Async thunk to logout and clear cart
export const logoutAndClearCart = createAsyncThunk(
  "auth/logoutAndClearCart",
  async (_, { dispatch }) => {
    // Clear cart from localStorage and Redux
    dispatch(clearCart());
    // Return nothing; the auth slice will handle its own state reset
    return null;
  },
);

const loadFromStorage = () => {
  try {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return {
      user: user ? JSON.parse(user) : null,
      token: token || null,
      isAuthenticated: !!token,
    };
  } catch (e) {
    return { user: null, token: null, isAuthenticated: false };
  }
};

const initialState = loadFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      const normalizedUser = {
        ...user,
        _id: user._id || user.id,
        id: user.id || user._id,
      };
      state.user = normalizedUser;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Note: cart clearing is handled by the thunk, not here
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutAndClearCart.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
