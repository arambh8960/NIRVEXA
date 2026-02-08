import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore } from "react-icons/fa6"
import { FaLocationDot } from "react-icons/fa6"
import { FaArrowLeft } from "react-icons/fa"
import MaterialCard from '../components/MaterialCard'

function Shop() {
  const { shopId } = useParams()
  const [items, setItems] = useState([])
  const [shop, setShop] = useState(null)
  const navigate = useNavigate()

  const fetchShop = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/item/get-by-shop/${shopId}`,
        { withCredentials: true }
      )
      setShop(res.data.shop)
      setItems(res.data.items)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchShop()
  }, [shopId])

  return (
    <div className='min-h-screen bg-[#fff9f6]'>

      {/* Back Button */}
      <button
        className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-full shadow'
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* Shop Banner */}
      {shop && (
        <div className='relative w-full h-64 md:h-80'>
          <img
            src={shop.image}
            alt={shop.name}
            className='w-full h-full object-cover'
          />

          <div className='absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center px-4'>
            <FaStore className='text-white text-4xl mb-3' />
            <h1 className='text-3xl md:text-4xl font-bold text-white'>
              {shop.name}
            </h1>

            <div className='flex items-center gap-2 mt-2 text-gray-200'>
              <FaLocationDot className='text-red-400' />
              <p>{shop.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className='max-w-7xl mx-auto px-6 py-10'>
        <h2 className='text-2xl md:text-3xl font-bold text-center mb-10 text-gray-800'>
          Available Materials
        </h2>

        {items?.length > 0 ? (
          <div className='flex flex-wrap justify-center gap-8'>
            {items.map(item => (
              <MaterialCard key={item._id} data={item} />
            ))}
          </div>
        ) : (
          <p className='text-center text-gray-500 text-lg'>
            No materials available in this shop
          </p>
        )}
      </div>
    </div>
  )
}

export default Shop
