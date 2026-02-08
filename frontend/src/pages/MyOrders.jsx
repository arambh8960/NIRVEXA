import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setMyOrders, cancelMyOrder } from '../redux/userSlice'
import { IoIosArrowRoundBack } from "react-icons/io"
import { useNavigate } from 'react-router-dom'
import OwnerOrderCard from '../components/OwnerOrderCard'

function MyOrders() {
  const { myOrders, userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true
        })
        dispatch(setMyOrders(res.data))
      } catch (error) {
        console.log(error)
      }
    }
    fetchOrders()
  }, [dispatch])

  const handleCancel = async (orderId, shopId) => {
    if(!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await axios.post(`${serverUrl}/api/order/cancel-order`,
        { orderId, shopId },
        { withCredentials: true }
      )
      dispatch(cancelMyOrder({ orderId, shopId }))
      alert("Order cancelled successfully")
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel")
    }
  }

  return (
    <div className='min-h-screen bg-[#fff9f6] p-4'>
       <div className='max-w-4xl mx-auto'>
        <div className='flex items-center gap-4 mb-6'>
            <button onClick={() => navigate("/")} className='p-2 hover:bg-gray-200 rounded-full'>
                <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
            </button>
            <h1 className='text-2xl font-bold text-gray-800'>
              {userData?.role === "owner" ? "Pending Orders" : "My Orders"}
            </h1>
        </div>

        <div className='space-y-4'>
            {myOrders && myOrders.length > 0 ? myOrders.map((order) => {
              // OWNER VIEW
              if (userData?.role === "owner") {
                return order.shopOrders.map((shopOrder) => (
                  <OwnerOrderCard key={shopOrder._id} data={{ ...order, shopOrders: shopOrder }} />
                ))
              }

              // CUSTOMER VIEW
              return (
                <div key={order._id} className='bg-white p-6 rounded-2xl shadow-sm border space-y-4'>
                    <div className='flex justify-between text-sm text-gray-500 border-b pb-2'>
                        <span>Order ID: <span className='font-mono text-gray-700'>{order._id}</span></span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    {order.shopOrders.map((shopOrder) => (
                        <div key={shopOrder._id} className='pt-2'>
                            <div className='flex justify-between items-start mb-3'>
                                <div>
                                    <h3 className='font-bold text-lg text-gray-800'>{shopOrder.shop?.name || "Shop"}</h3>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <span className='text-sm text-gray-600'>Status:</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                                            shopOrder.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                            shopOrder.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {shopOrder.status || "Ordered"}
                                        </span>
                                    </div>
                                </div>

                                {/* 🔥 CANCEL BUTTON LOGIC */}
                                {!["shipped", "out of delivery", "delivered", "cancelled"].includes(shopOrder.status) && (
                                    <button
                                        onClick={() => handleCancel(order._id, shopOrder.shop?._id)}
                                        className='px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition'
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>

                            <div className='space-y-3 bg-gray-50 p-3 rounded-xl'>
                                {shopOrder.shopOrderItems.map((item, idx) => (
                                    <div key={idx} className='flex items-center gap-4'>
                                        <img
                                            src={item.item?.image || item.image || "https://via.placeholder.com/150"}
                                            alt={item.name}
                                            className='w-16 h-16 object-cover rounded-lg border bg-white'
                                        />
                                        <div>
                                            <p className='font-semibold text-gray-800'>{item.name}</p>
                                            <p className='text-sm text-gray-500'>
                                                Qty: {item.quantity} • ₹{item.price}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className='pt-3 border-t flex justify-between items-center'>
                        <span className='text-gray-600'>Total Amount</span>
                        <span className='font-bold text-xl text-[#ff4d2d]'>₹{order.totalAmount}</span>
                    </div>
                </div>
              )
            }) : (
                <div className='text-center py-20 text-gray-500'>
                    <p>No orders found.</p>
                </div>
            )}
        </div>
       </div>
    </div>
  )
}

export default MyOrders