import { motion } from "framer-motion";
import { Award, Globe, Heart, ShieldCheck, Sparkles, Users, Zap, Star, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "../../components/common/Footer";

const stats = [
  { icon: Users, value: "500+", label: "Happy Customers" },
  { icon: Award, value: "100+", label: "Verified Providers" },
  { icon: Heart, value: "1,000+", label: "Events Managed" },
  { icon: Globe, value: "50+", label: "Cities Covered" },
];

const values = [
  {
    title: "Trust by design",
    description: "Customers should feel informed at every step, from service discovery to booking completion.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Quality over noise",
    description: "We focus on verified providers, clearer service presentation, and a cleaner event planning workflow.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Human support matters",
    description: "Planning real events means real coordination. We aim to make help easy to reach when it counts.",
    gradient: "from-amber-500 to-orange-500",
  },
];

export function AboutPage() {
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
      <section className="relative overflow-hidden pt-10 sm:pt-14 md:pt-16 pb-10 sm:pb-14 md:pb-16 px-4 sm:px-6">
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
              <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">✨ About EventMitra</span>
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
              A more professional way
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x relative inline-block">
                to connect events
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
              EventMitra was built to reduce the chaos of event planning and replace it with better visibility, stronger trust, and a cleaner booking experience.
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
                  <button className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 hover:from-primary-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold rounded-xl border-0 inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Explore Services</span>
                    <span className="sm:hidden">Explore</span>
                  </button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Premium Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-blue-500/5 to-indigo-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 sm:p-5 border border-white/60 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-500 text-center">
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 rounded-lg bg-gradient-to-br from-primary-500 to-blue-500 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-display font-black text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-600 font-medium">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
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
              <span className="text-xs font-bold text-primary-700 tracking-wide">OUR STORY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              Built around trust, clarity, and{" "}
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                better coordination
              </span>
            </h2>
            <p className="hidden sm:block text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We saw how difficult it was for families and businesses to find dependable event professionals without endless back-and-forth, unclear pricing, and fragmented communication.
            </p>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-base leading-7 text-slate-600 mb-4">
                EventMitra brings that process into a more thoughtful experience by helping customers browse services confidently, compare providers cleanly, and track bookings from request to completion.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl p-5 shadow-lg shadow-slate-200/20">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-700">
                    Mission
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Make event booking feel more reliable, polished, and customer-first.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl p-5 shadow-lg shadow-slate-200/20">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-700">
                    Promise
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Better discovery, better provider presentation, and stronger booking visibility.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900"
                alt="Event planning"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 left-6 rounded-2xl bg-slate-950 px-6 py-5 text-white shadow-xl">
                <p className="font-display text-2xl font-bold">5+ years</p>
                <p className="text-sm text-slate-300">shaping better event experiences</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="relative py-8 sm:py-10 md:py-12 px-4 sm:px-6">
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
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 tracking-wide">OUR VALUES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              Principles that shape every{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                interaction
              </span>
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Trust, quality, and human support guide every decision we make for our customers and providers.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                <div className="relative bg-white/90 backdrop-blur-2xl rounded-2xl p-5 sm:p-6 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-primary-200/30 border border-white/60 hover:border-primary-200/50 transition-all duration-500 h-full">
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${value.gradient} shadow-lg shadow-primary-500/20 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-700 transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {value.description}
                  </p>
                  
                  {/* Hover Arrow */}
                  <div className="mt-4 flex items-center gap-1.5 text-primary-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                    <span className="text-xs">Learn more</span>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-8 sm:py-10 md:py-12 px-4 sm:px-6">
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

            <div className="relative px-6 py-10 sm:px-10 sm:py-12 md:px-12 md:py-14 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white/90 tracking-wide">READY TO GET STARTED?</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight">
                  Ready to explore the platform?
                </h2>
                
                <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                  Browse categories, compare providers, and experience the new customer-first design across the booking journey.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link to="/services">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button className="bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 hover:from-primary-600 hover:via-blue-600 hover:to-indigo-600 text-white shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 px-6 py-3.5 text-base font-bold rounded-xl border-0 inline-flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Explore Services
                      </button>
                    </motion.div>
                  </Link>
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
