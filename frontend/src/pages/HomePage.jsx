import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck2,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Search,
  Shield,
  Clock,
  CreditCard,
  Award,
  CheckCircle2,
  Quote,
  ChevronRight,
  Zap,
  Heart,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Footer } from "../components/common/Footer";
import logo from "/logo.png";

const features = [
  {
    icon: Sparkles,
    title: "Curated Categories",
    description: "Explore diverse event service categories tailored to your needs",
  },
  {
    icon: CalendarCheck2,
    title: "Smooth Booking",
    description: "From discovery to booking with transparent pricing and updates",
  },
  {
    icon: ShieldCheck,
    title: "Verified Providers",
    description: "Work with trusted, professional service providers",
  },
  {
    icon: Users,
    title: "Expert Support",
    description: "24/7 customer support for all your event planning needs",
  },
];

const stats = [
  { value: "500+", label: "Bookings Completed", icon: CheckCircle2 },
  { value: "100+", label: "Verified Providers", icon: Shield },
  { value: "24/7", label: "Customer Support", icon: Clock },
  { value: "4.9★", label: "Average Rating", icon: Star },
];

const serviceCategories = [
  { icon: "🎭", title: "Wedding Planning", count: "120+ providers", color: "from-rose-500 to-pink-500" },
  { icon: "🎂", title: "Celebrations", count: "85+ providers", color: "from-amber-500 to-orange-500" },
  { icon: "💼", title: "Corporate Events", count: "60+ providers", color: "from-blue-500 to-indigo-500" },
  { icon: "🍽️", title: "Catering", count: "95+ providers", color: "from-emerald-500 to-teal-500" },
  { icon: "🎵", title: "Entertainment", count: "75+ providers", color: "from-violet-500 to-purple-500" },
  { icon: "✨", title: "Decorations", count: "110+ providers", color: "from-cyan-500 to-blue-500" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Wedding Planner",
    content: "EventMitra made my wedding planning effortless. The verified providers and seamless booking process saved me weeks of work!",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    role: "Corporate Manager",
    content: "Outstanding platform for corporate events. The quality of service providers and the support team exceeded our expectations.",
    rating: 5,
    avatar: "RV",
  },
  {
    name: "Anita Patel",
    role: "Event Organizer",
    content: "The best event planning platform I've used. Premium quality, transparent pricing, and excellent customer service.",
    rating: 5,
    avatar: "AP",
  },
];

const premiumFeatures = [
  {
    icon: Shield,
    title: "Verified Professionals",
    description: "All service providers are thoroughly vetted and verified for quality assurance",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock customer support to ensure your event runs smoothly",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Star,
    title: "Premium Quality",
    description: "Access to top-tier event services with guaranteed satisfaction",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Safe and secure payment processing with multiple payment options",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Expert Network",
    description: "Connect with experienced event professionals across all categories",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: Award,
    title: "Award-Winning Platform",
    description: "Recognized for excellence in event planning and customer satisfaction",
    gradient: "from-cyan-500 to-blue-500",
  },
];

const rotatingTexts = [
 { text: "Luxury Events", color: "from-yellow-500 via-amber-500 to-orange-500" },
  { text: "Grand Weddings", color: "from-pink-500 via-rose-500 to-red-500" },
  { text: "Elite Planning", color: "from-indigo-500 via-purple-500 to-pink-500" },
  { text: "Memorable Nights", color: "from-sky-500 via-blue-500 to-indigo-500" },
  { text: "Joyful Celebrations", color: "from-green-500 via-emerald-500 to-teal-500" },
  { text: "Magical Moments", color: "from-fuchsia-500 via-pink-500 to-rose-500" },
  { text: "Premium Experience", color: "from-orange-500 via-red-500 to-pink-500" },
  { text: "Royal Events", color: "from-purple-500 via-violet-500 to-indigo-500" },
  { text: "Festive Vibes", color: "from-lime-500 via-green-500 to-teal-500" },
  { text: "Elegant Setup", color: "from-slate-500 via-gray-500 to-zinc-500" },
  { text: "Perfect Memories", color: "from-cyan-500 via-blue-500 to-indigo-500" },
  { text: "Big Celebrations", color: "from-red-500 via-orange-500 to-yellow-500" },
  { text: "Happy Moments", color: "from-emerald-500 via-green-500 to-lime-500" },
  { text: "Dream Events", color: "from-blue-500 via-indigo-500 to-purple-500" },
  { text: "Stylish Parties", color: "from-pink-500 via-fuchsia-500 to-purple-500" }
];

