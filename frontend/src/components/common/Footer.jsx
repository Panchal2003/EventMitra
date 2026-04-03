import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, MapPin, Phone, ArrowUp, Send, Sparkles, Shield, Clock, Users } from "lucide-react";
import logo from "/logo.png";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      </div>

      {/* Main Footer Content */}
      <div className="relative py-8 sm:py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8">
            {/* Brand Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg shadow-primary-500/30">
                  <img src={logo} alt="EventMitra" className="h-7 w-7" />
                </div>
                <span className="font-display font-bold text-2xl text-white">EventMitra</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-xs">
                Your one-stop solution for all event services. Making event planning simple, elegant, and memorable.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                    <Mail className="h-4 w-4 text-primary-400" />
                  </div>
                  <span>hello@eventmitra.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                    <Phone className="h-4 w-4 text-primary-400" />
                  </div>
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                    <MapPin className="h-4 w-4 text-primary-400" />
                  </div>
                  <span>Mumbai, India</span>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-3">
                {[
                  { icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" },
                  { icon: "M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" },
                  { icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 hover:bg-primary-500 text-slate-400 hover:text-white transition-all duration-300 border border-slate-700 hover:border-primary-500 shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Services</h4>
              <ul className="space-y-2">
                {[
                  { to: "/services", text: "Browse Services" },
                  { to: "/services", text: "Categories" },
                  { to: "/services", text: "Pricing" },
                  { to: "/services", text: "How It Works" }
                ].map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.to} 
                      className="text-slate-400 hover:text-primary-400 transition-colors duration-200 text-sm font-medium flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2">
                {[
                  { to: "/about", text: "About Us" },
                  { to: "/contact", text: "Contact" },
                  { to: "/careers", text: "Careers" },
                  { to: "/press", text: "Press" }
                ].map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.to} 
                      className="text-slate-400 hover:text-primary-400 transition-colors duration-200 text-sm font-medium flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-2">
                {[
                  { href: "#", text: "Help Center" },
                  { href: "#", text: "Privacy Policy" },
                  { href: "#", text: "Terms of Service" },
                  { href: "#", text: "Cookie Policy" }
                ].map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-slate-400 hover:text-primary-400 transition-colors duration-200 text-sm font-medium flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          >
            {[
              { icon: Users, label: "Active Users", value: "10K+", color: "from-blue-500 to-cyan-500" },
              { icon: Sparkles, label: "Services", value: "500+", color: "from-violet-500 to-purple-500" },
              { icon: Shield, label: "Verified Providers", value: "1K+", color: "from-emerald-500 to-teal-500" },
              { icon: Clock, label: "Events Completed", value: "5K+", color: "from-amber-500 to-orange-500" }
            ].map((stat, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700 p-3 text-center backdrop-blur-sm"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white mx-auto mb-2 shadow-lg`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="font-display text-xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 p-5 sm:p-6 mb-8"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-display text-xl font-bold text-white mb-1">Stay Updated</h3>
                <p className="text-primary-100 text-sm">Subscribe to our newsletter for the latest updates and offers.</p>
              </div>
              <div className="flex w-full sm:w-auto gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-600 font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Send className="h-4 w-4" />
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-slate-700">
            <p className="text-center sm:text-left text-sm text-slate-400">
              © 2024 EventMitra. All rights reserved. Made with{" "}
              <Heart className="inline h-3 w-3 text-red-500 fill-red-500" />{" "}
              for event planners.
            </p>
            
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                🇮🇳 Made in India
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                🌟 500+ Customers
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                ⭐ 4.9 Rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </footer>
  );
}
