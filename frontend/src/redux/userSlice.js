import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    loading: true,

    currentCity: null,
    currentState: null,
    currentAddress: null,

    shopInMyCity: null,
    itemsInMyCity: null,

    cartItems: [],
    totalAmount: 0,

    myOrders: [],
    searchItems: null,

    socket: null
  },

  reducers: {
    /* ================= AUTH ================= */
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.loading = false;
    },

    clearUserData: (state) => {
      state.userData = null;
      state.loading = false;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /* ================= LOCATION ================= */
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },

    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },

    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },

    /* ================= SHOPS & ITEMS ================= */
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },

    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },

    /* ================= CART (🔥 FIXED) ================= */
    addToCart: (state, action) => {
      const itemToAdd = action.payload;

      // Use item's `_id` as the unique identifier for consistency.
      const existingItem = state.cartItems.find(
        (i) => i._id === itemToAdd._id
      );

      if (existingItem) {
        existingItem.quantity += itemToAdd.quantity;
        // 🔥 FIX: Update details in case they were missing or changed (e.g. image)
        existingItem.image = itemToAdd.image;
        existingItem.name = itemToAdd.name;
        existingItem.price = itemToAdd.price;
      } else {
        state.cartItems.push(itemToAdd);
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );
    },

    updateQuantity: (state, action) => {
      const { _id, quantity } = action.payload;

      const item = state.cartItems.find((i) => i._id === _id);
      if (item) {
        item.quantity = quantity;
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );
    },

    removeCartItem: (state, action) => {
      const _idToRemove = action.payload;

      state.cartItems = state.cartItems.filter((i) => i._id !== _idToRemove);

      state.totalAmount = state.cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );
    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },

    /* ================= ORDERS ================= */
    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },

    addMyOrder: (state, action) => {
      if (Array.isArray(state.myOrders)) {
        state.myOrders = [action.payload, ...state.myOrders];
      } else {
        state.myOrders = [action.payload];
      }
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;

      const order = state.myOrders.find(o => o._id === orderId);
      if (!order) return;

      const shopOrder = order.shopOrders?.find(
        so => so.shop._id === shopId
      );

      if (shopOrder) {
        shopOrder.status = status;
      }
    },

    cancelMyOrder: (state, action) => {
      const { orderId, shopId } = action.payload;
      const order = state.myOrders.find(o => o._id === orderId);
      if (order) {
        const shopOrder = order.shopOrders.find(
          so => so.shop._id === shopId
        );
        if (shopOrder) {
          shopOrder.status = "cancelled";
        }
      }
    },

    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;

      const order = state.myOrders.find(o => o._id === orderId);
      if (!order) return;

      const shopOrder = order.shopOrders.find(
        so => so.shop._id === shopId
      );

      if (shopOrder) {
        shopOrder.status = status;
      }
    },

    /* ================= SOCKET ================= */
    setSocket: (state, action) => {
      if (!state.socket) {
        state.socket = action.payload;
      }
    }
  }
});

/* ================= EXPORTS ================= */
export const {
  setUserData,
  clearUserData,
  setLoading,

  setCurrentCity,
  setCurrentState,
  setCurrentAddress,

  setShopsInMyCity,
  setItemsInMyCity,
  setSearchItems,

  addToCart,
  updateQuantity,
  removeCartItem,
  setTotalAmount,

  setMyOrders,
  addMyOrder,
  updateOrderStatus,
  cancelMyOrder,
  updateRealtimeOrderStatus,

  setSocket
} = userSlice.actions;

export default userSlice.reducer;
