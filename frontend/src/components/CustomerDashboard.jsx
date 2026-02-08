import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav.jsx'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6"
import { useSelector } from 'react-redux'
import FoodCard from './MaterialCard'

// data hooks
import useGetShopByCity from '../hooks/useGetShopByCity'
import useGetItemsByCity from '../hooks/useGetItemsByCity'

function CustomerDashboard() {
  useGetShopByCity()
  useGetItemsByCity()

  const { currentCity, shopInMyCity, itemsInMyCity } =
    useSelector(state => state.user)

  /* ================= STATE ================= */
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeShopId, setActiveShopId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState([])

  /* ================= REFS ================= */
  const cateScrollRef = useRef(null)
  const shopScrollRef = useRef(null)

  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)

  /* ================= CORE FILTER LOGIC ================= */
  useEffect(() => {
    let result = itemsInMyCity || []

    // shop filter
    if (activeShopId) {
      result = result.filter(item => item.shop?._id === activeShopId)
    }

    // category filter
    if (activeCategory) {
      result = result.filter(
        item => item.category === activeCategory.toLowerCase()
      )
    }

    // search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
    }

    setFilteredItems(result)
  }, [itemsInMyCity, activeCategory, activeShopId, searchQuery])

  /* ================= HANDLERS ================= */
  const handleCategoryClick = (category) => {
    // 🔁 toggle same category
    setActiveCategory(prev =>
      prev === category ? null : category
    )
  }

  const handleShopClick = (shopId) => {
    // 🔁 toggle same shop
    setActiveShopId(prev =>
      prev === shopId ? null : shopId
    )
  }

  const handleSearch = (value) => {
    setSearchQuery(value)
  }

  /* ================= SCROLL LOGIC ================= */
  const updateButton = (ref, setLeft, setRight) => {
    const el = ref.current
    if (!el) return
    setLeft(el.scrollLeft > 0)
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth)
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

    const cateScroll = () =>
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)

    const shopScroll = () =>
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)

    cateScrollRef.current?.addEventListener("scroll", cateScroll)
    shopScrollRef.current?.addEventListener("scroll", shopScroll)

    return () => {
      cateScrollRef.current?.removeEventListener("scroll", cateScroll)
      shopScrollRef.current?.removeEventListener("scroll", shopScroll)
    }
  }, [])

  /* ================= UI ================= */
  return (
    <div className="w-screen min-h-screen flex flex-col gap-10 items-center bg-gradient-to-b from-[#fff9f6] to-white pt-[100px]">
      <Nav onSearch={handleSearch} />

      {/* ================= CATEGORIES ================= */}
      <section className="w-full max-w-6xl px-3">
        <h2 className="text-2xl font-semibold mb-6">Choose Materials</h2>

        <div className="relative">
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-3 rounded-full z-10"
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div
            ref={cateScrollRef}
            className="flex gap-5 overflow-x-auto pb-3 scroll-smooth"
          >
            {categories.map((cate, i) => (
              <div
                key={i}
                onClick={() => handleCategoryClick(cate.category)}
                className={`cursor-pointer transition-all duration-300 rounded-xl
                  ${activeCategory === cate.category
                    ? "ring-4 ring-[#ff4d2d] scale-105"
                    : "opacity-80 hover:scale-105"
                  }`}
              >
                <CategoryCard
                  name={cate.category}
                  image={cate.image}
                />
              </div>
            ))}
          </div>

          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-3 rounded-full z-10"
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </section>

      {/* ================= SHOPS ================= */}
      <section className="w-full max-w-6xl px-3">
        <h2 className="text-2xl font-semibold mb-6">
          Trusted Material Stores in {currentCity}
        </h2>

        <div
          ref={shopScrollRef}
          className="flex gap-5 overflow-x-auto pb-3 scroll-smooth"
        >
          {shopInMyCity?.map(shop => (
            <div
              key={shop._id}
              onClick={() => handleShopClick(shop._id)}
              className={`cursor-pointer transition-all duration-300 rounded-xl
                ${activeShopId === shop._id
                  ? "ring-4 ring-[#ff4d2d] scale-105"
                  : "opacity-80 hover:scale-105"
                }`}
            >
              <CategoryCard
                name={shop.name}
                image={shop.image}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ================= ITEMS ================= */}
      <section className="w-full max-w-6xl px-3 pb-10">
        <h2 className="text-2xl font-semibold mb-6">Available Materials</h2>

        {filteredItems.length === 0 ? (
          <p className="text-gray-400 text-center text-lg">
            No items found
          </p>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {filteredItems.map(item => (
              <FoodCard key={item._id} data={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default CustomerDashboard
