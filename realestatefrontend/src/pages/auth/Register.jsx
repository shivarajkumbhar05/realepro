import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { 
  Building2, Eye, EyeOff, Mail, User, Phone, 
  ShieldCheck, Sparkles, CheckCircle, AlertCircle,
  ArrowLeft, Lock, Key, UserPlus, Award
} from "lucide-react";
import toast from "react-hot-toast";
import AuthFooter from "../../components/layout/AuthFooter";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? "https://realepro.onrender.com/api" : "http://localhost:5000/api"
);
const API = API_BASE + "/auth";

export default function Register() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "buyer",
    },
  });

  const getPostLoginRedirect = (userRole) => {
    const redirectPath = sessionStorage.getItem("redirectAfterLogin");
    const normalizedPath = redirectPath && redirectPath !== "/login" && redirectPath !== "/register" ? redirectPath : null;

    if (normalizedPath) {
      sessionStorage.removeItem("redirectAfterLogin");
      return normalizedPath;
    }

    if (userRole === "admin") return "/admin/users";
    if (userRole === "agent") return "/agent/my-listings";
    return "/dashboard";
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/register`, data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("re_token", res.data.token);
      setAuthUser(res.data.user);
      toast.success("🎉 Registration Successful! Welcome to PropEstate.");
      navigate(getPostLoginRedirect(res.data.user?.role), { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Registration Failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      {/* ─── Animated Background ────────────────────────────────────── */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/10 rounded-full blur-3xl"></div>
        
        {[...Array(15)].map((_, i) => (
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

      {/* ─── Main Container ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          
          {/* ─── Back Button ───────────────────────────────────────────── */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-4 text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </button>

          {/* ─── Logo ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">PropEstate</span>
              <p className="text-gray-500 text-xs">Create Your Account</p>
            </div>
          </div>

          {/* ─── Badge ────────────────────────────────────────────────── */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-700 text-xs font-medium">Join the PropEstate Community</span>
            </div>
          </div>

          {/* ─── Header ───────────────────────────────────────────────── */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Account ✨
            </h2>
            <p className="mt-1 text-gray-500 text-sm">
              Join thousands of happy buyers and agents
            </p>
          </div>

          {/* ─── Stats ────────────────────────────────────────────────── */}
          <div className="flex justify-around mt-4 py-3 border-y border-gray-100">
            {[
              { value: "10K+", label: "Properties" },
              { value: "500+", label: "Agents" },
              { value: "4.9", label: "Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <h3 className="text-lg font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-500 text-[10px]">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ─── Form ─────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ─── Name ────────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === 'name' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="John Doe"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 border transition-all outline-none text-gray-900 placeholder:text-gray-400 ${
                    errors.name
                      ? 'border-red-400 focus:ring-4 focus:ring-red-200'
                      : focusedField === 'name'
                      ? 'border-primary-500 ring-4 ring-primary-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...register("name", { 
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters"
                    }
                  })}
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" /> {errors.name.message}
                </motion.p>
              )}
            </div>

            {/* ─── Email ───────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
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
                  className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* ─── Phone ───────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === 'phone' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <input
                  type="tel"
                  placeholder="9876543210"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 border transition-all outline-none text-gray-900 placeholder:text-gray-400 ${
                    focusedField === 'phone'
                      ? 'border-primary-500 ring-4 ring-primary-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...register("phone", {
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit phone number"
                    }
                  })}
                />
              </div>
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" /> {errors.phone.message}
                </motion.p>
              )}
            </div>

            {/* ─── Role ────────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Register As <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Award className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === 'role' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <select
                  onFocus={() => setFocusedField('role')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 border transition-all outline-none text-gray-900 appearance-none ${
                    focusedField === 'role'
                      ? 'border-primary-500 ring-4 ring-primary-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...register("role")}
                >
                  <option value="buyer">🏠 Buyer</option>
                  <option value="agent">🤝 Agent</option>
                </select>
              </div>
            </div>

            {/* ─── Password ────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                  focusedField === 'password' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Minimum 6 characters"
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
                      message: "Minimum 6 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Must contain uppercase, lowercase, and number"
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
                  className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" /> {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* ─── Register Button ────────────────────────────────────── */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </motion.button>
          </form>

          {/* ─── Login Link ────────────────────────────────────────────── */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-all hover:underline"
            >
              Sign In
            </Link>
          </p>

          {/* ─── Trust Badges ──────────────────────────────────────────── */}
          <div className="mt-4 flex justify-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-green-500" />
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Free to Join</span>
            </div>
          </div>

          {/* ─── Footer ────────────────────────────────────────────────── */}
          <AuthFooter dark={false} />
        </div>
      </motion.div>
    </div>
  );
}