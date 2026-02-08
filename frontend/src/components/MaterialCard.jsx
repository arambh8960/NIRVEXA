import React, { useState } from 'react'
import { FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa"
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/userSlice'

function MaterialCard({ data }) {
  const [quantity, setQuantity] = useState(1)
  const dispatch = useDispatch()

  const { cartItems = [] } = useSelector(state => state.user)

  const handleIncrease = () => setQuantity(q => q + 1)
  const handleDecrease = () => quantity > 1 && setQuantity(q => q - 1)

  // ✅ FIXED: itemId check
  const alreadyInCart = cartItems.some(
    i => i._id === data._id
  )

  const handleAddToCart = () => {
  dispatch(addToCart({
    _id: data._id,
    name: data.name,
    price: data.price,
    image: data.image,
    quantity,
    shop: data.shop
  }))
}


  return (
    <div className='w-[250px] rounded-2xl border border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition flex flex-col'>
      
      <img
        src={data.image}
        alt={data.name}
        className='w-full h-[170px] object-cover'
      />

      <div className="flex-1 flex flex-col p-4 gap-1">
        <h1 className='font-semibold text-gray-900 text-base truncate'>
          {data.name}
        </h1>

        <p className='text-sm text-gray-500 capitalize'>
          {data.category}
        </p>

        <p className='text-xs text-gray-400'>
          {data.unitType}
        </p>
      </div>

      <div className='flex items-center justify-between p-3'>
        <span className='font-bold text-gray-900 text-lg'>
          ₹{data.price}
        </span>

        <div className='flex items-center border rounded-full overflow-hidden'>
          <button onClick={handleDecrease} className='px-2 py-1'>
            <FaMinus size={12} />
          </button>

          <span className='px-2'>{quantity}</span>

          <button onClick={handleIncrease} className='px-2 py-1'>
            <FaPlus size={12} />
          </button>

          <button
            className={`${
              alreadyInCart ? "bg-gray-800" : "bg-[#ff4d2d]"
            } text-white px-3 py-2`}
            onClick={handleAddToCart}
          >
            <FaShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MaterialCard
