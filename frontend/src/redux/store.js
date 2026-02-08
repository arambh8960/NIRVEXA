import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import ownerReducer from "./ownerSlice";
import mapReducer from "./mapSlice";

/* ================= CART PERSIST FIX ================= */
// 🔴 Project-specific key (bookstore se conflict nahi hoga)
const CART_KEY = "nirvexa_cart";

/* 🔹 Load cart from localStorage */
const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem(CART_KEY);
    if (!data) return undefined;

    return {
      user: {
        cartItems: JSON.parse(data),
        totalAmount: JSON.parse(data).reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0
        )
      }
    };
  } catch (err) {
    console.error("Failed to load cart", err);
    return undefined;
  }
};

/* 🔹 Save cart to localStorage */
const saveCartToStorage = (state) => {
  try {
    const cartItems = state.user.cartItems;
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  } catch (err) {
    console.error("Failed to save cart", err);
  }
};

/* ================= STORE ================= */
const store = configureStore({
  reducer: {
    user: userReducer,
    owner: ownerReducer,
    map: mapReducer
  },

  preloadedState: loadCartFromStorage(),

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["user.socket"],
        ignoredActions: ["user/setSocket"]
      }
    })
});

/* ================= SUBSCRIBE ================= */
// 🔥 cart change hote hi localStorage update hoga
store.subscribe(() => {
  saveCartToStorage(store.getState());
});

export default store;
