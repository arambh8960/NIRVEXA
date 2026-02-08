import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';

function CartPage() {
  const navigate = useNavigate()
  const { cartItems, totalAmount } = useSelector(state => state.user)

  return (
    <div className='min-h-screen bg-[#fff9f6] flex justify-center p-6'>
      <div className='w-full max-w-[800px]'>

        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <div onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#ff4d2d] cursor-pointer' />
          </div>
          <h1 className='text-2xl font-bold text-gray-800'>
            Your Material Cart
          </h1>
        </div>

        {/* Empty Cart */}
        {cartItems?.length === 0 ? (
          <div className='bg-white rounded-xl p-6 shadow text-center'>
            <p className='text-gray-500 text-lg'>
              No construction materials added yet
            </p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className='space-y-4'>
              {cartItems.map((item, index) => (
                <CartItemCard data={item} key={index} />
              ))}
            </div>

            {/* Total */}
            <div className='mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border'>
              <h1 className='text-lg font-semibold text-gray-700'>
                Total Amount
              </h1>
              <span className='text-xl font-bold text-[#ff4d2d]'>
                ₹{totalAmount}
              </span>
            </div>

            {/* Checkout */}
            <div className='mt-4 flex justify-center sm:justify-end'>
  <button
    className='w-full sm:w-auto bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition'
    onClick={() => navigate("/checkout")}
  >
    Proceed to Order Materials
  </button>
</div>

          </>
        )}
      </div>
    </div>
  )
}

export default CartPage
