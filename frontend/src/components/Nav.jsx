import React, { useState } from "react";
import { FaLocationDot, FaCartShopping, FaPlus } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../redux/userSlice";


export default function Nav() {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = useSelector((state) => state.cart?.cartCount || 0);
  const pendingOrderCount = useSelector(
    (state) => state.user?.pendingOrderCount || 0
  );
  const { userData, currentCity } = useSelector((state) => state.user || {});
  const ownerState = useSelector((state) => state.owner || {});
  const { myShopData } = ownerState;
  const userName = userData?.fullName || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    dispatch(setUserData(null));
    setShowMenu(false);
  };

  return (
    <div
      className="w-full h-[70px] md:h-[80px] flex items-center justify-between
                 px-4 md:px-8 fixed top-0 z-[9999]
                 bg-white border-b border-gray-200"
    >
      {/* Logo */}
      <img
        src="/nirvexaimages/NIRVEXAlogo.jpeg"
        alt="NIRVEXA"
        className="h-9 md:h-10 w-auto object-contain"
      />

      {/* Search + Location (USER ONLY) */}
      {userData?.role === "user" && (
        <div
          className="hidden md:flex w-[50%] h-[55px] bg-gray-50 rounded-xl shadow-sm
                     items-center px-4 gap-4"
        >
          <div className="flex items-center gap-2 border-r pr-4 border-gray-300">
            <FaLocationDot className="text-orange-500 text-lg" />
            <span className="text-gray-600 text-sm font-medium">{currentCity}</span>
          </div>

          <div className="flex items-center gap-2 w-full">
            <IoIosSearch className="text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Search building materials..."
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Mobile Search Icon (USER ONLY) */}
        {userData?.role === "user" && (
          <IoIosSearch
            onClick={() => setShowSearch(!showSearch)}
            className="text-2xl text-gray-700 md:hidden hover:text-orange-500 transition cursor-pointer"
          />
        )}

        {/* OWNER: Add Items */}
        {userData?.role === "owner" && myShopData&&(
          
          <button
            className="hidden sm:flex items-center gap-2 bg-orange-500 text-white
                       px-5 py-2.5 rounded-full font-semibold
                       hover:bg-orange-600 transition-all shadow-md active:scale-95"
            onClick={() => navigate("/add-item")}
          >
            <FaPlus size={16} />
            
            <span>Add Items</span>
          </button>
        )}

        {/* OWNER: Pending Orders with count */}
        {userData?.role === "owner" && (
          <div className="hidden sm:block relative cursor-pointer">
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium
                         hover:bg-orange-600 transition shadow-md"
            >
              Pending Orders
            </button>
            {pendingOrderCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-red-500 text-white
                           text-xs w-5 h-5 flex items-center justify-center
                           rounded-full font-semibold"
              >
                {pendingOrderCount}
              </span>
            )}
          </div>
        )}

        {/* USER: My Orders */}
        {userData?.role === "user" && (
          <button
            className="hidden sm:block bg-orange-500 text-white px-4 py-2 rounded-full
                       font-medium hover:bg-orange-600 transition shadow-md"
          >
            My Orders
          </button>
        )}

        {/* USER: Cart */}
        {userData?.role === "user" && (
          <div className="relative cursor-pointer">
            <FaCartShopping className="text-2xl text-gray-700 hover:text-orange-500 transition" />
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 bg-orange-500 text-white
                           text-xs w-5 h-5 flex items-center justify-center
                           rounded-full font-semibold"
              >
                {cartCount}
              </span>
            )}
          </div>
        )}

        {/* Profile */}
        <div className="relative">
          <div
            className="w-9 h-9 rounded-full bg-orange-500 text-white
                       flex items-center justify-center font-bold cursor-pointer select-none"
            title={userName}
            onClick={() => setShowMenu(!showMenu)}
          >
            {userInitial}
          </div>

          {showMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="font-semibold text-gray-800 truncate text-sm">
                  {userName}
                </p>
              </div>

              <div className="py-1">
                {userData?.role === "owner" && myShopData&&(
                  <>
                    <button 
                      className="w-full sm:hidden text-left px-4 py-2 text-sm hover:bg-orange-50 flex items-center gap-2"
                      onClick={() => { navigate("/add-item"); setShowMenu(false); }}
                    >
                      <FaPlus size={14} /> Add Items
                    </button>
                    </>
                )}

                {userData?.role === "owner" && (

                    <button className="w-full sm:hidden text-left px-4 py-2 text-sm hover:bg-orange-50 flex justify-between">
                      Pending Orders
                      {pendingOrderCount > 0 && (
                        <span className="bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {pendingOrderCount}
                        </span>
                      )}
                    </button>
                  
                )}

                {userData?.role === "user" && (
                  <button className="w-full sm:hidden text-left px-4 py-2 text-sm hover:bg-orange-50">
                    My Orders
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (USER ONLY) */}
      {showSearch && userData?.role === "user" && (
        <div className="absolute top-[70px] left-0 w-full bg-white shadow-md p-4 flex flex-col gap-3 md:hidden border-t border-gray-100">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
            <FaLocationDot className="text-orange-500 text-lg" />
            <span className="text-gray-600 text-sm font-medium">{currentCity}</span>
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
            <IoIosSearch className="text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Search building materials..."
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
