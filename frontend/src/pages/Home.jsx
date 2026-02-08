import React from 'react'
import { useSelector } from 'react-redux'
import CustomerDashboard from '../components/CustomerDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import useUpdateLocation from '../hooks/useUpdateLocation'
import useGetCurrentUser from '../hooks/useGetCurrentUser'

export default function Home() {
  const { userData } = useSelector((state) => state.user)

  // ✅ always call hooks at top level
if (!userData) {
  useGetCurrentUser()
}

  useUpdateLocation() // 👈 condition hook ke andar handle hogi

  return (
    <div className='w-[100vw] min-h-[100vh] flex flex-col items-center bg-[#fff9f6]'>
      {userData?.role === 'user' && <CustomerDashboard />}
      {userData?.role === 'owner' && <OwnerDashboard />}
      {userData?.role === 'deliveryBoy' && <DeliveryBoy />}
    </div>
  )
}
