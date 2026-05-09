import { motion } from "framer-motion";
import { useState } from "react";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Shield,
  Clock,
  Headphones,
  FileText,
  ExternalLink,
} from "lucide-react";

const faqData = [
  {
    question: "How do I book a service?",
    answer: "Browse services, select the option you need, choose a verified partner, and click 'Book Now'. Fill in your event details and confirm your booking. You will receive confirmation with the key details.",
  },
  {
    question: "How do I track my booking status?",
    answer: "Go to 'My Bookings' in your dashboard to see all your bookings. You can track the status in real-time - from pending to confirmed, in-progress, and completed.",
  },
  {
    question: "What if I need to cancel my booking?",
    answer: "You can cancel your booking from the 'My Bookings' page. Cancellation rules may vary by partner, so review the booking details before confirming.",
  },
  {
    question: "How do I contact my service partner?",
    answer: "Once your booking is confirmed, you can view the partner's contact details in your booking details. You can also message them through our platform.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept various payment methods including credit/debit cards, UPI, net banking, and digital wallets. Payment is processed securely through our payment partners.",
  },
  {
    question: "How do I rate and review a service?",
    answer: "After your service is completed, you will receive a prompt to rate and review the partner. Your feedback helps other clients make informed decisions.",
  },
  {
    question: "What if I'm not satisfied with the service?",
    answer: "Contact our support team immediately. We will work with you and the partner to resolve any issues. You can also raise a dispute through the booking details page.",
  },
  {
    question: "How do I update my profile information?",
    answer: "Go to your profile page and click on the edit button. You can update your name, phone number, address, and profile picture from there.",
  },
];

const supportChannels = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Get instant help from our support team",
    action: "Start Chat",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Phone,
    title: "Call Us",
    description: "Speak directly with our support team",
    action: "Call Now",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us your queries via email",
    action: "Send Email",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: FileText,
    title: "Help Center",
    description: "Browse our comprehensive guides",
    action: "Visit Help Center",
    color: "from-orange-500 to-orange-600",
  },
];

export function CustomerSupportPage() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-blue-700 p-6 text-white shadow-xl"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Support Center</h1>
              <p className="text-sm text-white/80">We are here to help you</p>
            </div>
          </div>
          <p className="text-sm text-white/90 max-w-2xl">
            Get help with bookings, account updates, payments, partner coordination, and platform questions. Our support team is available 24/7.
          </p>
        </div>
      </motion.div>

      {/* Support Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportChannels.map((channel, index) => (
            <motion.div
              key={channel.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="group relative bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all duration-300 cursor-pointer"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${channel.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <channel.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{channel.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{channel.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:text-primary-700">
                {channel.action}
                <ExternalLink className="h-4 w-4" />
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Frequently Asked Questions</h2>
              <p className="text-sm text-slate-500">Find quick answers to common questions</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="p-4">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-sm text-slate-600 leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              No FAQs found matching your search.
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Quick Links</h2>
            <p className="text-sm text-slate-500">Helpful resources and guides</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="#" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200">
            <Shield className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium text-slate-900">Safety Guidelines</p>
              <p className="text-sm text-slate-500">Learn about our safety measures</p>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200">
            <Clock className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium text-slate-900">Booking Policies</p>
              <p className="text-sm text-slate-500">Understand our booking terms</p>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200">
            <FileText className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium text-slate-900">Terms of Service</p>
              <p className="text-sm text-slate-500">Read our terms and conditions</p>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200">
            <Shield className="h-5 w-5 text-primary-600" />
            <div>
              <p className="font-medium text-slate-900">Privacy Policy</p>
              <p className="text-sm text-slate-500">How we protect your data</p>
            </div>
          </a>
        </div>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white"
      >
        <h2 className="text-lg font-semibold mb-4">Need More Help?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary-400" />
            <div>
              <p className="text-sm text-slate-400">Phone</p>
              <p className="font-medium">+91 98765 43210</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary-400" />
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-medium">support@eventmitra.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary-400" />
            <div>
              <p className="text-sm text-slate-400">Hours</p>
              <p className="font-medium">24/7 Available</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
