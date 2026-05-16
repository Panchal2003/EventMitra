import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { publicApi } from "../services/api";
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Globe,
  Heart,
  Quote,
  Zap,
  Award,
  CheckCircle2,
  Shield,
  Clock,
  CreditCard,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { Footer } from "../components/common/Footer";

const stats = [
  { value: "500+", label: "Events Delivered", icon: CheckCircle2 },
  { value: "100+", label: "Verified Partners", icon: Shield },
  { value: "24/7", label: "Planning Support", icon: Clock },
  { value: "4.9/5", label: "Average Client Rating", icon: Star },
];

const cardGradients = [
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-cyan-500 to-blue-500",
];

function buildFeaturedServices(services = []) {
  const groups = new Map();

  services.forEach((service) => {
    const categoryId = service.category?._id || "uncategorized";
    const normalizedName = service.name?.trim().toLowerCase() || "service";
    const key = `${categoryId}::${normalizedName}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        name: service.name || "Unnamed Service",
        categoryName: service.category?.name || "General",
        partnerIds: new Set(),
      });
    }

    const group = groups.get(key);

    if (service.createdBy?._id) {
      group.partnerIds.add(service.createdBy._id);
    }
  });

  return Array.from(groups.values())
    .map((group, index) => ({
      key: group.key,
      name: group.name,
      categoryName: group.categoryName,
      partnerCount: group.partnerIds.size,
      color: cardGradients[index % cardGradients.length],
      code: group.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(""),
    }))
    .sort((left, right) => {
      if (right.partnerCount !== left.partnerCount) {
        return right.partnerCount - left.partnerCount;
      }

      return left.name.localeCompare(right.name);
    });
}

function getServiceCardLayoutClass(index, total) {
  if (total <= 5) {
    return "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc((100%-4rem)/5)]";
  }

  const lastRowCount = total % 5 || 5;
  const lastRowStartIndex = total - lastRowCount;
  const isLastRow = index >= lastRowStartIndex;

  if (!isLastRow || lastRowCount === 5) {
    return "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc((100%-4rem)/5)]";
  }

  if (lastRowCount === 1) {
    return "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(50%-0.75rem)] xl:w-[min(420px,calc((100%-4rem)/2))]";
  }

  if (lastRowCount === 2) {
    return "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(50%-0.75rem)] xl:w-[calc((100%-1rem)/2)]";
  }

  if (lastRowCount === 3) {
    return "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc((100%-2rem)/3)]";
  }

  return "w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(50%-0.75rem)] xl:w-[calc((100%-3rem)/4)]";
}

function getPublicFeedbackRole(role) {
  const normalizedRole = (role || "").trim().toLowerCase();

  if (!normalizedRole || normalizedRole === "customer") {
    return "Client";
  }

  return role;
}

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [testimonials, setTestimonials] = useState([
    {
      _id: "1",
      name: "Priya Sharma",
      role: "Private Client",
      content:
        "EventMitra helped us shortlist trusted partners quickly and kept the booking process structured from the first inquiry to final confirmation.",
      rating: 5,
    },
    {
      _id: "2",
      name: "Rahul Verma",
      role: "Corporate Communications Lead",
      content:
        "Our team used EventMitra to coordinate multiple event requirements with better visibility, faster response times, and more dependable execution.",
      rating: 5,
    },
    {
      _id: "3",
      name: "Anita Patel",
      role: "Event Consultant",
      content:
        "The platform brings together reliable partner discovery, transparent pricing, and responsive support in a way that feels efficient and professional.",
      rating: 5,
    },
  ]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await publicApi.getTestimonials();
        if (response.data?.data?.length > 0) {
          setTestimonials(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

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

    const fetchServices = async () => {
      try {
        const response = await publicApi.getServices();
        if (response.data?.data) {
          setFeaturedServices(buildFeaturedServices(response.data.data));
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchTestimonials();
    fetchStats();
    fetchServices();
  }, []);

  const rotatingTextsLine1 = [
    { text: "Wedding Celebrations", color: "from-pink-500 to-rose-500" },
    { text: "Destination Weddings", color: "from-rose-500 to-red-500" },
    { text: "Engagement Ceremonies", color: "from-purple-500 to-pink-500" },
    { text: "Haldi & Mehendi Events", color: "from-yellow-400 to-orange-500" },
    { text: "Sangeet Nights", color: "from-fuchsia-500 to-violet-500" },
    { text: "Birthday Parties", color: "from-orange-500 to-red-500" },
    { text: "Anniversary Celebrations", color: "from-red-400 to-pink-600" },
    { text: "Baby Shower Events", color: "from-cyan-400 to-blue-500" },
    { text: "Private Gatherings", color: "from-violet-500 to-purple-500" },
    { text: "Family Functions", color: "from-indigo-500 to-purple-500" },
    { text: "House Parties", color: "from-lime-500 to-green-500" },
    { text: "Corporate Events", color: "from-blue-500 to-cyan-500" },
    { text: "Annual Conferences", color: "from-sky-500 to-indigo-500" },
    { text: "Award Ceremonies", color: "from-amber-500 to-yellow-500" },
    { text: "Networking Meetups", color: "from-teal-500 to-cyan-500" },
  ];
  const rotatingTextsLine2 = [
    { text: "Team Building Activities", color: "from-green-500 to-emerald-500" },
    { text: "Product Launches", color: "from-cyan-500 to-blue-600" },
    { text: "Brand Activations", color: "from-emerald-500 to-teal-500" },
    { text: "Fashion Shows", color: "from-pink-600 to-fuchsia-500" },
    { text: "Music Festivals", color: "from-purple-600 to-indigo-500" },
    { text: "Live Concerts", color: "from-rose-500 to-red-600" },
    { text: "DJ Nights", color: "from-violet-600 to-purple-700" },
    { text: "Cultural Programs", color: "from-orange-500 to-amber-500" },
    { text: "College Festivals", color: "from-indigo-500 to-blue-500" },
    { text: "Sports Events", color: "from-green-500 to-lime-500" },
    { text: "Exhibitions & Expos", color: "from-cyan-500 to-sky-500" },
    { text: "Luxury Receptions", color: "from-yellow-500 to-amber-600" },
    { text: "Celebrity Events", color: "from-red-500 to-pink-500" },
    { text: "Charity & NGO Events", color: "from-emerald-400 to-green-600" },
    { text: "Religious Functions", color: "from-orange-400 to-red-500" },
  ];
  const mobileTickerServices =
    featuredServices.length > 0 ? [...featuredServices, ...featuredServices] : [];
  const latestTestimonials = [...testimonials]
    .sort((left, right) => {
      const leftTime = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right?.createdAt ? new Date(right.createdAt).getTime() : 0;

      if (!leftTime || !rightTime) {
        return 0;
      }

      return rightTime - leftTime;
    })
    .slice(0, 10);

  const premiumFeatures = [
    {
      icon: Shield,
      title: "Verified Partners",
      description:
        "Work with reviewed event partners selected for credibility, reliability, and service quality.",
      caption: "Reviewed profiles and stronger trust signals",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: Clock,
      title: "Responsive Support",
      description:
        "Get assistance across discovery, booking, and execution whenever planning needs move quickly.",
      caption: "Support when timelines and approvals move fast",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Star,
      title: "Quality-First Selection",
      description:
        "Evaluate services through clear profiles, delivery context, and proven client feedback.",
      caption: "Shortlist with more confidence and less guesswork",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: CreditCard,
      title: "Secure Transactions",
      description:
        "Manage bookings and payments through a protected, transparent, and confidence-driven flow.",
      caption: "Clearer payment handling across the booking journey",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Users,
      title: "Specialized Network",
      description:
        "Access partners across weddings, private events, hospitality, entertainment, and corporate formats.",
      caption: "One platform, multiple event specialties",
      gradient: "from-rose-500 to-pink-500",
    },
    {
      icon: Award,
      title: "Commercial Clarity",
      description:
        "Review pricing, inclusions, and timelines with fewer surprises and better decision-making.",
      caption: "Better visibility before you commit",
      gradient: "from-cyan-500 to-blue-500",
    },
  ];
  const valuePillars = [
    "Verified partner discovery",
    "Clearer booking coordination",
    "Support across planning and delivery",
  ];
  const closingHighlights = [
    {
      icon: Shield,
      title: "Verified partners",
      description: "Shortlist trusted partners across key event categories with better confidence.",
    },
    {
      icon: Sparkles,
      title: "Clear service comparison",
      description: "Review service options, partner availability, and planning fit in one place.",
    },
    {
      icon: Clock,
      title: "Responsive support",
      description: "Move from discovery to booking with dependable support throughout the process.",
    },
  ];
  const planningFlow = ["Discover services", "Compare partners", "Confirm with confidence"];
  const planningHighlights = [
    {
      value: statsData?.totalProviders ? `${statsData.totalProviders}+` : "100+",
      label: "Verified partners",
    },
    {
      value: featuredServices.length ? `${featuredServices.length}+` : "Live",
      label: "Service options",
    },
    {
      value: statsData?.totalBookings ? `${statsData.totalBookings}+` : "500+",
      label: "Events delivered",
    },
    {
      value: statsData?.supportHours || "24/7",
      label: "Planning support",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary-200/40 via-blue-200/30 to-indigo-200/20 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-emerald-200/30 to-teal-200/20 blur-2xl animate-bounce"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute right-1/3 bottom-1/3 h-24 w-24 rounded-full bg-gradient-to-r from-violet-200/40 to-purple-200/30 blur-2xl animate-bounce"
          style={{ animationDuration: "10s", animationDelay: "1s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-white/50" />
      </div>

      <section className="relative overflow-hidden pt-2 pb-0">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-gradient-to-r from-white/95 via-white/90 to-white/95 px-5 py-2.5 shadow-xl shadow-slate-200/30 backdrop-blur-2xl"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-500 shadow-lg shadow-primary-500/30">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700">
                Curated Event Services Platform
              </span>
              <div className="h-3 w-px bg-slate-300" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-600">
                Verified Partners
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-5 text-3xl font-display font-extrabold leading-[0.92] tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Book trusted partners for
              <br />
              <span className="relative inline-block min-w-[240px] overflow-hidden sm:min-w-[420px]">
                <motion.div
                   className="flex whitespace-nowrap"
                   animate={{ x: ["0%", "-50%"] }}
                   transition={{
                     duration: 120,
                     repeat: Infinity,
                     ease: "linear",
                   }}
                 >
                  {[...rotatingTextsLine1, ...rotatingTextsLine1].map((item, index) => (
                    <span
                      key={`${item.text}-${index}`}
                      className={`mx-6 inline-flex items-center bg-gradient-to-r bg-clip-text text-transparent ${item.color}`}
                    >
                      {item.text}
                    </span>
                  ))}
                </motion.div>
                <div className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 opacity-90" />
              </span>
              <br />
              <span className="relative inline-block min-w-[240px] overflow-hidden sm:min-w-[420px]">
                <motion.div
                   className="flex whitespace-nowrap"
                   animate={{ x: ["0%", "-50%"] }}
                   transition={{
                     duration: 120,
                     repeat: Infinity,
                     ease: "linear",
                   }}
                 >
                  {[...rotatingTextsLine2, ...rotatingTextsLine2].map((item, index) => (
                    <span
                      key={`${item.text}-${index}-line2`}
                      className={`mx-6 inline-flex items-center bg-gradient-to-r bg-clip-text text-transparent ${item.color}`}
                    >
                      {item.text}
                    </span>
                  ))}
                </motion.div>
                <div className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-primary-500 via-blue-500 to-indigo-500 opacity-90" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mb-8 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg md:text-[1.15rem] md:leading-8"
            >
              EventMitra helps clients discover, compare, and book verified event partners with clearer
              pricing, dependable support, and smoother coordination from inquiry to delivery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex w-full flex-row items-center justify-center gap-3"
            >
              <Link to="/services" className="flex-1 sm:flex-none">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                  <Button
                    size="lg"
                    className="w-full rounded-xl border-0 bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-primary-500/30 transition-all duration-300 hover:from-primary-700 hover:via-blue-700 hover:to-indigo-700 hover:shadow-primary-500/50 sm:w-auto sm:px-6 sm:py-3.5 sm:text-base"
                  >
                    <Search className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Browse Services</span>
                    <span className="sm:hidden">Services</span>
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>

              {!isAuthenticated && (
                <Link to="/login" className="flex-1 sm:flex-none">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full rounded-xl border-2 border-slate-200/70 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-700 shadow-xl transition-all duration-300 hover:border-primary-300 hover:text-primary-700 hover:shadow-2xl sm:w-auto sm:px-6 sm:py-3.5 sm:text-base"
                    >
                      <ArrowRight className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Start Planning</span>
                      <span className="sm:hidden">Start</span>
                    </Button>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mt-6 ml-6 mr-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-4"
          >
            {stats.map((stat, index) => {
              let displayValue = stat.value;
              if (statsData) {
                if (index === 0) displayValue = statsData.totalBookings > 0 ? `${statsData.totalBookings}+` : stat.value;
                if (index === 1) displayValue = statsData.totalProviders > 0 ? `${statsData.totalProviders}+` : stat.value;
                if (index === 2) displayValue = statsData.supportHours || stat.value;
                if (index === 3) displayValue = statsData.avgRating ? `${statsData.avgRating}/5` : stat.value;
              }

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                  className="group relative" 
                >
                  <div
                    className={`absolute inset-0 rounded-xl opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl ${
                      [
                        "bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-blue-500/20",
                        "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
                        "bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-purple-500/20",
                        "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20",
                      ][index]
                    }`}
                  />
                  <div
                    className={`relative flex h-full min-h-[150px] flex-col items-center justify-center rounded-2xl border p-4 text-center shadow-lg shadow-slate-200/20 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl ${
                      ["border-cyan-100/80", "border-emerald-100/80", "border-violet-100/80", "border-amber-100/80"][index]
                    }`}
                  >
                    <div
                      className={`absolute inset-0 rounded-2xl ${
                        [
                          "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100/90",
                          "bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100/90",
                          "bg-gradient-to-br from-violet-100 via-fuchsia-50 to-purple-100/90",
                          "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100/90",
                        ][index]
                      }`}
                    />
                    <div
                      className={`relative mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                        [
                          "bg-gradient-to-br from-cyan-500 to-blue-600",
                          "bg-gradient-to-br from-emerald-500 to-teal-600",
                          "bg-gradient-to-br from-violet-500 to-fuchsia-600",
                          "bg-gradient-to-br from-amber-500 to-orange-600",
                        ][index]
                      }`}
                    >
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="relative mb-1 text-2xl font-display font-extrabold text-slate-900 sm:text-3xl">{displayValue}</p>
                    <p className="relative flex min-h-[2.5rem] items-center text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="relative px-4 py-4 pb-0 sm:px-6 sm:py-6 md:py-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent" />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-center sm:mb-5"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-gradient-to-r from-primary-50 to-blue-50 px-4 py-2 sm:mb-3">
              <Zap className="h-3.5 w-3.5 text-primary-600" />
              <span className="text-xs font-bold tracking-[0.18em] text-primary-700">WHY EVENTMITRA</span>
            </div>
            <h2 className="mb-4 text-2xl font-display font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-3xl md:text-4xl">
              Why clients choose{" "}
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EventMitra
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-2xl shadow-slate-300/20"
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary-400 blur-3xl" />
                <div className="absolute -bottom-12 left-0 h-36 w-36 rounded-full bg-cyan-400/70 blur-3xl" />
              </div>
              <div className="absolute inset-0 opacity-[0.08]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:42px_42px]" />
              </div>

              <div className="relative flex h-full flex-col p-6 sm:p-7 lg:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  Planning Advantage
                </div>
                <h3 className="mt-5 max-w-xl text-2xl font-display font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-3xl">
                  Built to make service discovery, comparison, and booking feel more reliable.
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  EventMitra brings partner credibility, clearer pricing visibility, and coordinated support
                  into one experience so clients can move from inquiry to execution with more confidence.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {valuePillars.map((pillar, index) => (
                    <div
                      key={pillar}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[11px] font-bold text-cyan-200">
                          0{index + 1}
                        </span>
                        <p className="text-sm font-semibold text-white">{pillar}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    How it flows
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    {planningFlow.map((step, index) => (
                      <div key={step} className="flex items-center gap-2 text-sm text-white/90">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[11px] font-bold text-cyan-200">
                          0{index + 1}
                        </span>
                        <span>{step}</span>
                        {index < planningFlow.length - 1 ? (
                          <span className="hidden text-white/35 sm:inline">/</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85">
                    Verified partner profiles
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85">
                    Commercial clarity
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85">
                    Responsive planning support
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {planningHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur-sm"
                    >
                      <p className="text-xl font-display font-extrabold text-white sm:text-2xl">{item.value}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-300">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {premiumFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group relative ${index === 0 || index === 3 ? "sm:col-span-2" : ""}`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl" />
                <div className="relative h-full rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-lg shadow-slate-200/25 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-200/30">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg shadow-primary-500/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-display font-bold tracking-[-0.02em] text-slate-900 transition-colors duration-300 group-hover:text-primary-700 sm:text-base">
                        {feature.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-slate-600 sm:text-sm">{feature.description}</p>
                  <div className="mt-3 border-t border-slate-100 pt-2.5">
                    <p className="text-[11px] font-medium leading-5 text-slate-500">{feature.caption}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-4 pb-0 sm:px-6 sm:py-6 md:py-8">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.03)_1px,transparent_0)] bg-[size:40px_40px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-center sm:mb-5"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 sm:mb-3">
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold tracking-[0.18em] text-emerald-700">LIVE SERVICES</span>
            </div>
            <h2 className="mb-4 text-2xl font-display font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-3xl md:text-4xl">
              Explore available{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                event services
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
              Browse service options and see how many verified partners are available for each one.
            </p>
          </motion.div>

          {featuredServices.length > 0 ? (
            <div className="sm:hidden">
              <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-lg shadow-slate-200/30 backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent" />
                <motion.div
                  className="flex w-max gap-3 px-3 py-3"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{
                    duration: Math.max(18, featuredServices.length * 4),
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {mobileTickerServices.map((service, index) => (
                    <div
                      key={`${service.key}-ticker-${index}`}
                      className="relative flex min-w-[220px] max-w-[220px] items-center gap-3 overflow-hidden rounded-2xl border border-white/70 bg-white/95 px-3 py-3 shadow-md shadow-slate-200/30"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg`}
                      >
                        {service.code || "SV"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {service.categoryName}
                        </p>
                        <p className="truncate text-sm font-display font-bold text-slate-900">{service.name}</p>
                        <p className="text-[11px] font-semibold text-emerald-700">
                          {service.partnerCount} partner{service.partnerCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r ${service.color}`} />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          ) : null}

          <div className="hidden flex-wrap justify-center gap-3 sm:flex sm:gap-4">
            {featuredServices.map((service, index) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className={`group relative ${getServiceCardLayoutClass(index, featuredServices.length)}`}
              >
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${service.color} opacity-0 blur-xl transition-all duration-500 group-hover:opacity-20`} />
                <div className="relative flex h-full flex-col rounded-2xl border border-white/60 bg-white/90 p-4 text-center shadow-md shadow-slate-200/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-200/30 sm:p-5">
                  <div
                    className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-500 group-hover:scale-110 sm:h-14 sm:w-14`}
                  >
                    {service.code || "SV"}
                  </div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-xs">
                    {service.categoryName}
                  </p>
                  <h3 className="mb-1 text-xs font-display font-bold tracking-[-0.02em] text-slate-900 transition-colors duration-300 group-hover:text-primary-700 sm:text-sm">
                    {service.name}
                  </h3>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-xs">
                    {service.partnerCount} Partner{service.partnerCount === 1 ? "" : "s"}
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500">
                    Compare available partners for this service.
                  </p>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 rounded-b-xl bg-gradient-to-r ${service.color} transition-transform duration-500 group-hover:scale-x-100`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {featuredServices.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 px-5 py-8 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-900">No live services available yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Services added by admin or partners will appear here automatically.
              </p>
            </div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <Link to="/services">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-xl border-2 border-slate-200/60 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:border-primary-300 hover:text-primary-700 hover:shadow-xl"
                >
                  Browse All Services
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative px-4 py-4 pb-0 sm:px-6 sm:py-6 md:py-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/30 to-transparent" />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-4 px-4 text-center sm:mb-5"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-100 bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-2 sm:mb-3">
              <Heart className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-xs font-bold tracking-[0.18em] text-rose-700">CLIENT FEEDBACK</span>
            </div>
            <h2 className="mb-4 text-2xl font-display font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:text-3xl md:text-4xl">
              Trusted through{" "}
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                client experiences
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
              Read how clients describe the confidence, clarity, and support they experienced while planning with EventMitra.
            </p>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[28px] border border-rose-100/80 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-5 shadow-xl shadow-rose-100/40 sm:p-6"
            >
              <div className="absolute inset-0 opacity-60">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-rose-200/70 blur-3xl" />
                <div className="absolute -bottom-8 left-0 h-24 w-24 rounded-full bg-pink-200/80 blur-3xl" />
              </div>
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700 backdrop-blur-sm">
                  <Quote className="h-3.5 w-3.5" />
                  Client Perspective
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
                  <div>
                    <h3 className="max-w-2xl text-xl font-display font-extrabold leading-tight tracking-[-0.03em] text-slate-950 sm:text-2xl">
                      Recent feedback from clients who planned and booked through EventMitra.
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                      Showing the latest reviews so visitors can quickly understand the planning experience, partner quality,
                      and overall confidence clients felt while using the platform.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-sm shadow-rose-100/40">
                    <p className="text-2xl font-display font-extrabold text-slate-950">4.9/5</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Average sentiment
                    </p>
                  </div>
                    <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-sm shadow-rose-100/40">
                    <p className="text-2xl font-display font-extrabold text-slate-950">{latestTestimonials.length}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Latest reviews
                    </p>
                  </div>
                    <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-sm shadow-rose-100/40">
                    <p className="text-2xl font-display font-extrabold text-slate-950">Trusted</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Planning experience
                    </p>
                  </div>
                </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-rose-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700">
                    Verified partner experience
                  </span>
                  <span className="rounded-full border border-rose-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700">
                    Transparent coordination
                  </span>
                  <span className="rounded-full border border-rose-200 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700">
                    Responsive support
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {latestTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`group relative ${index === 0 ? "sm:col-span-2 xl:col-span-2" : ""}`}
                >
                  <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-rose-500/5 via-transparent to-pink-500/5 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100 group-hover:blur-2xl" />
                  <div className="relative h-full rounded-[24px] border border-white/70 bg-white/95 p-5 shadow-lg shadow-slate-200/20 transition-all duration-500 hover:-translate-y-1 hover:border-rose-200/60 hover:shadow-xl hover:shadow-rose-200/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/20">
                          <Quote className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-display font-bold text-slate-900">{testimonial.name}</p>
                          <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                            {getPublicFeedbackRole(testimonial.role)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(testimonial.rating)].map((_, starIndex) => (
                          <Star
                            key={`${testimonial._id}-star-${starIndex}`}
                            className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>

                    <p
                      className={`mt-4 text-sm leading-7 text-slate-600 ${
                        index === 0 ? "sm:text-[15px]" : ""
                      }`}
                    >
                      &ldquo;{testimonial.content}&rdquo;
                    </p>

                    <div className="mt-5 border-t border-slate-100 pt-3">
                      <p className="text-[11px] font-medium text-slate-500">
                        Shared by a verified EventMitra client experience.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-4 pb-4 sm:px-6 sm:py-6 md:py-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[28px] border border-sky-100/80 bg-[radial-gradient(circle_at_top_right,rgba(191,219,254,0.55),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.96)_45%,rgba(245,251,255,0.98))] shadow-[0_24px_80px_rgba(148,163,184,0.18)]"
          >
            <div className="absolute inset-0 opacity-80">
              <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-sky-200/70 blur-3xl" />
              <div className="absolute -bottom-12 left-0 h-40 w-40 rounded-full bg-cyan-100/80 blur-3xl" />
            </div>

            <div className="absolute inset-0 opacity-[0.06]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.8)_1px,transparent_1px)] bg-[size:56px_56px]" />
            </div>

            <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-8 lg:p-10">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4 py-2 shadow-sm shadow-sky-100"
                >
                  <TrendingUp className="h-4 w-4 text-sky-600" />
                  <span className="text-xs font-bold tracking-[0.18em] text-sky-700">PLAN WITH CONFIDENCE</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="max-w-2xl text-2xl font-display font-extrabold leading-tight tracking-[-0.03em] text-slate-950 sm:text-3xl md:text-4xl"
                >
                  Plan your next event with
                  <span className="block bg-gradient-to-r from-sky-700 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    clearer choices and stronger confidence
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base"
                >
                  Explore services, compare verified partners, and move toward booking with a polished experience
                  designed to keep planning simple, transparent, and dependable.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-6 flex flex-row gap-3"
                >
                  {!isAuthenticated ? (
                    <Link to="/login" className="flex-1 sm:flex-none">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                        <Button
                          size="lg"
                          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-300/30 transition-all duration-300 hover:bg-slate-900 hover:shadow-slate-300/40 sm:w-auto sm:px-6 sm:text-base"
                        >
                          Start Planning
                          <ArrowRight className="ml-1.5 h-5 w-5" />
                        </Button>
                      </motion.div>
                    </Link>
                  ) : (
                    <Link to="/services" className="flex-1 sm:flex-none">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                        <Button
                          size="lg"
                          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-300/30 transition-all duration-300 hover:bg-slate-900 hover:shadow-slate-300/40 sm:w-auto sm:px-6 sm:text-base"
                        >
                          Browse Services
                          <ArrowRight className="ml-1.5 h-5 w-5" />
                        </Button>
                      </motion.div>
                    </Link>
                  )}

                  <Link to="/about" className="flex-1 sm:flex-none">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="w-full rounded-xl border-2 border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-100 hover:border-sky-200 hover:text-sky-700 hover:bg-white sm:w-auto sm:px-6 sm:text-base"
                      >
                        Learn More
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45, duration: 0.5 }}
                className="rounded-[26px] border border-slate-200 bg-white/88 p-4 shadow-lg shadow-slate-100/80 sm:p-5"
              >
                <div className="mb-4 border-b border-slate-100 pb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                    Why this works
                  </p>
                  <h3 className="mt-2 text-lg font-display font-bold tracking-[-0.02em] text-slate-950 sm:text-xl">
                    Everything you need to move from browsing to booking.
                  </h3>
                </div>
                <div className="space-y-3">
                  {closingHighlights.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-slate-200 bg-white/92 p-4 shadow-sm shadow-slate-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-200/60">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-display font-bold text-slate-950 sm:text-base">{item.title}</h4>
                          <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
