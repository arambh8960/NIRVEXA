import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io"
import { IoSearchOutline } from "react-icons/io5"
import { TbCurrentLocation } from "react-icons/tb"
import { IoLocationSharp } from "react-icons/io5"
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { useDispatch, useSelector } from 'react-redux'
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice'
import { MdDeliveryDining } from "react-icons/md"
import { FaCreditCard } from "react-icons/fa"
import axios from 'axios'
import { FaMobileScreenButton } from "react-icons/fa6"
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { addMyOrder } from '../redux/userSlice'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

/* ================= MAP RECENTER ================= */
function RecenterMap({ location }) {
  const map = useMap()

  useEffect(() => {
    if (location?.lat && location?.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true })
    }
  }, [location, map])

  return null
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
  const { cartItems, totalAmount, userData } = useSelector(state => state.user)

  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const apiKey = import.meta.env.VITE_GEOAPIKEY

  const deliveryFee = totalAmount > 50000 ? 0 : 500
  const AmountWithDeliveryFee = totalAmount + deliveryFee

  /* ================= MAP EVENTS ================= */
  const onDragEnd = async (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    await getAddressByLatLng(lat, lng)
  }

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        dispatch(setLocation({ lat: latitude, lon: longitude }))
        await getAddressByLatLng(latitude, longitude)
      }, (error) => {
        console.log(error)
        alert("Could not get your location")
      })
    }
  }

  const getAddressByLatLng = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`
      )
      const formatted = res?.data?.features?.[0]?.properties?.formatted || ""
      dispatch(setAddress(formatted))
      setAddressInput(formatted) // ✅ IMPORTANT FIX
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    if (!addressInput.trim()) return
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`
      )
      const { lat, lon } = res.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      console.log(error)
    }
  }

  /* ================= PLACE ORDER ================= */
const handlePlaceOrder = async () => {
  const safeAddress = String(addressInput || "")

  if (!location?.lat || !location?.lon) {
    alert("Please select delivery location")
    return
  }

  if (!safeAddress.trim()) {
    alert("Please enter delivery address")
    return
  }

  if (!cartItems || cartItems.length === 0) {
    alert("Cart is empty")
    return
  }

  const formattedCartItems = cartItems.map(item => ({
    _id: item._id || item.id,
    shop: item.shop,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image
  }))

  try {
    const res = await axios.post(
      `${serverUrl}/api/order/place-order`,
      {
        paymentMethod,
        deliveryAddress: {
          text: safeAddress,
          latitude: location.lat,
          longitude: location.lon
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems: formattedCartItems
      },
      { withCredentials: true }
    )

    if (paymentMethod === "cod") {
      dispatch(addMyOrder(res.data))
      navigate("/order-placed")
    } else {
      openRazorpayWindow(res.data.orderId, res.data.razorOrder)
    }
  } catch (error) {
    console.log("Place order error:", error.response?.data || error)
    alert(error.response?.data?.message || "Order failed")
  }
}

  /* ================= RAZORPAY ================= */
  const openRazorpayWindow = async (orderId, razorOrder) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: 'INR',
      name: "NIRVEXA",
      description: "Material Delivery",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const res = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              orderId
            },
            { withCredentials: true }
          )
          dispatch(addMyOrder(res.data))
          navigate("/order-placed")
        } catch (error) {
          console.log(error)
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  useEffect(() => {
    if (address) setAddressInput(address)
  }, [address])

  /* ================= UI ================= */
  return (
    <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6'>
      <div className='absolute top-5 left-5 cursor-pointer' onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
      </div>

      <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800'>Checkout</h1>

        {/* LOCATION */}
        <section>
          <h2 className='text-lg font-semibold flex items-center gap-2'>
            <IoLocationSharp className='text-[#ff4d2d]' /> Delivery Location
          </h2>

          <div className='flex gap-2 mb-3'>
            <input
              className='flex-1 border rounded-lg p-2'
              placeholder='Enter delivery address'
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button className='bg-[#ff4d2d] text-white px-3 rounded-lg' onClick={getLatLngByAddress}>
              <IoSearchOutline />
            </button>
            <button className='bg-blue-500 text-white px-3 rounded-lg' onClick={getCurrentLocation}>
              <TbCurrentLocation />
            </button>
          </div>

          <div className='h-64 border rounded-xl overflow-hidden'>
            <MapContainer
              center={[location?.lat || 20.5937, location?.lon || 78.9629]}
              zoom={16}
              className='h-full w-full'
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RecenterMap location={location} />
              {location?.lat && (
                <Marker
                  position={[location.lat, location.lon]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                />
              )}
            </MapContainer>
          </div>
        </section>

        {/* PAYMENT */}
        <section>
          <h2 className='text-lg font-semibold mb-3'>Payment Method</h2>

          <div className='grid sm:grid-cols-2 gap-4'>
            <div
              className={`p-4 rounded-xl border cursor-pointer ${paymentMethod === "cod" && "border-[#ff4d2d] bg-orange-50"}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <MdDeliveryDining className='text-green-600 text-xl' />
              <p className='font-medium'>Cash on Delivery</p>
            </div>

            <div
              className={`p-4 rounded-xl border cursor-pointer ${paymentMethod === "online" && "border-[#ff4d2d] bg-orange-50"}`}
              onClick={() => setPaymentMethod("online")}
            >
              <FaMobileScreenButton className='text-purple-600' />
              <FaCreditCard className='text-blue-600 ml-2' />
              <p className='font-medium'>Online Payment</p>
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section>
          <h2 className='text-lg font-semibold mb-3'>Order Summary</h2>

          <div className='bg-gray-50 p-4 rounded-xl space-y-2'>
            {cartItems.map((item, i) => (
              <div key={i} className='flex justify-between'>
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}

            <hr />

            <div className='flex justify-between'>
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>

            <div className='flex justify-between'>
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
            </div>

            <div className='flex justify-between font-bold text-[#ff4d2d] text-lg'>
              <span>Total</span>
              <span>₹{AmountWithDeliveryFee}</span>
            </div>
          </div>
        </section>

        <button
          className='w-full bg-[#ff4d2d] text-white py-3 rounded-xl font-semibold'
          onClick={handlePlaceOrder}
        >
          {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  )
}

export default CheckOut
