import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav.jsx'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'


function CustomerDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } =
    useSelector(state => state.user)

  const cateScrollRef = useRef()
  const shopScrollRef = useRef()
  const navigate = useNavigate()
//scroll wala section ke liye hai
  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)
  const [updatedItemsList, setUpdatedItemsList] = useState([])

  const handleFilterByCategory = (category) => {
    if (category === "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      setUpdatedItemsList(itemsInMyCity?.filter(i => i.category === category))
    }
  }

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity)
  }, [itemsInMyCity])

  const updateButton = (ref, setLeft, setRight) => {
    const el = ref.current
    if (el) {
      setLeft(el.scrollLeft > 0)
      setRight(el.scrollLeft + el.clientWidth < el.scrollWidth)
    }
  }

  const scrollHandler = (ref, dir) => {
    ref.current?.scrollBy({
      left: dir === "left" ? -250 : 250,
      behavior: "smooth"
    })
  }

  useEffect(() => {
    updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)

    cateScrollRef.current?.addEventListener("scroll", () =>
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    )
    shopScrollRef.current?.addEventListener("scroll", () =>
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
    )
  }, [])

  return (
    <div className='w-screen min-h-screen flex flex-col gap-10 items-center bg-gradient-to-b from-[#fff9f6] to-white overflow-y-auto'>
      <Nav />

      {/* SEARCH RESULTS */}
      {searchItems?.length > 0 && (
        <section className='w-full max-w-6xl bg-white rounded-3xl shadow-xl p-6 mt-4'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-4'>
            Search Results
          </h2>
          <div className='flex flex-wrap gap-6 justify-center'>
            {searchItems.map(item => (
              <FoodCard key={item._id} data={item} />
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section className='w-full max-w-6xl px-3'>
        <h2 className="
  text-xl sm:text-2xl md:text-3xl 
  font-semibold text-gray-800 
  mb-6 flex items-center gap-3
">
  <span className="w-2 h-8 bg-[#ff4d2d] rounded-full"></span>
  Choose Materials
</h2>


        <div className='relative'>
          {showLeftCateButton && (
            <button
              className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-3 rounded-full shadow-xl z-10'
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div
            ref={cateScrollRef}
            className='flex gap-5 overflow-x-auto pb-3 scroll-smooth'
          >
            {categories.map((cate, i) => (
              <CategoryCard
                key={i}
                name={cate.category}
                image={cate.image}
                onClick={() => handleFilterByCategory(cate.category)}
              />
            ))}
          </div>

          {showRightCateButton && (
            <button
              className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-3 rounded-full shadow-xl z-10'
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </section>

      {/* SHOPS */}
      <section className='w-full max-w-6xl px-3'>
        <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-4'>
          Trusted Material Stores in {currentCity}
        </h2>

        <div className='relative'>
          {showLeftShopButton && (
            <button
              className='absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-3 rounded-full shadow-xl z-10'
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div
            ref={shopScrollRef}
            className='flex gap-5 overflow-x-auto pb-3 scroll-smooth'
          >
            {shopInMyCity?.map((shop, i) => (
              <CategoryCard
                key={i}
                name={shop.name}
                image={shop.image}
                onClick={() => navigate(`/shop/${shop._id}`)}
              />
            ))}
          </div>

          {showRightShopButton && (
            <button
              className='absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-3 rounded-full shadow-xl z-10'
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </section>

      {/* ITEMS */}
      <section className='w-full max-w-6xl px-3 pb-10'>
        <h2 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-4'>
          Available Materials Near You
        </h2>

        <div className='flex flex-wrap gap-6 justify-center'>
          {updatedItemsList?.map((item, i) => (
            <FoodCard key={i} data={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default CustomerDashboard
