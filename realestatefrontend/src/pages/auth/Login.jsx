import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  Building2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  Sparkles,
  Shield,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  MessageCircle,
  Globe
} from "lucide-react";
import toast from "react-hot-toast";
import AuthFooter from "../../components/layout/AuthFooter";
import { motion } from "framer-motion";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/auth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  // Check for redirect result on mount
  useState(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          await handleGoogleUser(user);
        }
      } catch (error) {
        console.error("Redirect result error:", error);
      }
    };
    handleRedirectResult();
  }, []);

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      await login(formData);
      toast.success("🎉 Welcome Back! Let's find your dream home.");
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Login Failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Please enter your registered email first.");
      return;
    }
    try {
      const { data } = await axios.post(`${API}/forgot-password`, { email });
      toast.success(data.message);
      navigate("/forgot-password", { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send reset instructions");
    }
  };

  // ─── Handle Google User ──────────────────────────────────────────
  const handleGoogleUser = async (user) => {
    try {
      setGoogleLoading(true);
      
      const res = await axios.post(`${API}/google-register`, {
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        googleId: user.uid,
        avatar: user.photoURL || '',
        role: "buyer"
      });
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("re_token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("re_user", JSON.stringify(res.data.user));
      
      toast.success("🎉 Google Login Successful! Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("No account found. Please sign up first.");
      } else {
        toast.error(error.message || "Google Login Failed");
      }
      console.error("Google Login Error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─── Google Login Handler with Popup ─────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      
      // Try popup first
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await handleGoogleUser(user);
      
    } catch (error) {
      // If popup is blocked, try redirect method
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        toast.error("Popup was blocked. Please allow popups or use the redirect method.");
        // Option: Use redirect as fallback
        // await signInWithRedirect(auth, googleProvider);
      } else if (error.code === 'auth/cancelled-popup-request') {
        toast.error("Login was cancelled");
      } else {
        toast.error(error.message || "Google Login Failed");
      }
      console.error("Google Login Error:", error);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/10 rounded-full blur-3xl"></div>
        
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            className="absolute w-1.5 h-1.5 bg-primary-200/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">PropEstate</span>
              <p className="text-gray-500 text-xs">Premium Properties</p>
            </div>
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-gray-700 text-xs font-medium">#1 Trusted Real Estate Platform</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Back! 👋
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              Sign in to manage your properties and track listings
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-around mt-6 py-4 border-y border-gray-100">
            {[
              { value: "10K+", label: "Properties" },
              { value: "500+", label: "Agents" },
              { value: "4.9", label: "Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === 'email' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 border transition-all outline-none text-gray-900 placeholder:text-gray-400 ${
                    errors.email
                      ? 'border-red-400 focus:ring-4 focus:ring-red-200'
                      : focusedField === 'email'
                      ? 'border-primary-500 ring-4 ring-primary-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-2 flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-red-400"></span>
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === 'password' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-12 pl-12 pr-12 rounded-xl bg-gray-50 border transition-all outline-none text-gray-900 placeholder:text-gray-400 ${
                    errors.password
                      ? 'border-red-400 focus:ring-4 focus:ring-red-200'
                      : focusedField === 'password'
                      ? 'border-primary-500 ring-4 ring-primary-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-2 flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-red-400"></span>
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 transition-all"
                />
                <span className="group-hover:text-gray-900 transition-colors">
                  Remember Me
                </span>
              </label>
              <button
                type="button"
                onClick={forgotPassword}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-all flex items-center gap-1"
              >
                Forgot Password?
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </>
              )}
            </motion.button>

            {/* Google Login Button */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Button with Popup Fix */}
            <motion.button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full relative group"
              type="button"
            >
              <div className="relative h-12 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {googleLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-700 font-medium relative z-10">Signing in...</span>
                  </>
                ) : (
                  <>
                    <img 
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                      alt="Google" 
                      className="w-5 h-5 relative z-10"
                    />
                    <span className="text-gray-700 font-medium relative z-10 group-hover:text-gray-900 transition-colors">
                      Sign in with Google
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 relative z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />
                  </>
                )}
              </div>
            </motion.button>

            {/* Popup Warning */}
            {googleLoading && (
              <p className="text-xs text-center text-gray-500 animate-pulse">
                ⏳ Please allow the popup window to continue...
              </p>
            )}

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-all hover:underline">
                  Create Account
                </Link>
              </p>
            </div>
          </form>

          {/* Trust Badges */}
          <div className="mt-6 flex justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-500" />
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span>4.9/5</span>
            </div>
          </div>

          {/* Support Card */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Need Help?</p>
                <p className="text-[10px] text-gray-400">+91 95450 89118 • 24/7 Support</p>
              </div>
              <Link 
                to="/contact" 
                className="ml-auto text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <AuthFooter dark={false} />
        </div>
      </motion.div>
    </div>
  );
}