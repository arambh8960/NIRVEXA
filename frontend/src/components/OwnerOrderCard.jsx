import axios from 'axios'
import React, { useState } from 'react'
import { MdPhone } from "react-icons/md"
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { updateOrderStatus } from '../redux/userSlice'

function OwnerOrderCard({ data }) {
  const [availableBoys, setAvailableBoys] = useState([])
  const dispatch = useDispatch()

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      )

      dispatch(updateOrderStatus({ orderId, shopId, status }))
      setAvailableBoys(result.data.availableBoys || [])
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>

      {/* Customer Info */}
      <div>
        <h2 className='text-lg font-semibold text-gray-800'>
          {data.user.fullName}
        </h2>
        <p className='text-sm text-gray-500'>{data.user.email}</p>
        <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'>
          <MdPhone /> <span>{data.user.mobile}</span>
        </p>

        {data.paymentMethod === "online" ? (
          <p className='text-sm text-gray-600'>
            Payment: {data.payment ? "Paid" : "Pending"}
          </p>
        ) : (
          <p className='text-sm text-gray-600'>
            Payment Method: {data.paymentMethod}
          </p>
        )}
      </div>

      {/* Address */}
      <div className='flex flex-col gap-1 text-sm text-gray-600'>
        <p>{data?.deliveryAddress?.text}</p>
        <p className='text-xs text-gray-500'>
          Lat: {data?.deliveryAddress?.latitude}, Lon: {data?.deliveryAddress?.longitude}
        </p>
      </div>

      {/* Items */}
      <div className='flex space-x-4 overflow-x-auto pb-2'>
        {data.shopOrders.shopOrderItems.map((item) => (
          <div
            key={item._id}
            className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'
          >
            <img
              src={item.item.image}
              alt={item.name}
              className='w-full h-24 object-cover rounded'
            />
            <p className='text-sm font-semibold mt-1'>{item.name}</p>
            <p className='text-xs text-gray-500'>
              Qty: {item.quantity} × ₹{item.price}
            </p>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className='flex justify-between items-center pt-3 border-t'>
        <span className='text-sm'>
          Status:
          <span className='ml-1 font-semibold capitalize text-[#ff4d2d]'>
            {data.shopOrders.status}
          </span>
        </span>

        {data.shopOrders.status !== 'cancelled' && (
        <select
          className='rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]'
          onChange={(e) =>
            handleUpdateStatus(
              data._id,
              data.shopOrders.shop._id,
              e.target.value
            )
          }
        >
          <option value="">Change</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out Of Delivery</option>
        </select>
        )}
      </div>

      {/* Delivery Boys */}
      {data.shopOrders.status === "out of delivery" && (
        <div className='mt-3 p-2 border rounded-lg text-sm bg-orange-50'>
          {data.shopOrders.assignedDeliveryBoy ? (
            <>
              <p className='font-medium'>Assigned Delivery Boy:</p>
              <div>
                {data.shopOrders.assignedDeliveryBoy.fullName} -{" "}
                {data.shopOrders.assignedDeliveryBoy.mobile}
              </div>
            </>
          ) : availableBoys.length > 0 ? (
            <>
              <p className='font-medium'>Available Delivery Boys:</p>
              {availableBoys.map((b) => (
                <div key={b.id}>
                  {b.fullName} - {b.mobile}
                </div>
              ))}
            </>
          ) : (
            <div>Waiting for delivery boy to accept</div>
          )}
        </div>
      )}

      {/* Total */}
      <div className='text-right font-bold text-gray-800 text-sm'>
        Total: ₹{data.shopOrders.subtotal}
      </div>

    </div>
  )
}

export default OwnerOrderCard
