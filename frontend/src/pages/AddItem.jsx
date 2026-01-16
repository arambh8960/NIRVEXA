import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaWarehouse } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';

function AddItem() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { myShopData } = useSelector(state => state.owner)

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [unitType, setUnitType] = useState("")
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)

  const categories = [
    { label: "Cement", value: "cement" },
    { label: "TMT Steel", value: "tmt" },
    { label: "Bricks", value: "bricks" },
    { label: "Sand", value: "sand" },
    { label: "Aggregates", value: "aggregates" },
    { label: "Tiles", value: "tiles" },
    { label: "Paint", value: "paint" },
    { label: "Plumbing", value: "plumbing" },
    { label: "Electrical", value: "electrical" },
    { label: "Wood", value: "wood" },
    { label: "Hardware", value: "hardware" },
    { label: "Roofing", value: "roofing" },
    { label: "Others", value: "other" }
  ]

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !category || !unitType || !price) {
      alert("Please fill all required fields")
      return
    }

    if (!backendImage) {
      alert("Please select an image")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("unitType", unitType)
      formData.append("image", backendImage)

      const res = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        { withCredentials: true }
      )

      dispatch(setMyShopData(res.data))
      navigate("/")
    } catch (error) {
      console.log(error)
      alert(error?.response?.data?.message || "Failed to add item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex justify-center flex-col items-center p-6 min-h-screen relative'>
      <div
        className='absolute top-[20px] left-[20px] cursor-pointer'
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
      </div>

      <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
        <div className='flex flex-col items-center mb-6'>
          <div className='bg-orange-100 p-4 rounded-full mb-4'>
            <FaWarehouse className='text-[#ff4d2d] w-16 h-16' />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Add Construction Material
          </h2>
        </div>

        <form className='space-y-5' onSubmit={handleSubmit}>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Material Name</label>
            <input
              type="text"
              required
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Material Image</label>
            <input
              type="file"
              accept="image/*"
              required
              className='w-full px-4 py-2 border rounded-lg'
              onChange={handleImage}
            />
            {frontendImage && (
              <img
                src={frontendImage}
                alt="preview"
                className='mt-3 w-full h-40 object-cover rounded-lg border'
              />
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Price</label>
            <input
              type="number"
              min="0"
              required
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Category</label>
            <select
              required
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((c, i) => (
                <option key={i} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Unit Type</label>
            <select
              required
              className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none'
              value={unitType}
              onChange={(e) => setUnitType(e.target.value)}
            >
              <option value="">Select Unit</option>
              <option value="per unit">Per Unit</option>
              <option value="per kg">Per Kg</option>
              <option value="per bag">Per Bag</option>
              <option value="per ton">Per Ton</option>
              <option value="per feet">Per Feet</option>
            </select>
          </div>

          <button
            disabled={loading}
            className='w-full bg-[#ff4d2d] text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition'
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddItem
