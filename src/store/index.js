import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import cartReducer from "../features/cartSlice";
import uiReducer from "../features/uiSlice";
import themeReducer from "../features/themeSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
    theme: themeReducer,
  },
});