export function HomePage() {
  const { isAuthenticated } = useAuth();

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
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">✨ Premium Event Planning</span>
              <div className="h-3 w-px bg-slate-300" />
              <span className="text-[10px] font-semibold text-primary-600">NEW</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-slate-900 mb-5 leading-[0.9] tracking-tight"
            >
              Plan Your Perfect
              <br />
<span className="relative inline-block min-w-[300px] sm:min-w-[400px] overflow-hidden">
                  <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ 
                      duration: 20, 
                      repeat: Infinity, 
                      ease: "linear"
                    }}
                  >
                    {[...rotatingTexts, ...rotatingTexts].map((item, i) => (
                      <span key={i} className={`inline-flex items-center mx-6 bg-clip-text text-transparent bg-gradient-to-r ${item.color}`}>
                        {item.text}
                      </span>
                    ))}
                  </motion.div>
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
              Discover, book, and manage premium event services with our curated network of verified professionals.
              From intimate gatherings to spectacular celebrations, we make every moment unforgettable.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-row gap-3 justify-center items-center"
            >
              <Link to="/services">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 hover:from-primary-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold rounded-xl border-0">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Explore Premium Services</span>
                    <span className="sm:hidden">Explore</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </motion.div>
              </Link>

              {!isAuthenticated && (
                <Link to="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="secondary" className="bg-white/95 backdrop-blur-2xl border-2 border-slate-200/70 hover:border-primary-300 text-slate-700 hover:text-primary-700 shadow-xl hover:shadow-2xl transition-all duration-300 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold rounded-xl">
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">Start Your Journey</span>
                      <span className="sm:hidden">Start</span>
                    </Button>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* Premium Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-blue-500/5 to-indigo-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 border border-white/60 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-500 text-center">
                  <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-display font-black text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-slate-600 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="relative py-4 sm:py-6 md:py-8 px-4 sm:px-6 pb-0">
        {/* Section Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-5"
          >
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100">
              <Zap className="h-3.5 w-3.5 text-primary-600" />
              <span className="text-xs font-bold text-primary-700 tracking-wide">WHY CHOOSE US</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EventMitra
              </span>
              ?
            </h2>
            <p className="hidden sm:block text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Experience the difference with our premium event planning platform designed for excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                <div className="relative bg-white/90 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-primary-200/30 border border-white/60 hover:border-primary-200/50 transition-all duration-500 h-full">
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg shadow-primary-500/20 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="hidden sm:block text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Hover Arrow */}
                  <div className="mt-4 flex items-center gap-1.5 text-primary-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                    <span className="text-xs">Learn more</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="relative py-4 sm:py-6 md:py-8 px-4 sm:px-6 pb-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.03)_1px,transparent_0)] bg-[size:40px_40px]" />
        </div>
        
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-5"
          >
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 tracking-wide">EXPLORE CATEGORIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              Service{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Categories
              </span>
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Explore all available event services with verified providers ready to make your event special
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500`} />
                <div className="relative bg-white/90 backdrop-blur-xl rounded-xl p-4 sm:p-5 border border-white/60 shadow-md shadow-slate-200/20 hover:shadow-lg hover:shadow-primary-200/30 transition-all duration-500 cursor-pointer text-center h-full">
                  {/* Icon */}
                  <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 filter drop-shadow-lg">
                    {category.icon}
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-1 group-hover:text-primary-700 transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">{category.count}</p>
                  
                  {/* Hover Indicator */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${category.color} rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mt-8"
          >
            <Link to="/services">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="secondary" className="bg-white/90 backdrop-blur-xl border-2 border-slate-200/60 hover:border-primary-300 text-slate-700 hover:text-primary-700 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 font-bold rounded-xl text-sm">
                  View All Services
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-4 sm:py-6 md:py-8 px-4 sm:px-6 pb-0">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/30 to-transparent" />
        
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-5"
          >
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
              <Heart className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-xs font-bold text-rose-700 tracking-wide">TESTIMONIALS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              Loved by{" "}
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              See what our customers have to say about their experience with EventMitra
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-pink-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                <div className="relative bg-white/90 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-rose-200/30 border border-white/60 hover:border-rose-200/50 transition-all duration-500 h-full">
                  {/* Quote Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/20 mb-4">
                    <Quote className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  
                  {/* Content */}
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg">
                      <span className="text-white font-bold text-xs">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{testimonial.name}</p>
                      <p className="text-xs text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative py-4 sm:py-6 md:py-8 px-4 sm:px-6 pb-0">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-primary-400 via-blue-400 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-400 via-purple-400 to-transparent rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-cyan-400/30 to-teal-400/30 rounded-full blur-3xl" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative p-8 sm:p-10 md:p-12 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl"
              >
                <TrendingUp className="h-4 w-4 text-primary-400" />
                <span className="text-xs font-bold text-white tracking-wide">Ready to Get Started?</span>
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight"
              >
                Ready to Plan Your
                <br />
                <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Perfect Event?
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-slate-300 mb-6 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed"
              >
                Join thousands of satisfied customers who have planned their perfect events with EventMitra.
                Start your journey today and experience premium event planning.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                {!isAuthenticated ? (
                  <Link to="/login">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-xl shadow-white/20 hover:shadow-white/30 transition-all duration-300 px-6 py-3 text-base font-bold rounded-xl">
                        Start Booking Now
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Button>
                    </motion.div>
                  </Link>
                ) : (
                  <Link to="/services">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-xl shadow-white/20 hover:shadow-white/30 transition-all duration-300 px-6 py-3 text-base font-bold rounded-xl">
                        Explore Services
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Button>
                    </motion.div>
                  </Link>
                )}

                <Link to="/about">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="secondary" className="bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/30 backdrop-blur-xl px-6 py-3 text-base font-bold rounded-xl">
                      Learn More
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Secure Platform</span>
                </div>
                <div className="h-3 w-px bg-slate-600" />
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>24/7 Support</span>
                </div>
                <div className="h-3 w-px bg-slate-600" />
                <div className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5" />
                  <span>4.9★ Rating</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
