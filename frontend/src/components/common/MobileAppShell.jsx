import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function MobileAppShell({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isMobile
          ? "mobile-app-view"
          : isTablet
          ? "tablet-app-view"
          : "desktop-view"
      }`}
      style={{
        // Safe area support for notched devices
        paddingTop: isMobile ? "env(safe-area-inset-top)" : "0",
        paddingBottom: isMobile ? "env(safe-area-inset-bottom)" : "0",
        paddingLeft: isMobile ? "env(safe-area-inset-left)" : "0",
        paddingRight: isMobile ? "env(safe-area-inset-right)" : "0",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isMobile ? "mobile" : isTablet ? "tablet" : "desktop"}
          initial={{ opacity: 0, y: isMobile ? 20 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isMobile ? -20 : 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Mobile-specific styles
export const mobileStyles = `
  /* Mobile App View */
  .mobile-app-view {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    background: #f8fafc;
  }

  /* Tablet App View */
  .tablet-app-view {
    position: relative;
    min-height: 100vh;
    background: #f8fafc;
  }

  /* Desktop View */
  .desktop-view {
    position: relative;
    min-height: 100vh;
  }

  /* Mobile App Header */
  .mobile-app-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    padding-top: env(safe-area-inset-top);
  }

  /* Mobile Bottom Safe Area */
  .mobile-bottom-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Touch-friendly buttons */
  @media (max-width: 767px) {
    button, a, [role="button"] {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Smooth scrolling */
  .mobile-scroll {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* Hide scrollbar on mobile */
  @media (max-width: 767px) {
    ::-webkit-scrollbar {
      display: none;
    }
    
    * {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  }

  /* Mobile app-like transitions */
  .mobile-transition {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Pull to refresh indicator */
  .pull-to-refresh {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to bottom, rgba(86, 103, 245, 0.1), transparent);
    transform: translateY(-100%);
    transition: transform 0.3s ease;
  }

  .pull-to-refresh.active {
    transform: translateY(0);
  }
`;
