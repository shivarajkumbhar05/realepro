import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import {
  Building2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  Shield,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AuthFooter from "../../components/layout/AuthFooter";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      await login(formData);
      toast.success("Welcome Back! 🏠");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Please enter your registered email first.");
      return;
    }
    navigate("/forgot-password", {
      state: { email },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      
      {/* Animated Background with Properties */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-tl from-indigo-600/20 via-cyan-600/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>

        {/* Floating Property Cards */}
        <div className="absolute top-20 left-20 animate-float-slow opacity-30">
          <div className="w-24 h-32 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2">
            <div className="w-full h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg mb-2"></div>
            <div className="h-2 w-3/4 bg-white/10 rounded mb-1"></div>
            <div className="h-2 w-1/2 bg-white/10 rounded"></div>
          </div>
        </div>

        <div className="absolute bottom-32 right-20 animate-float-slow delay-1000 opacity-30">
          <div className="w-28 h-36 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2">
            <div className="w-full h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg mb-2"></div>
            <div className="h-2 w-3/4 bg-white/10 rounded mb-1"></div>
            <div className="h-2 w-1/2 bg-white/10 rounded"></div>
          </div>
        </div>

        <div className="absolute top-1/3 right-1/4 animate-float-slow delay-2000 opacity-20">
          <div className="w-20 h-28 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-2">
            <div className="w-full h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg mb-2"></div>
            <div className="h-2 w-3/4 bg-white/10 rounded mb-1"></div>
            <div className="h-2 w-1/2 bg-white/10 rounded"></div>
          </div>
        </div>

        {/* Keyframe animations for floating elements */}
        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(2deg); }
          }
          @keyframes float-slow-delay {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(-2deg); }
          }
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }
          .animate-float-slow.delay-1000 {
            animation: float-slow-delay 7s ease-in-out infinite;
          }
          .animate-float-slow.delay-2000 {
            animation: float-slow 8s ease-in-out infinite;
          }
        `}</style>

        {/* Property Icons scattered */}
        <div className="absolute top-40 left-1/3 text-white/5">
          <Building2 size={120} />
        </div>
        <div className="absolute bottom-40 right-1/3 text-white/5">
          <Building2 size={100} />
        </div>
      </div>

      {/* Login Popup/Card - Centered */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 border border-white/20 p-8 md:p-10">
          
          {/* Close Button (optional - for popup feel) */}
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#0f172a]">
              Welcome Back
            </h2>
            <p className="mt-2 text-[#475569]">
              Sign in to continue managing your properties
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#e2e8f0] bg-white/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-[#0f172a] placeholder:text-[#94a3b8]"
                  {...register("email", {
                    required: "Email is required",
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-11 pr-11 rounded-xl border border-[#e2e8f0] bg-white/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-[#0f172a] placeholder:text-[#94a3b8]"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-blue-600 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#d1d5db] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={forgotPassword}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e2e8f0]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/50 text-[#94a3b8] backdrop-blur-sm">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-12 rounded-xl border border-[#e2e8f0] bg-white/50 hover:bg-white text-[#0f172a] font-medium transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="h-12 rounded-xl border border-[#e2e8f0] bg-white/50 hover:bg-white text-[#0f172a] font-medium transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-[#475569]">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Create Account
              </Link>
            </p>
          </form>

          {/* Help Section */}
          <div className="mt-6 p-4 rounded-xl bg-[#f1f5f9]/50 backdrop-blur-sm border border-[#e2e8f0]">
            <div className="flex items-center gap-2 text-[#0f172a] font-semibold mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Need Help?</span>
            </div>
            <p className="text-sm text-[#475569] mb-3">
              Contact our support team if you're having trouble accessing your account.
            </p>
            <div className="space-y-1 text-sm text-[#475569]">
              <p>📧 realestateproperty605@gmail.com</p>
              <p>📞 +91 9545089118</p>
            </div>
          </div>

          <AuthFooter />
        </div>
      </div>
    </div>
  );
}