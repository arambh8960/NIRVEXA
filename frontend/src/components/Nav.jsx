import React, { useState } from "react";
import {
  FaLocationDot,
  FaCartShopping,
  FaPlus
} from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { TbReceipt2 } from "react-icons/tb";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData } from "../redux/userSlice";

export default function Nav({ onSearch }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, currentCity, cartItems } = useSelector(
    (state) => state.user
  );
  const { myShopData } = useSelector((state) => state.owner);

  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const handleLogout = async () => {
    await axios.get(`${serverUrl}/api/auth/signout`, {
      withCredentials: true
    });
    dispatch(setUserData(null));
    navigate("/signin");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="fixed top-0 w-full z-50">
      <div className="
        mx-auto flex items-center justify-between
        px-4 md:px-8 h-20
        bg-white/70 backdrop-blur-xl
        border-b border-white/40
        shadow-sm
      ">
        {/* LOGO */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <img
            src="/nirvexaimages/NIRVEXAlogo.jpeg"
            alt="NIRVEXA"
            className="h-10 object-contain group-hover:scale-105 transition"
          />
        </div>

        {/* SEARCH BAR */}
        {userData?.role === "user" && (
          <div className="
            hidden md:flex w-[45%] h-12
            items-center gap-3 px-4
            bg-white rounded-2xl
            shadow-md
            border
            focus-within:ring-2 focus-within:ring-[#ff4d2d]/40
            transition
          ">
            <div className="flex items-center gap-2 border-r pr-3 text-gray-600">
              <FaLocationDot className="text-[#ff4d2d]" />
              <span className="truncate max-w-[90px]">
                {currentCity}
              </span>
            </div>

            <IoIosSearch className="text-[#ff4d2d] text-xl" />

            <input
              type="text"
              placeholder="Search materials..."
              value={query}
              onChange={handleSearchChange}
              className="
                w-full outline-none text-gray-700
                placeholder-gray-400
              "
            />
          </div>
        )}

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4 relative">
          {/* MOBILE SEARCH ICON */}
          {userData?.role === "user" && (
            showSearch ? (
              <RxCross2
                className="text-2xl text-[#ff4d2d] md:hidden cursor-pointer"
                onClick={() => setShowSearch(false)}
              />
            ) : (
              <IoIosSearch
                className="text-2xl text-[#ff4d2d] md:hidden cursor-pointer"
                onClick={() => setShowSearch(true)}
              />
            )
          )}

          {/* OWNER BUTTONS */}
          {userData?.role === "owner" && myShopData && (
            <>
              <button
                className="
                  hidden md:flex items-center gap-2
                  bg-[#ff4d2d]/10 text-[#ff4d2d]
                  px-4 py-2 rounded-full
                  font-semibold
                  hover:bg-[#ff4d2d]/20
                  transition
                "
                onClick={() => navigate("/add-item")}
              >
                <FaPlus /> Add Item
              </button>

              <button
                className="
                  hidden md:flex items-center gap-2
                  bg-[#ff4d2d]/10 text-[#ff4d2d]
                  px-4 py-2 rounded-full
                  font-semibold
                  hover:bg-[#ff4d2d]/20
                  transition
                "
                onClick={() => navigate("/my-orders")}
              >
                <TbReceipt2 /> Pending Orders
              </button>
            </>
          )}

          {/* CART */}
          {userData?.role === "user" && (
            <div
              className="
                relative cursor-pointer
                hover:scale-110 transition
              "
              onClick={() => navigate("/cart")}
            >
              <FaCartShopping className="text-2xl text-[#ff4d2d]" />
              {cartItems.length > 0 && (
                <span className="
                  absolute -top-2 -right-2
                  bg-[#ff4d2d] text-white
                  text-xs w-5 h-5
                  flex items-center justify-center
                  rounded-full
                  animate-pulse
                ">
                  {cartItems.length}
                </span>
              )}
            </div>
          )}

          {/* PROFILE */}
          <div
            className="
              w-10 h-10 rounded-full
              bg-gradient-to-br from-[#ff4d2d] to-[#ff784d]
              text-white font-bold
              flex items-center justify-center
              cursor-pointer
              hover:scale-110 transition
            "
            onClick={() => setShowMenu(!showMenu)}
          >
            {userData?.fullName?.[0]}
          </div>

          {/* DROPDOWN */}
          {showMenu && (
            <div className="
              absolute top-16 right-0
              w-52 bg-white
              rounded-2xl shadow-xl
              border
              p-2
              animate-fadeIn
            ">
              <div className="px-3 py-2 font-semibold text-gray-800">
                {userData?.fullName}
              </div>

              {userData?.role !== "deliveryBoy" && (
                <button
                  className="
                    w-full text-left px-3 py-2
                    hover:bg-gray-100 rounded-lg
                  "
                  onClick={() => navigate("/my-orders")}
                >
                  My Orders
                </button>
              )}

              <button
                className="
                  w-full text-left px-3 py-2
                  text-red-600
                  hover:bg-red-50 rounded-lg
                "
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE SEARCH BAR */}
      {showSearch && userData?.role === "user" && (
        <div className="
          md:hidden px-4 py-3
          bg-white/90 backdrop-blur
          shadow
        ">
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2">
            <IoIosSearch className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="Search materials..."
              value={query}
              onChange={handleSearchChange}
              className="w-full outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
