import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Code2, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../config/axiosconfig";

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from location state
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email is provided, redirect to register page
      toast.error("Please complete registration first");
      navigate("/register");
    }
  }, [location, navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/user/verify-otp", {
        email,
        otp
      });

      if (response.data.success) {
        toast.success("Email verified successfully!");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Verification failed. Please try again.";
      toast.error(errorMessage);
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setCountdown(60); // 60 seconds cooldown

    try {
      const response = await axios.post("/api/user/resend-otp", { email });
      
      if (response.data.success) {
        toast.success("New OTP has been sent to your email");
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
        setResendDisabled(false);
        setCountdown(0);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to resend OTP";
      toast.error(errorMessage);
      console.error("Resend OTP error:", error);
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Code2 className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification code to {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Verification Code
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter 6-digit code"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${
                    loading
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Didn't receive the code?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleResendOtp}
                disabled={resendDisabled}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                  ${
                    resendDisabled
                      ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                      : "text-indigo-600 bg-white hover:bg-gray-50"
                  } 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {resendDisabled
                  ? `Resend in ${countdown}s`
                  : "Resend Verification Code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
