import { motion } from "framer-motion";
import { 
  X, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Send, 
  Link as LinkIcon,
  Instagram,
  Mail,
  Share2
} from "lucide-react";
import { useState } from "react";
import { Modal } from "./Modal";

const sharePlatforms = [
  {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-500",
    hoverColor: "bg-green-600",
    shareUrl: (url, text, image) => `https://wa.me/?text=${encodeURIComponent(text + " " + url + (image ? "\n\nImage: " + image : ""))}`,
  },
  {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    hoverColor: "bg-blue-700",
    shareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Twitter",
    icon: Twitter,
    color: "bg-sky-500",
    hoverColor: "bg-sky-600",
    shareUrl: (url, text, image) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text + (image ? " " + image : ""))}`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700",
    hoverColor: "bg-blue-800",
    shareUrl: (url, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
    hoverColor: "opacity-90",
    isNativeShare: true,
  },
  {
    name: "Email",
    icon: Mail,
    color: "bg-slate-600",
    hoverColor: "bg-slate-700",
    shareUrl: (url, text) => `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
  },
  {
    name: "Telegram",
    icon: Send,
    color: "bg-blue-500",
    hoverColor: "bg-blue-600",
    shareUrl: (url, text, image) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text + (image ? " " + image : ""))}`,
  },
  {
    name: "Copy Link",
    icon: Copy,
    color: "bg-primary-600",
    hoverColor: "bg-primary-700",
    isCopy: true,
  },
];

export function ShareModal({ open, onClose, shareData }) {
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const { title = "Check out this service", url = window.location.href, text = "", image = null } = shareData || {};

  const handleShare = async (platform) => {
    if (platform.isCopy) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setCopyStatus("Link copied to clipboard!");
        setTimeout(() => {
          setCopied(false);
          setCopyStatus("");
          onClose();
        }, 1500);
      } catch (err) {
        setCopyStatus("Failed to copy link");
      }
      return;
    }

    if (platform.isNativeShare && navigator.share) {
      try {
        const shareText = image 
          ? `${text}\n\nImage: ${image}`
          : text;
        await navigator.share({
          title: title,
          text: shareText,
          url: url,
        });
        onClose();
      } catch (err) {
        // User cancelled or error
      }
      return;
    }

    if (platform.shareUrl) {
      const shareLink = platform.shareUrl(url, text || title, image);
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share this Service"
      description="Choose a platform to share this service with others"
      size="sm"
    >
      <div className="py-2">
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          {image && (
            <img
              src={image}
              alt="Service preview"
              className="mb-2 h-32 w-full rounded-lg object-cover"
            />
          )}
          <p className="text-sm font-medium text-slate-700 line-clamp-2">{title}</p>
          <p className="mt-1 text-xs text-slate-500 truncate">{url}</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {sharePlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <motion.button
                key={platform.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare(platform)}
                className={`group flex flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-200 ${
                  platform.isCopy && copied 
                    ? "bg-emerald-50 border border-emerald-200" 
                    : "hover:bg-slate-50 border border-transparent"
                }`}
                disabled={platform.isCopy && copied}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  platform.isCopy && copied 
                    ? "bg-emerald-500" 
                    : platform.color
                } transition-all duration-200 group-hover:${platform.hoverColor}`}>
                  {platform.isCopy && copied ? (
                    <span className="text-white text-xs font-bold">✓</span>
                  ) : (
                    <Icon className="h-5 w-5 text-white" />
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  platform.isCopy && copied ? "text-emerald-600" : "text-slate-600"
                }`}>
                  {platform.isCopy && copied ? "Copied!" : platform.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {copyStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-sm font-medium text-emerald-600"
          >
            {copyStatus}
          </motion.div>
        )}
      </div>
    </Modal>
  );
}