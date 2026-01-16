import React from 'react'
import { useSelector } from 'react-redux'
import CustomerDashboard from '../components/CustomerDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'

export default function Home() {
    const{userData}=useSelector((state)=>state.user)
  return (
    <div className={`w-[100vw] min-h-[100vh] ${userData.role === 'user' ? 'pt-[100px]' : ''} flex flex-col items-center
    bg-[#fff9f6]`}>
     {userData.role==='user'&& <CustomerDashboard/>}
     {userData.role==='owner'&& <OwnerDashboard/>}
     {userData.role==='deliveryBoy'&& <DeliveryBoy/>}
    </div>
  )
}
