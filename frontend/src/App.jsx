import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import useGetCurrentUser from './hooks/useGetCurrentUser.jsx'
import { useSelector } from 'react-redux'
import Home from './pages/Home.jsx'
import useGetCity from './hooks/useGetCity.jsx'
import useGetMyShop from './hooks/userGetMyShop.jsx'
import CreateEditShop from './pages/CreateEditShop.jsx'
import AddItems from './pages/AddItem.jsx'
import EditItem from './pages/EditItem.jsx'
import useGetShopByCity from './hooks/useGetShopByCity.jsx'

export const serverUrl = "http://localhost:8000";

function App() {
  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  const{userData}=useSelector(state=>state.user)
  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/nirvexaimages/background.png')" }}>
    <Routes>
      
      <Route path="/signin" element={!userData ? <SignIn />:<Navigate to={"/"} />} />
      <Route path="/signup" element={!userData?<SignUp />:<Navigate to={"/"} />}/>
      <Route path="/forgot-password" element={!userData?<ForgotPassword />:<Navigate to={"/"} />}/>
      <Route path="/" element={userData?<Home/>:<Navigate to={"/signin" }/>}/>
      <Route path="/create-edit-shop" element={userData?<CreateEditShop/>:<Navigate to={"/signin" }/>}/>
      <Route path='/add-item' element={userData?<AddItems/>:<Navigate to={"/signin" }/>}/>
      <Route path="*" element={<Navigate to={userData ? "/" : "/signin"} />} />
      <Route path='/edit-item/:itemId' element={userData?<EditItem/>:<Navigate to={"/signin" }/>}/>
      
      
    </Routes>
    </div>
  )
}

export default App
