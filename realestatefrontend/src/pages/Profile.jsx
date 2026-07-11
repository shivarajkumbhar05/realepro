import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../api/auth';
import { 
  User, Lock, Camera, Mail, Phone, Shield, 
  CheckCircle, AlertCircle, Sparkles, Save,
  Key, LogOut, UserCheck, Award, Star,
  Building2, Calendar, Clock, ArrowRight,
  Eye, EyeOff, // ✅ Removed Github, Twitter, Linkedin, Globe, Heart
  // ✅ These are the correct icons available in lucide-react
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://realepro.onrender.com';

// ✅ Add missing import for ShoppingBag
import { ShoppingBag } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [memberSince, setMemberSince] = useState('');

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: { name: user?.name || '', phone: user?.phone || '' }
  });

  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors } } = useForm();

  useEffect(() => {
    if (user?.createdAt) {
      const date = new Date(user.createdAt);
      setMemberSince(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
  }, [user]);

  const onProfileSave = async (data) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('phone', data.phone || '');
      if (avatarFile) fd.append('avatar', avatarFile);
      await updateProfile(fd);
      await refreshUser();
      toast.success('🎉 Profile updated successfully!');
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const onPwSave = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('🔒 Password changed successfully!');
      resetPw();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
    setSaving(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const avatarSrc = avatarPreview || (user?.avatar ? `${BASE}${user.avatar}` : null);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Member Since', value: memberSince || 'N/A', icon: Calendar, color: 'blue' },
    { label: 'Role', value: user?.role || 'N/A', icon: Shield, color: 'purple' },
    { label: 'Status', value: user?.isActive ? 'Active' : 'Inactive', icon: CheckCircle, color: 'green' },
  ];

  // ─── Quick Actions ──────────────────────────────────────────────────
  const quickActions = [
    { icon: Building2, label: 'My Properties', link: '/properties', color: 'blue' },
    { icon: Star, label: 'Favorites', link: '/favorites', color: 'red' }, // ✅ Changed Heart to Star
    { icon: ShoppingBag, label: 'Purchases', link: '/purchases', color: 'green' },
  ];

  const getRoleColor = (role) => {
    const colors = {
      admin: 'from-red-500 to-red-600 bg-red-100 text-red-700 border-red-200',
      agent: 'from-blue-500 to-blue-600 bg-blue-100 text-blue-700 border-blue-200',
      buyer: 'from-emerald-500 to-emerald-600 bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return colors[role] || colors.buyer;
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: Shield,
      agent: Building2,
      buyer: UserCheck,
    };
    return icons[role] || User;
  };

  const RoleIcon = getRoleIcon(user?.role);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-primary-600/20"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${10 + Math.random() * 80}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                <User className="w-6 h-6 text-blue-200" />
              </div>
              <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                Profile Settings
              </span>
              <span className="text-sm font-medium text-blue-100 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                {user?.role}
              </span>
            </div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-blue-100 mt-1">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl transition-all border border-white/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.div>

      {/* ─── Profile Card ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
      >
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${getRoleColor(user?.role).split(' ')[0]} ${getRoleColor(user?.role).split(' ')[1]} flex items-center justify-center shadow-xl shadow-primary-500/20 overflow-hidden`}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg shadow-primary-500/30 border-2 border-white">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            {avatarFile && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(user?.role)}`}>
                <RoleIcon className="w-3 h-3" />
                {user?.role}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mt-2">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Mail className="w-4 h-4" />
                {user?.email}
              </div>
              {user?.phone && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Phone className="w-4 h-4" />
                  {user?.phone}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                  <stat.icon className={`w-3.5 h-3.5 text-${stat.color}-500`} />
                  {stat.label}: <span className="font-medium text-gray-700">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl px-4 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-blue-600">{user?.properties?.length || 0}</p>
              <p className="text-[10px] text-gray-500">Properties</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl px-4 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-purple-600">{user?.favorites?.length || 0}</p>
              <p className="text-[10px] text-gray-500">Favorites</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl px-4 py-3 text-center min-w-[80px]">
              <p className="text-2xl font-bold text-emerald-600">{user?.purchases?.length || 0}</p>
              <p className="text-[10px] text-gray-500">Purchases</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Tabs ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="border-b border-gray-100 px-4">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'profile', label: 'Profile Info', icon: User },
              { id: 'password', label: 'Change Password', icon: Lock },
              { id: 'security', label: 'Security', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'border-primary-600 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Profile Information</h3>
                    <p className="text-xs text-gray-400">Update your personal details</p>
                  </div>
                </div>

                <form onSubmit={handleProfile(onProfileSave)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                      placeholder="Enter your full name"
                      {...regProfile('name', { required: 'Name is required' })} 
                    />
                    {profileErrors.name && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {profileErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm cursor-not-allowed text-gray-500" 
                        value={user?.email} 
                        disabled 
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                        placeholder="Enter your phone number"
                        {...regProfile('phone')} 
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={saving} 
                      className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    {avatarFile && (
                      <button 
                        type="button" 
                        onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
                      >
                        Cancel Image
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Change Password</h3>
                    <p className="text-xs text-gray-400">Update your password regularly for security</p>
                  </div>
                </div>

                <form onSubmit={handlePw(onPwSave)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type={showCurrentPw ? 'text' : 'password'} 
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                        placeholder="Enter current password"
                        {...regPw('currentPassword', { required: 'Current password is required' })} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {pwErrors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {pwErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type={showNewPw ? 'text' : 'password'} 
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                        placeholder="Enter new password (min 6 characters)"
                        {...regPw('newPassword', { 
                          required: 'New password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {pwErrors.newPassword && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {pwErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type={showConfirmPw ? 'text' : 'password'} 
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                        placeholder="Confirm new password"
                        {...regPw('confirmPassword', { required: 'Please confirm your password' })} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving} 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Key className="w-5 h-5" />
                        Change Password
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Security Settings</h3>
                    <p className="text-xs text-gray-400">Manage your account security</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Two Factor Auth */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all">
                      Enable
                    </button>
                  </div>

                  {/* Sessions */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Active Sessions</p>
                        <p className="text-xs text-gray-500">Manage your active sessions</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-all">
                      Manage
                    </button>
                  </div>

                  {/* Connected Apps */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Star className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Connected Apps</p>
                        <p className="text-xs text-gray-500">Manage third-party connections</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-all">
                      View
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-red-700">Delete Account</p>
                        <p className="text-xs text-red-500">Permanently delete your account</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─── Quick Actions ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-primary-200 hover:-translate-y-0.5"
          >
            <div className={`w-12 h-12 rounded-xl bg-${action.color}-50 text-${action.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-400">Click to view</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Add missing Globe import ──────────────────────────────────────────
import { Globe } from 'lucide-react';