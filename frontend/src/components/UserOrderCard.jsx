import React from 'react'
import { useNavigate } from 'react-router-dom'

function UserOrderCard({ data }) {
  const navigate = useNavigate()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-GB', {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4'>
      
      {/* Order Header */}
      <div className='flex justify-between border-b pb-2'>
        <div>
          <p className='font-semibold'>
            Order #{data._id.slice(-6)}
          </p>
          <p className='text-sm text-gray-500'>
            Date: {formatDate(data.createdAt)}
          </p>
        </div>

        <div className='text-right'>
          {data.paymentMethod === "cod" ? (
            <p className='text-sm text-gray-500'>
              {data.paymentMethod.toUpperCase()}
            </p>
          ) : (
            <p className='text-sm text-gray-500 font-semibold'>
              Payment: {data.payment ? "Paid" : "Pending"}
            </p>
          )}

          <p className='font-medium text-blue-600'>
            {data.shopOrders?.[0]?.status}
          </p>
        </div>
      </div>

      {/* Shop Orders */}
      {data.shopOrders.map((shopOrder, index) => (
        <div
          key={shopOrder._id || index}
          className='border rounded-lg p-3 bg-[#fffaf7] space-y-3'
        >
          <p className='font-medium'>{shopOrder.shop.name}</p>

          {/* Items */}
          <div className='flex space-x-4 overflow-x-auto pb-2'>
            {shopOrder.shopOrderItems.map((item) => (
              <div
                key={item._id}
                className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'
              >
                <img
                  src={item.item.image}
                  alt={item.name}
                  className='w-full h-24 object-cover rounded'
                />

                <p className='text-sm font-semibold mt-1'>
                  {item.name}
                </p>

                <p className='text-xs text-gray-500'>
                  Qty: {item.quantity} × ₹{item.price}
                </p>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className='flex justify-between items-center border-t pt-2'>
            <p className='font-semibold'>
              Subtotal: ₹{shopOrder.subtotal}
            </p>
            <span className='text-sm font-medium text-blue-600'>
              {shopOrder.status}
            </span>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className='flex justify-between items-center border-t pt-2'>
        <p className='font-semibold'>
          Total: ₹{data.totalAmount}
        </p>
        <button
          className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm'
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          Track Order
        </button>
      </div>

    </div>
  )
}

export default UserOrderCard
