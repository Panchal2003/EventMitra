import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { publicApi } from "../../services/api";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send, Sparkles, Zap, Globe, CheckCircle2 } from "lucide-react";
import { Footer } from "../../components/common/Footer";
import { useUI } from "../../context/UIContext";

const contactItems = [
  {
    icon: MapPin,
    title: "Office Address",
    description: "123 Event Street, Celebration City, India",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Clock,
    title: "Working Hours",
    description: "24*7 available",
    extra: "We respond continuously for booking and support requests.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: MessageCircle,
    title: "Customer Support",
    description: "Reach our team for bookings, providers, OTP, and account issues.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "+91 98765 43210",
    gradient: "from-violet-500 to-purple-500",
  },
];

export function ContactPage() {
  const { hideBottomNav, showBottomNav } = useUI();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    serviceInterest: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statsData, setStatsData] = useState(null);

  const handleInputFocus = () => hideBottomNav();
  const handleInputBlur = () => showBottomNav();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await publicApi.getStats();
        if (response.data?.data) {
          setStatsData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await publicApi.submitContact(formData);
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", city: "", serviceInterest: "", subject: "", message: "" });
    } catch (error) {
      setIsSubmitting(false);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Secondary floating elements */}
        <div className="absolute top-1/4 left-1/4 h-32 w-32 bg-gradient-to-r from-emerald-200/30 to-teal-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/3 right-1/3 h-24 w-24 bg-gradient-to-r from-violet-200/40 to-purple-200/30 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-2 pb-0 px-4 sm:px-6">
        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-2xl border border-white/60 shadow-xl shadow-slate-200/30"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-500 shadow-lg shadow-primary-500/30">
                <Mail className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">✨ Contact EventMitra</span>
              <div className="h-3 w-px bg-slate-300" />
              <span className="text-[10px] font-semibold text-primary-600">NEW</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-slate-900 mb-5 leading-[0.9] tracking-tight"
            >
              Talk to a team that
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x relative inline-block">
                understands events
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 rounded-full opacity-90" />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed font-medium"
            >
              Reach out for platform support, booking guidance, provider-related questions, or general help with planning your next event.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-row gap-3 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 hover:from-primary-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold rounded-xl border-0 inline-flex items-center gap-2"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Send Message</span>
                  <span className="sm:hidden">Contact</span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Premium Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            {[
              { value: "24h", label: "Response Time", icon: Clock },
              { value: "500+", label: "Happy Customers", icon: CheckCircle2, dataKey: "totalBookings", suffix: "+" },
              { value: "100+", label: "Verified Providers", icon: Globe, dataKey: "totalProviders", suffix: "+" },
              { value: "4.9★", label: "Average Rating", icon: Sparkles, dataKey: "avgRating", suffix: "★" },
            ].map((stat, index) => {
              let displayValue = stat.value;
              if (statsData && stat.dataKey) {
                const dataValue = statsData[stat.dataKey];
                if (dataValue > 0) {
                  displayValue = stat.suffix === "★" ? `${dataValue}★` : `${dataValue}${stat.suffix}`;
                }
              }
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 rounded-xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl ${[
                    "bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-blue-500/20",
                    "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
                    "bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-purple-500/20",
                    "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20",
                  ][index]}`} />
                  <div className={`relative rounded-2xl border bg-white/85 p-4 text-center shadow-lg shadow-slate-200/20 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl ${
                    ["border-cyan-100/80", "border-emerald-100/80", "border-violet-100/80", "border-amber-100/80"][index]
                  }`}>
                    <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${[
                      "bg-gradient-to-br from-cyan-500 to-blue-600",
                      "bg-gradient-to-br from-emerald-500 to-teal-600",
                      "bg-gradient-to-br from-violet-500 to-fuchsia-600",
                      "bg-gradient-to-br from-amber-500 to-orange-600",
                    ][index]}`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-display font-black text-slate-900 mb-1">{displayValue}</p>
                    <p className="text-xs font-semibold text-slate-600">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-8 sm:py-10 md:py-12 px-4 sm:px-6">
        {/* Section Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100">
              <Zap className="h-3.5 w-3.5 text-primary-600" />
              <span className="text-xs font-bold text-primary-700 tracking-wide">GET IN TOUCH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              We keep support{" "}
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                accessible and practical
              </span>
            </h2>
            <p className="hidden sm:block text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Fill out the form or use the contact methods below if you need booking help, provider guidance, or general platform support.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            {/* Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 self-start"
            >
              <div className="space-y-4">
                {contactItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="group relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                      <div className="relative rounded-3xl border border-white/60 bg-white/90 p-4 shadow-lg shadow-slate-200/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-200/30">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg shadow-primary-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-950 group-hover:text-primary-700 transition-colors duration-300">{item.title}</h3>
                            <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                            {item.extra ? (
                              <p className="mt-1 text-xs text-slate-500">{item.extra}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Coverage Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="overflow-hidden rounded-2xl border border-white/60 bg-white/90 backdrop-blur-2xl shadow-lg shadow-slate-200/20"
              >
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-primary-800 to-blue-700 px-6 py-4 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                    Support Coverage
                  </p>
                  <p className="mt-1 text-sm text-slate-300">We support customers and providers across India.</p>
                </div>
                <div className="space-y-4 p-6">
                  <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-blue-50 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">
                      Based in India
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Reach EventMitra for booking help, provider support, or account issues by phone or email. We are available for event planning questions across major Indian cities.
                    </p>
                  </div>
                  
                  {/* Location Map */}
                  <div className="rounded-2xl overflow-hidden border border-slate-200">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.0599497639943!2d73.82878766488628!3d18.5648139804696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf71e3d7d45b%3A0x3c4e6e4f8e5f5b5c!2sPune%2C%20Maharashtra%2C%20India!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                      width="100%" 
                      height="200" 
                      style={{ border: 0 }} 
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full"
                      title="EventMitra Location"
                    />
                    <div className="bg-slate-100 px-4 py-2">
                      <p className="text-xs font-semibold text-slate-600">Pune, Maharashtra, India</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href="tel:+919876543210"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-300 hover:text-primary-700"
                    >
                      <Phone className="h-4 w-4" />
                      Call support
                    </a>
                    <a
                      href="mailto:support@eventmitra.com"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary-300 hover:text-primary-700"
                    >
                      <Mail className="h-4 w-4" />
                      Email support
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              id="contact-form"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="self-start bg-white/90 backdrop-blur-2xl rounded-2xl p-8 shadow-xl border border-white/60"
            >
              <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg overflow-hidden">
                  <img src="/logo.png" alt="EventMitra Logo" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-slate-950">EventMitra</p>
                  <p className="text-sm text-slate-500">Customer support and event planning assistance</p>
                </div>
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">
                Send a Message
              </p>
              <h2 className="mt-4 font-display text-2xl font-bold text-slate-950">
                Tell us what you need help with.
              </h2>

              {submitted ? (
                <div className="mt-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 to-primary-700 text-white shadow-lg">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-slate-950">
                    Message sent successfully
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                        placeholder="Sarah Johnson"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                        placeholder="sarah@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(event) => setFormData({ ...formData, city: event.target.value })}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                        placeholder="Mumbai"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Service Interested In</label>
                    <select
                      value={formData.serviceInterest}
                      onChange={(event) => setFormData({ ...formData, serviceInterest: event.target.value })}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                    >
                      <option value="">Select a service</option>
                      <option value="Mehndi Design">Mehndi Design</option>
                      <option value="DJ">DJ</option>
                      <option value="Photographer">Photographer</option>
                      <option value="Catering">Catering</option>
                      <option value="Decoration">Decoration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Message</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                      placeholder="Tell us more about your query, event, or support need..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-6 py-4 font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:shadow-xl hover:shadow-primary-500/40 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
