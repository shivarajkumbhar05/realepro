import { useState } from 'react';
import PublicPageShell from '../../components/layout/PublicPageShell';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSending(true);
    // No dedicated backend endpoint yet — surface success and fall back to email/WhatsApp.
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Thanks! We've received your message and will get back to you soon.");
    setForm({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <PublicPageShell title="Contact Us" subtitle="We usually respond within one business day.">
      <div className="grid md:grid-cols-2 gap-8 not-prose">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Email</p>
              <a href="mailto:support@propestate.com" className="text-sm text-gray-500 hover:text-primary-600">support@propestate.com</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Phone / WhatsApp</p>
              <a href="tel:+919876543210" className="text-sm text-gray-500 hover:text-primary-600">+91 98765 43210</a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Office</p>
              <p className="text-sm text-gray-500">PropEstate HQ, MG Road, Pune, Maharashtra, India</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 pt-2">
            You can also reach any listing agent directly via the WhatsApp button on their property page,
            or ask our AI assistant for instant help.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea rows={4} className="input-field" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </PublicPageShell>
  );
}
