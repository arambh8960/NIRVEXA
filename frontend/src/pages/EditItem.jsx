import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaWarehouse } from "react-icons/fa";
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';

function EditItem() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { itemId } = useParams()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [unitType, setUnitType] = useState("per unit")
  const [frontendImage, setFrontendImage] = useState("")
  const [backendImage, setBackendImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const categories = [
    { label: "Cement", value: "cement" },
    { label: "TMT Steel", value: "tmt" },
    { label: "Bricks", value: "bricks" },
    { label: "Sand", value: "sand" },
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
    if (file) {
      setBackendImage(file)
      setFrontendImage(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("unitType", unitType)
      if (backendImage) formData.append("image", backendImage)

      const res = await axios.put(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true }
      )

      dispatch(setMyShopData(res.data))
      navigate("/")
    } catch (error) {
      console.log(error)
      alert(error?.response?.data?.message || "Failed to update item")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const getItem = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/item/get-by-id/${itemId}`,
          { withCredentials: true }
        )
        const item = res.data
        setName(item.name)
        setPrice(item.price)
        setCategory(item.category)
        setUnitType(item.unitType)
        setFrontendImage(item.image)
      } catch (error) {
        console.log(error)
      }
    }
    getItem()
  }, [itemId])

  return (
    <div className='flex justify-center items-center min-h-screen bg-[#fff9f6] p-6'>
      <div className='absolute top-5 left-5 cursor-pointer' onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
      </div>

      <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8'>
        <div className='flex flex-col items-center mb-6'>
          <FaWarehouse className='text-[#ff4d2d] w-16 h-16 mb-3' />
          <h2 className='text-3xl font-bold'>Edit Material</h2>
        </div>

        <form className='space-y-4' onSubmit={handleSubmit}>
          <input
            type="text"
            className='w-full border px-4 py-2 rounded'
            placeholder='Material Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            className='w-full border px-4 py-2 rounded'
            placeholder='Price'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <select
            className='w-full border px-4 py-2 rounded'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <select
            className='w-full border px-4 py-2 rounded'
            value={unitType}
            onChange={(e) => setUnitType(e.target.value)}
          >
            <option value="per unit">Per Unit</option>
            <option value="per kg">Per Kg</option>
            <option value="per bag">Per Bag</option>
            <option value="per ton">Per Ton</option>
            <option value="per feet">Per Feet</option>
          </select>

          {/* hidden file input */}
          <input
            type="file"
            accept="image/*"
            id="imageInput"
            className="hidden"
            onChange={handleImage}
          />

          {/* image preview + change option */}
          {frontendImage && (
            <div className="mt-2 text-center">
              <img
                src={frontendImage}
                className="h-40 w-full object-cover rounded mb-2"
              />
              <label
                htmlFor="imageInput"
                className="cursor-pointer text-[#ff4d2d] font-semibold underline"
              >
                Change Image
              </label>
            </div>
          )}

          <button
            className='w-full bg-[#ff4d2d] text-white py-3 rounded font-semibold'
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditItem
