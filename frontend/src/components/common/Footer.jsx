import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { publicApi } from "../../services/api";
import logo from "/logo.png";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const supportLinks = [
  { to: "/services", label: "Browse Services" },
  { to: "/contact", label: "Booking Support" },
  { to: "/about", label: "Platform Overview" },
];

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "https://wa.me/919876543210", label: "WhatsApp", icon: MessageCircle },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
];

function FooterLinkList({ title, links }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-sky-700"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [statsResponse] = await Promise.all([publicApi.getStats()]);

        setStats(statsResponse.data?.data || null);
      } catch (error) {
        console.error("Error fetching footer data:", error);
      }
    };

    fetchFooterData();
  }, []);

  const scrollToTop = () => {
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });

    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: "smooth" });
    }

    const scrollableElement = document.querySelector(".overflow-y-auto");
    if (scrollableElement && scrollableElement !== mainElement) {
      scrollableElement.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentYear = new Date().getFullYear();
  const partnerCount = stats?.totalProviders ? `${stats.totalProviders}+` : "100+";
  const ratingValue = stats?.avgRating ? `${stats.avgRating}/5` : "4.9/5";

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(186,230,253,0.28),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 right-0 h-52 w-52 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-cyan-100/45 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.7)_1px,transparent_1px)] bg-[size:56px_56px]" />
        </div>
      </div>

      <div className="relative px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 border-b border-slate-200/80 pb-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[26px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.10)] backdrop-blur-xl"
            >
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-sky-100">
                  <img src={logo} alt="EventMitra" className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">EventMitra</p>
                  <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-slate-950">
                    Plan with clarity
                  </h3>
                </div>
              </Link>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
                Discover services, compare verified partners, and move from inquiry to booking with a cleaner,
                more dependable planning experience.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                  {partnerCount} verified partners
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                  {ratingValue} average rating
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 lg:contents">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
              >
                <FooterLinkList title="Quick Links" links={quickLinks} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <FooterLinkList title="Support" links={supportLinks} />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="space-y-5"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Contact</p>
                <div className="mt-4 space-y-3">
                  <a
                    href="mailto:hello@eventmitra.com"
                    className="flex items-center gap-3 text-sm text-slate-600 transition-colors hover:text-sky-700"
                  >
                    <Mail className="h-4 w-4 text-sky-600" />
                    <span>hello@eventmitra.com</span>
                  </a>
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-3 text-sm text-slate-600 transition-colors hover:text-sky-700"
                  >
                    <Phone className="h-4 w-4 text-sky-600" />
                    <span>+91 98765 43210</span>
                  </a>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-sky-600" />
                    <span>Available across India</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Social</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {socialLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.06, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-600 shadow-sm shadow-slate-100 transition-colors hover:text-sky-700"
                        aria-label={item.label}
                      >
                        <Icon className="h-4 w-4" />
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-slate-500">
              Copyright {currentYear} EventMitra. Crafted for a more dependable event planning experience.
            </p>
          </motion.div>
        </div>
      </div>

      <motion.button
        onClick={scrollToTop}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-5 bottom-24 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-sky-200/70 md:right-6 md:bottom-6"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </footer>
  );
}
