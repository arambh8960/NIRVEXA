import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      setStep(2);
    } catch (err) {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setStep(3);
    } catch (err) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirm) return alert("Passwords do not match");

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, password },
        { withCredentials: true }
      );
      alert("Password reset successful");
      navigate("/signin");
    } catch (err) {
      alert("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/nirvexaimages/background.png')" }}
    >
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        {step === 1 && (
          <form onSubmit={sendOtp} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter email"
              required
              className="w-full p-2 border rounded"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              disabled={loading}
              className={`w-full py-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="w-full text-sm text-gray-600 underline"
            >
              Back to Login
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Verify OTP</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              required
              className="w-full p-2 border rounded"
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              disabled={loading}
              className={`w-full py-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-600 underline"
            >
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword} className="space-y-4">
            <h2 className="text-xl font-bold text-center">Reset Password</h2>

            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="New password"
                required
                className="w-full p-2 border rounded pr-10"
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShow(!show)}
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
              >
                {show ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <input
              type="password"
              placeholder="Confirm password"
              required
              className="w-full p-2 border rounded"
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              disabled={loading}
              className={`w-full py-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full text-sm text-gray-600 underline"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
