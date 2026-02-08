import React from 'react'
import Nav from './Nav.jsx'
import { useSelector } from 'react-redux'
import { FaWarehouse, FaPlus, FaPen } from "react-icons/fa"
import { useNavigate } from 'react-router-dom'
import OwnerItemCard from './OwnerItemCard'
import useerGetMyShop from '../hooks/userGetMyShop'

function OwnerDashboard() {
  useerGetMyShop()

  const { myShopData } = useSelector(state => state.owner)
  const navigate = useNavigate()

  return (
    <div className='w-full min-h-screen flex flex-col items-center bg-[#fff9f6]'>
      <Nav />

      {/* OFFSET FOR FIXED NAVBAR */}
      <div className="pt-20 w-full flex flex-col items-center">

        {/* ================= NO SHOP ================= */}
        {!myShopData && (
          <div className='flex justify-center items-center p-4 sm:p-6'>
            <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100'>
              <div className='flex flex-col items-center text-center'>
                <FaWarehouse className='text-[#ff4d2d] w-20 h-20 mb-4' />
                <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                  Add Your Material Store
                </h2>
                <p className='text-gray-600 mb-4'>
                  Register your construction material shop and start selling.
                </p>
                <button
                  className='bg-[#ff4d2d] text-white px-6 py-2 rounded-full shadow hover:bg-orange-600'
                  onClick={() => navigate("/create-edit-shop")}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SHOP EXISTS ================= */}
        {myShopData && (
          <div className='w-full flex flex-col items-center gap-6 px-4'>

            {/* HEADER */}
            <h1 className='text-3xl font-bold flex items-center gap-3 mt-6'>
              <FaWarehouse className='text-[#ff4d2d]' />
              {myShopData.name}
            </h1>

            {/* SHOP CARD */}
            <div className='bg-white shadow-lg rounded-xl w-full max-w-3xl relative overflow-hidden'>
              <button
                onClick={() => navigate("/create-edit-shop")}
                className='absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full'
              >
                <FaPen />
              </button>

              <img
                src={myShopData.image}
                alt={myShopData.name}
                className='w-full h-56 object-cover'
              />

              <div className='p-5'>
                <p className='text-gray-600'>
                  {myShopData.address}, {myShopData.city}, {myShopData.state}
                </p>
              </div>
            </div>

            {/* DESKTOP ADD ITEM BUTTON */}
            <div className="hidden md:flex w-full max-w-3xl justify-end">
              <button
                onClick={() => navigate("/add-item")}
                className="flex items-center gap-2 bg-[#ff4d2d] text-white px-5 py-2 rounded-full shadow hover:bg-orange-600"
              >
                <FaPlus />
                Add Item
              </button>
            </div>

            {/* NO ITEMS */}
            {myShopData.items.length === 0 && (
              <p className="text-gray-500 mt-6">
                No items added yet.
              </p>
            )}

            {/* ITEMS LIST */}
            {myShopData.items.length > 0 && (
              <div className='flex flex-col gap-4 w-full max-w-3xl'>
                {myShopData.items.map((item, i) => (
                  <OwnerItemCard key={i} data={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= MOBILE FLOATING ADD BUTTON ================= */}
      {myShopData && (
        <button
          onClick={() => navigate("/add-item")}
          className="
            fixed bottom-6 right-6 
            md:hidden 
            bg-[#ff4d2d] 
            text-white 
            p-4 
            rounded-full 
            shadow-2xl 
            z-[9999]
            active:scale-95
            transition-transform
          "
        >
          <FaPlus className="text-xl" />
        </button>
      )}
    </div>
  )
}

export default OwnerDashboard
