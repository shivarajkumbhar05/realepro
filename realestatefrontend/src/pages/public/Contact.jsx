// src/pages/public/Contact.jsx
import { useState } from 'react';
import PublicPageShell from '../../components/layout/PublicPageShell';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendContactMessage } from '../../api/contact';

export default function Contact() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    message: '' 
  });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!form.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setSending(true);
    setSuccess(false);
    
    try {
      const response = await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      
      if (response.success) {
        setSuccess(true);
        toast.success("✅ Message sent successfully! We'll get back to you soon.");
        setForm({ name: '', email: '', message: '' });
        setErrors({});
        
        // Reset success after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      
      // Handle different error messages
      let errorMsg = 'Something went wrong. Please try again.';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'realestateproperty605@gmail.com',
      href: 'mailto:realestateproperty605@gmail.com',
      color: 'text-blue-600 bg-blue-50',
      description: 'We respond within 24 hours'
    },
    {
      icon: Phone,
      label: 'Phone / WhatsApp',
      value: '+91 95450 89118',
      href: 'tel:+919545089118',
      color: 'text-green-600 bg-green-50',
      description: 'Mon-Sat, 10 AM - 7 PM'
    },
    {
      icon: MapPin,
      label: 'Office',
      value: 'PropEstate HQ, MG Road, Pune, Maharashtra, India',
      color: 'text-purple-600 bg-purple-50',
      description: 'Visit us by appointment'
    }
  ];

  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed";

  return (
    <PublicPageShell 
      title="Contact Us" 
      subtitle="We're here to help — reach out and we'll respond within one business day."
    >
      <div className="grid lg:grid-cols-2 gap-12 not-prose max-w-6xl mx-auto">
        {/* Contact Information */}
        <div className="space-y-8">
          <div className="space-y-6">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-start gap-4 group">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a 
                        href={item.href} 
                        className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                        target={item.label === 'Email' ? '_blank' : undefined}
                        rel={item.label === 'Email' ? 'noopener noreferrer' : undefined}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600">{item.value}</p>
                    )}
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm">💡</span>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium">Quick Tips</p>
                <p className="text-sm text-gray-600 leading-relaxed mt-1">
                  You can also reach any listing agent directly via the WhatsApp button on their property page, 
                  or ask our AI assistant for instant help 24/7.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>24hr Response</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={submit} className="space-y-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`${inputClasses} ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
                if (success) setSuccess(false);
              }}
              placeholder="John Doe"
              disabled={sending}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className={`${inputClasses} ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
                if (success) setSuccess(false);
              }}
              placeholder="you@example.com"
              disabled={sending}
              maxLength={100}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className={`${inputClasses} resize-none ${errors.message ? 'border-red-300 focus:ring-red-500' : ''}`}
              value={form.message}
              onChange={(e) => {
                setForm({ ...form, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: '' });
                if (success) setSuccess(false);
              }}
              placeholder="How can we help you? Please provide as much detail as possible..."
              disabled={sending}
              maxLength={1000}
            />
            <div className="flex justify-between">
              {errors.message && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.message}
                </p>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                {form.message.length}/1000
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={sending || success}
            className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${
              success 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Sent Successfully
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            🔒 We'll never share your information with third parties.
          </p>
        </form>
      </div>
    </PublicPageShell>
  );
}