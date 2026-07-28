import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  Building2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Key,
  Shield,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Fingerprint,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import AuthFooter from "../../components/layout/AuthFooter";
import { motion, AnimatePresence } from "framer-motion";

const API = (import.meta.env.VITE_API_URL || "https://realepro.onrender.com/api") + "/auth";

// Password strength indicator
const PasswordStrength = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [label, setLabel] = useState("");

  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      setLabel("");
      return;
    }
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengthMap = {
      0: { label: "Very Weak", color: "bg-red-500", text: "text-red-500" },
      1: { label: "Weak", color: "bg-orange-500", text: "text-orange-500" },
      2: { label: "Fair", color: "bg-yellow-500", text: "text-yellow-500" },
      3: { label: "Good", color: "bg-blue-500", text: "text-blue-500" },
      4: { label: "Strong", color: "bg-green-500", text: "text-green-500" },
      5: { label: "Very Strong", color: "bg-emerald-500", text: "text-emerald-500" },
    };

    const result = strengthMap[Math.min(score, 5)];
    setStrength(score);
    setLabel(result.label);
  }, [password]);

  if (!password) return null;

  const width = (strength / 5) * 100;

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-xs font-medium ${label ? "text-gray-700" : "text-gray-400"}`}>
          Password Strength
        </span>
        <span className={`text-xs font-semibold ${label ? "text-gray-900" : "text-gray-400"}`}>
          {label}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full transition-colors duration-300 ${
            strength <= 1 ? "bg-red-500" :
            strength === 2 ? "bg-yellow-500" :
            strength === 3 ? "bg-blue-500" :
            "bg-green-500"
          }`}
        />
      </div>
      <div className="flex gap-1 mt-1.5">
        {["Lowercase", "Uppercase", "Number", "Special"].map((req, i) => {
          const checks = [
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /\d/.test(password),
            /[^a-zA-Z0-9]/.test(password),
          ];
          return (
            <div
              key={i}
              className={`flex items-center gap-1 text-[10px] ${
                checks[i] ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span className={`inline-block w-1 h-1 rounded-full ${
                checks[i] ? "bg-green-500" : "bg-gray-300"
              }`} />
              {req}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Password requirements list
const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "Contains a number", test: (p) => /\d/.test(p) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: password ? 1 : 0, height: password ? "auto" : 0 }}
      transition={{ duration: 0.3 }}
      className="mt-2 space-y-1 overflow-hidden"
    >
      {requirements.map((req, i) => {
        const met = req.test(password);
        return (
          <motion.div
            key={i}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 text-xs"
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              met ? "bg-green-500" : "bg-gray-300"
            }`} />
            <span className={met ? "text-green-600" : "text-gray-500"}>
              {req.label}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [timer, setTimer] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: location.state?.email || "",
    },
  });

  const watchedPassword = watch("password", "");

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${API}/reset-password`,
        {
          email: formData.email,
          password: formData.password,
        }
      );
      
      setSuccess(true);
      toast.success(data.message || "Password reset successful!");
      
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Password reset successful! Please login with your new password." 
          }
        });
      }, 3000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailCheck = async () => {
    // Simulate email verification
    setEmailSent(true);
    toast.success("Verification email sent successfully!");
    setTimer(60);
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#2d1b69] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full animate-spin-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full animate-spin-slow-reverse"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30 mb-4 relative"
          >
            <Building2 className="w-10 h-10 text-white" />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            Reset Password
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-200/80 mt-2 text-sm"
          >
            Enter your email and new password to reset
          </motion.p>
        </div>

        {/* Enhanced Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 p-8 md:p-10 border border-white/10"
        >
          <AnimatePresence mode="wait">
            {success ? (
              // Enhanced Success State
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6 relative"
                >
                  <CheckCircle className="w-12 h-12 text-green-400" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-green-400/30"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Password Reset Successfully!
                </h3>
                <p className="text-blue-200/80 mb-6">
                  Your password has been reset. Redirecting to login...
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Email Input with Verification */}
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-300 text-white placeholder:text-white/30"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address",
                        },
                      })}
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-400 text-sm mt-1.5 flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* New Password with Strength Indicator */}
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className={`w-full h-12 pl-11 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-300 text-white placeholder:text-white/30 ${
                        watchedPassword && watchedPassword.length >= 8 ? "border-green-500/50" : ""
                      }`}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: "Must contain uppercase, lowercase and number",
                        },
                      })}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {watchedPassword && (
                      <>
                        <PasswordStrength password={watchedPassword} />
                        <PasswordRequirements password={watchedPassword} />
                      </>
                    )}
                  </AnimatePresence>

                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle size={14} />
                      {errors.password.message}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter your password"
                      className="w-full h-12 pl-11 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-300 text-white placeholder:text-white/30"
                      {...register("confirmPassword", {
                        required: "Confirm your password",
                        validate: (value) =>
                          value === getValues("password") || "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle size={14} />
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </div>

                {/* Enhanced Reset Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20"
                    initial={{ x: "-100%" }}
                    animate={loading ? { x: "100%" } : { x: "-100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <Fingerprint size={18} />
                      Reset Password
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/40">or</span>
                  </div>
                </div>

                {/* Enhanced Security Note */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20"
                >
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white font-medium">
                        Security Notice
                      </p>
                      <p className="text-sm text-blue-200/60">
                        For your security, use a strong password you haven't used before.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Back to Login */}
                <Link
                  to="/login"
                  className="block text-center text-sm text-white/40 hover:text-white/60 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
        
        <AuthFooter dark />
      </motion.div>
    </div>
  );
}