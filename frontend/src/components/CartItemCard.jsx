import React from 'react'
import { FaMinus, FaPlus } from "react-icons/fa"
import { CiTrash } from "react-icons/ci"
import { useDispatch } from 'react-redux'
import { removeCartItem, updateQuantity } from '../redux/userSlice'

function CartItemCard({ data }) {
  const dispatch = useDispatch()

  const handleIncrease = () => {
    dispatch(updateQuantity({
      _id: data._id,
      quantity: data.quantity + 1
    }))
  }

  const handleDecrease = () => {
    if (data.quantity > 1) {
      dispatch(updateQuantity({
        _id: data._id,
        quantity: data.quantity - 1
      }))
    }
  }

  const handleRemove = () => {
    dispatch(removeCartItem(data._id))
  }

  return (
    <div className='flex items-center justify-between bg-white p-4 rounded-xl shadow border'>
      
      {/* Left */}
      <div className='flex items-center gap-4'>
        <img
          src={data.image || "https://via.placeholder.com/150?text=No+Image"}
          alt={data.name}
          className='w-20 h-20 object-cover rounded-lg border'
        />
        <div>
          <h1 className='font-semibold text-gray-800'>{data.name}</h1>
          <p className='text-sm text-gray-500'>
            ₹{data.price} × {data.quantity}
          </p>
          <p className='font-bold text-gray-900'>
            ₹{data.price * data.quantity}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className='flex items-center gap-3'>
        <button
          className='p-2 bg-gray-100 rounded-full hover:bg-gray-200'
          onClick={handleDecrease}
        >
          <FaMinus size={12} />
        </button>

        <span className='font-medium'>{data.quantity}</span>

        <button
          className='p-2 bg-gray-100 rounded-full hover:bg-gray-200'
          onClick={handleIncrease}
        >
          <FaPlus size={12} />
        </button>

        <button
          className='p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200'
          onClick={handleRemove}
        >
          <CiTrash size={18} />
        </button>
      </div>
    </div>
  )
}

export default CartItemCard
