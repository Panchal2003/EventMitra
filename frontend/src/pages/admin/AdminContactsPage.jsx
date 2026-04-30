import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Calendar, Search, RefreshCw, Eye, CheckCircle } from "lucide-react";
import { adminApi } from "../../services/api";
import { GlassCard } from "../../components/admin/GlassCard";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { useAdminPanelData } from "../../hooks/useAdminPanelData";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export function AdminContactsPage() {
  const { refresh } = useAdminPanelData();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getContacts();
      setContacts(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = contacts.filter(c => c.status === "unread").length;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="space-y-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8 sm:pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-xl sm:p-8"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
            <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-pink-500/20 blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Contact Messages
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
                >
                  Contact Inquiries
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 max-w-lg text-sm text-purple-100"
                >
                  View customer and lead inquiries from the contact form.
                </motion.p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs text-purple-200">Total Messages</p>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs text-purple-200">Unread</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <GlassCard className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchContacts}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </GlassCard>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-white shadow-md" />
            ))}
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <GlassCard hover={true} className="p-4 h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-100">
                          <Mail className="h-5 w-5 text-violet-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">{contact.name}</h3>
                          <p className="truncate text-xs text-slate-500">{contact.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        contact.status === "unread" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {contact.status === "unread" && <Eye className="h-3 w-3" />}
                        {contact.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{contact.subject}</span>
                      </div>
                      {contact.serviceInterest && (
                        <p className="text-violet-600">Service: {contact.serviceInterest}</p>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{contact.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(contact.createdAt)}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3">
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelectedContact(contact)}>
                        View Message
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-12 text-center shadow-xl">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100"
            >
              <Mail className="h-10 w-10 text-violet-400" />
            </motion.div>
            <p className="font-semibold text-slate-600">No contact messages</p>
            <p className="mt-1 text-sm text-slate-400">Customer inquiries will appear here</p>
          </div>
        )}
      </div>

      {selectedContact && (
        <Modal open={Boolean(selectedContact)} onClose={() => setSelectedContact(null)}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
                <Mail className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedContact.name}</h3>
                <p className="text-sm text-slate-500">{selectedContact.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Subject</p>
                <p className="font-medium text-slate-900">{selectedContact.subject}</p>
              </div>
              
              {selectedContact.serviceInterest && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Service Interest</p>
                  <p className="text-violet-600">{selectedContact.serviceInterest}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                {selectedContact.phone && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Phone</p>
                    <p className="text-slate-900">{selectedContact.phone}</p>
                  </div>
                )}
                {selectedContact.city && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">City</p>
                    <p className="text-slate-900">{selectedContact.city}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Message</p>
                <div className="mt-2 rounded-xl bg-slate-50 p-4 text-slate-700 whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Submitted on {formatDate(selectedContact.createdAt, true)}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedContact(null)}>
                Close
              </Button>
              <a
                href={`mailto:${selectedContact.email}`}
                className="flex-1"
              >
                <Button className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}