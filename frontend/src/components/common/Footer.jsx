import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Clock,
  Heart,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { publicApi } from "../../services/api";
import logo from "/logo.png";

const serviceLinks = [
  { to: "/services", text: "Browse Services" },
  { to: "/services", text: "Service Categories" },
  { to: "/gallery", text: "Provider Gallery" },
  { to: "/contact", text: "Booking Help" },
];

const companyLinks = [
  { to: "/about", text: "About Us" },
  { to: "/contact", text: "Contact" },
  { to: "/gallery", text: "Gallery" },
  { to: "/", text: "Home" },
];

const supportLinks = [
  { to: "/contact", text: "Support Center" },
  { to: "/login", text: "Customer Login" },
  { to: "/admin-login", text: "Admin Login" },
  { to: "/about", text: "Platform Info" },
];

const quickActionLinks = [
  { href: "mailto:hello@eventmitra.com", label: "Email", icon: Mail, tone: "hover:bg-sky-600" },
  { href: "tel:+919876543210", label: "Call", icon: Phone, tone: "hover:bg-emerald-600" },
  { to: "/contact", label: "Support", icon: MessageCircle, tone: "hover:bg-primary-600" },
  { to: "/gallery", label: "Gallery", icon: ImageIcon, tone: "hover:bg-amber-600" },
];

