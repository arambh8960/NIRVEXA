import React, { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { io } from "socket.io-client"

import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import ForgotPassword from "./pages/ForgotPassword"
import Home from "./pages/Home"
import CreateEditShop from "./pages/CreateEditShop"
import AddItems from "./pages/AddItem"
import EditItem from "./pages/EditItem"
import CartPage from "./pages/CartPage"
import CheckOut from "./pages/CheckOut"
import OrderPlaced from "./pages/OrderPlaced"
import MyOrders from "./pages/MyOrders"
import TrackOrderPage from "./pages/TrackOrderPage"

import useGetCity from "./hooks/useGetCity"
import useGetCurrentUser from "./hooks/useGetCurrentUser"

import { setSocket } from "./redux/userSlice"

export const serverUrl = "" // proxy

function App() {
  useGetCity()
  useGetCurrentUser()

  const dispatch = useDispatch()
  const { userData, socket, loading } = useSelector(state => state.user)

  // 🔌 SOCKET — ONLY ONCE
  useEffect(() => {
    // ⛔ wait until auth check finishes
    if (loading) return

    // ⛔ user not logged in
    if (!userData?._id) return

    // ⛔ socket already exists → NO LOOP
    if (socket) return

    const socketInstance = io(serverUrl, {
      withCredentials: true,
      query: {
        userId: userData._id
      }
    })

    dispatch(setSocket(socketInstance))

    return () => {
      socketInstance.disconnect()
    }
  }, [userData?._id, loading]) // 🚨 dispatch & socket removed

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen w-full">
      <Routes>
        <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />

        <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
        <Route path="/create-edit-shop" element={userData ? <CreateEditShop /> : <Navigate to="/signin" />} />
        <Route path="/add-item" element={userData ? <AddItems /> : <Navigate to="/signin" />} />
        <Route path="/edit-item/:itemId" element={userData ? <EditItem /> : <Navigate to="/signin" />} />
        <Route path="/cart" element={userData ? <CartPage /> : <Navigate to="/signin" />} />
        <Route path="/checkout" element={userData ? <CheckOut /> : <Navigate to="/signin" />} />
        <Route path="/order-placed" element={userData ? <OrderPlaced /> : <Navigate to="/signin" />} />
        <Route path="/my-orders" element={userData ? <MyOrders /> : <Navigate to="/signin" />} />
        <Route path="/track-order/:orderId" element={userData ? <TrackOrderPage /> : <Navigate to="/signin" />} />

        <Route path="*" element={<Navigate to={userData ? "/" : "/signin"} />} />
      </Routes>
    </div>
  )
}

export default App
