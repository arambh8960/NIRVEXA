import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice.js";

function SignIn() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password, role },
        { withCredentials: true }

      );
      dispatch(setUserData(res.data));
      navigate("/"); // Redirect to home/dashboard
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Send user info to backend to create session
      const res = await axios.post(`${serverUrl}/api/auth/google`, {
        fullName: result.user.displayName,
        email: result.user.email,
        role,
      }, { withCredentials: true });
      dispatch(setUserData(res.data));
      
      navigate("/");
    
    } catch (error) {
      console.log("Google Auth Error:", error);
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      }
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/nirvexaimages/background.png')" }}
    >
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to <span className="text-orange-500 font-semibold">NIRVEXA</span>
        </p>

        {/* Role Selection */}
        <div className="flex gap-3 mb-6">
          {[
            { label: "Customer", value: "user" },
            { label: "Owner", value: "owner" },
            { label: "Delivery", value: "deliveryBoy" },
          ].map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`flex-1 py-2 rounded-xl font-semibold border transition
                ${
                  role === r.value
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShow(!show)}
              className="absolute right-4 top-3.5 text-gray-400 cursor-pointer"
            >
              {show ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="text-right text-sm">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-orange-500 font-semibold hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition shadow-md">
            Sign In
          </button>
        </form>

        <button
          type="button"
          className="w-full mt-4 flex items-center justify-center gap-3
                     border border-gray-300 bg-white text-gray-700
                     py-3 rounded-xl font-semibold
                     hover:bg-gray-50 hover:shadow-md
                     transition-all duration-200"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={22} />
          <span>Sign in with Google</span>
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-orange-500 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