function FooterLinkList({ links }) {
  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.text}>
          <Link
            to={link.to}
            className="group flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-primary-400"
          >
            <span className="h-1 w-1 rounded-full bg-primary-500 opacity-0 transition-opacity group-hover:opacity-100" />
            {link.text}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  const [expandedSections, setExpandedSections] = useState({});
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [stats, setStats] = useState(null);
  const [newsletterState, setNewsletterState] = useState({
    success: false,
    error: "",
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsResponse, categoriesResponse] = await Promise.all([
          publicApi.getStats(),
          publicApi.getServiceCategories()
        ]);
        
        const statsData = statsResponse.data?.data || {};
        
        if (categoriesResponse.data?.data) {
          statsData.totalServiceCategories = categoriesResponse.data.data.length;
        }
        
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching footer stats:", error);
      }
    };
    
    fetchStats();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    const trimmedEmail = newsletterEmail.trim();

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setNewsletterState({
        success: false,
        error: "Enter a valid email address.",
      });
      return;
    }

    setNewsletterState({
      success: true,
      error: "",
    });
    setNewsletterEmail("");
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      </div>

      <div className="relative px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="space-y-4 lg:hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-700 bg-slate-800/50 p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-primary-500/30">
                  <img src={logo} alt="EventMitra" className="h-6 w-6" />
                </div>
                <span className="font-display text-xl font-bold text-white">EventMitra</span>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-slate-400">
                Your one-stop platform for event discovery, provider comparison, and booking support.
              </p>

              <div className="flex flex-wrap gap-2">
                <a
                  href="mailto:hello@eventmitra.com"
                  className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5 text-primary-400" />
                  <span>Email</span>
                </a>
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5 text-primary-400" />
                  <span>Call</span>
                </a>
                <div className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-xs text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-primary-400" />
                  <span>India</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {quickActionLinks.map((item) => {
                  const Icon = item.icon;
                  const actionClassName = `flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 bg-slate-700 text-slate-400 transition-all duration-300 hover:text-white ${item.tone}`;

                  if (item.to) {
                    return (
                      <motion.div key={item.label} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}>
                        <Link to={item.to} className={actionClassName} aria-label={item.label}>
                          <Icon className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      whileHover={{ scale: 1.08, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={actionClassName}
                      aria-label={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {[
              { id: "services", title: "Services", links: serviceLinks },
              { id: "company", title: "Company", links: companyLinks },
              { id: "support", title: "Support", links: supportLinks },
            ].map((section) => (
              <div key={section.id} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/50">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white">{section.title}</h4>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 transition-transform ${
                      expandedSections[section.id] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections[section.id] ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-5 pb-5"
                  >
                    <FooterLinkList links={section.links} />
                  </motion.div>
                ) : null}
              </div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 p-5"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white blur-2xl" />
              </div>
              <div className="relative">
                <h3 className="mb-2 font-display text-lg font-bold text-white">Stay Updated</h3>
                <p className="mb-4 text-xs text-primary-100">Subscribe for platform updates and offers.</p>
                <form className="flex flex-col gap-2" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(event) => {
                      setNewsletterEmail(event.target.value);
                      if (newsletterState.error || newsletterState.success) {
                        setNewsletterState({ success: false, error: "" });
                      }
                    }}
                    className="w-full rounded-xl border border-white/30 bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                    Subscribe
                  </motion.button>
                  {newsletterState.error ? (
                    <p className="text-xs text-white/85">{newsletterState.error}</p>
                  ) : null}
                  {newsletterState.success ? (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white">
                      <CheckCircle2 className="h-4 w-4" />
                      Thanks, we will keep you updated.
                    </div>
                  ) : null}
                </form>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:block">
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="sm:col-span-2 lg:col-span-1"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg shadow-primary-500/30">
                    <img src={logo} alt="EventMitra" className="h-7 w-7" />
                  </div>
                  <span className="font-display text-2xl font-bold text-white">EventMitra</span>
                </div>

                <p className="mb-4 max-w-xs text-sm leading-relaxed text-slate-400">
                  Your one-stop platform for event discovery, provider comparison, and booking support.
                </p>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
                      <Mail className="h-4 w-4 text-primary-400" />
                    </div>
                    <span>hello@eventmitra.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
                      <Phone className="h-4 w-4 text-primary-400" />
                    </div>
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
                      <MapPin className="h-4 w-4 text-primary-400" />
                    </div>
                    <span>Serving customers across India</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {quickActionLinks.map((item) => {
                    const Icon = item.icon;
                    const actionClassName = `flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 shadow-sm transition-all duration-300 hover:text-white ${item.tone}`;

                    if (item.to) {
                      return (
                        <motion.div key={item.label} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}>
                          <Link to={item.to} className={actionClassName} aria-label={item.label}>
                            <Icon className="h-4 w-4" />
                          </Link>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={actionClassName}
                        aria-label={item.label}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Services</h4>
                <FooterLinkList links={serviceLinks} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Company</h4>
                <FooterLinkList links={companyLinks} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Support</h4>
                <FooterLinkList links={supportLinks} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 p-5 sm:p-6"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white blur-3xl" />
              </div>

              <div className="relative flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-center sm:text-left">
                  <h3 className="mb-1 font-display text-xl font-bold text-white">Stay Updated</h3>
                  <p className="text-sm text-primary-100">Subscribe for platform updates and offers.</p>
                </div>

                <form className="flex w-full gap-3 sm:w-auto" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(event) => {
                      setNewsletterEmail(event.target.value);
                      if (newsletterState.error || newsletterState.success) {
                        setNewsletterState({ success: false, error: "" });
                      }
                    }}
                    className="flex-1 rounded-xl border border-white/30 bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 sm:w-64"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 shadow-lg transition-all duration-300 hover:shadow-xl"
                  >
                    <Send className="h-4 w-4" />
                    Subscribe
                  </motion.button>
                </form>
              </div>

              {newsletterState.error ? (
                <p className="relative mt-3 text-sm text-white/85">{newsletterState.error}</p>
              ) : null}
              {newsletterState.success ? (
                <div className="relative mt-3 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white">
                  <CheckCircle2 className="h-4 w-4" />
                  Thanks, we will keep you updated.
                </div>
              ) : null}
            </motion.div>
          </div>

           <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            {[
              { icon: Users, label: "Active Users", key: "totalBookings", default: "500+", color: "from-blue-500 to-cyan-500" },
              { icon: Sparkles, label: "Services", key: "totalServiceCategories", default: "3", color: "from-violet-500 to-purple-500" },
              { icon: Shield, label: "Verified Providers", key: "totalProviders", default: "100+", color: "from-emerald-500 to-teal-500" },
              { icon: Clock, label: "24/7 Support", key: "supportHours", default: "24/7", color: "from-amber-500 to-orange-500" },
            ].map((stat) => {
              const value = stats && stats[stat.key] ? (stats[stat.key] > 0 ? `${stats[stat.key]}+` : stat.default) : stat.default;
              return (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-3 text-center backdrop-blur-sm"
              >
                <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${stat.color}`} />
                <div
                  className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-lg`}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="mb-0.5 font-display text-lg font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
              );
            })}
          </motion.div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-700 pt-6 sm:flex-row">
            <p className="text-center text-sm text-slate-400 sm:text-left">
              Copyright 2024 EventMitra. All rights reserved. Made with{" "}
              <Heart className="inline h-3 w-3 fill-red-500 text-red-500" /> for event planners.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5">
                Made in India
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5">
                500+ Customers
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5">
                4.9 Rating
              </span>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-blue-600 text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/40"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </footer>
  );
}
