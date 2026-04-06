import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, X, ZoomIn, Globe, Zap, Image } from "lucide-react";
import { Footer } from "../../components/common/Footer";

const galleryImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900", alt: "Wedding ceremony", category: "Wedding" },
  { id: 2, src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900", alt: "Event decoration", category: "Decoration" },
  { id: 3, src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900", alt: "Birthday celebration", category: "Birthday" },
  { id: 4, src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900", alt: "Corporate event", category: "Corporate" },
  { id: 5, src: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900", alt: "Mehndi ceremony", category: "Wedding" },
  { id: 6, src: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=900", alt: "Wedding setup", category: "Wedding" },
  { id: 7, src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900", alt: "DJ setup", category: "Entertainment" },
  { id: 8, src: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900", alt: "Bridal makeup", category: "Makeup" },
  { id: 9, src: "https://images.unsplash.com/photo-1555244162-803834f70033?w=900", alt: "Catering setup", category: "Catering" },
  { id: 10, src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900", alt: "Venue setup", category: "Venue" },
  { id: 11, src: "https://images.unsplash.com/photo-1609873814058-a8928924184a?w=900", alt: "Wedding invitation", category: "Stationery" },
  { id: 12, src: "https://images.unsplash.com/photo-1595407660626-db35dcd16609?w=900", alt: "Mehndi design", category: "Mehndi" },
  { id: 13, src: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900", alt: "Elegant reception decor", category: "Decoration" },
  { id: 14, src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900", alt: "Luxury banquet dining", category: "Catering" },
  { id: 15, src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=900", alt: "Stage lighting and performance setup", category: "Entertainment" },
  { id: 16, src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900", alt: "Outdoor wedding venue styling", category: "Venue" },
  { id: 17, src: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900", alt: "Premium bridal portrait", category: "Makeup" },
  { id: 18, src: "https://images.unsplash.com/photo-1505232070786-2b5f8c43f6d7?w=900", alt: "Corporate networking event", category: "Corporate" },
  { id: 19, src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900", alt: "Birthday celebration backdrop", category: "Birthday" },
  { id: 20, src: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=900", alt: "Handcrafted mehndi close-up", category: "Mehndi" },
];

const categories = [
  "All",
  "Wedding",
  "Decoration",
  "Birthday",
  "Corporate",
  "Entertainment",
  "Makeup",
  "Catering",
  "Venue",
  "Stationery",
  "Mehndi",
];

export function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredImages =
    selectedCategory === "All"
      ? galleryImages
      : galleryImages.filter((image) => image.category === selectedCategory);

  const currentIndex = selectedImage
    ? filteredImages.findIndex((image) => image.id === selectedImage.id)
    : -1;

  const showPrevious = () => {
    if (currentIndex <= 0) return;
    setSelectedImage(filteredImages[currentIndex - 1]);
  };

  const showNext = () => {
    if (currentIndex >= filteredImages.length - 1) return;
    setSelectedImage(filteredImages[currentIndex + 1]);
  };

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
                <Image className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">✨ Event Inspiration Gallery</span>
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
              Visual references for
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x relative inline-block">
                weddings & events
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
              Explore styles, moods, and service outputs to get a clearer idea of what you want before speaking with providers.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery-grid" className="relative pt-2 pb-0 px-4 sm:px-6">
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
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 tracking-wide">BROWSE GALLERY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              Browse {" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {selectedCategory}
              </span>
            </h2>
            <p className="hidden sm:block text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Filter by category to find the perfect inspiration for your event
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-700">
                Filter by Category
              </p>
              <div className="relative w-full sm:w-auto sm:min-w-[280px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none rounded-2xl bg-white/40 backdrop-blur-2xl px-5 py-4 pr-14 text-sm font-semibold text-slate-800 shadow-xl shadow-slate-900/5 ring-1 ring-white/60 ring-inset transition-all duration-300 hover:bg-white/50 hover:shadow-2xl hover:shadow-primary-200/20 hover:ring-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:shadow-2xl focus:shadow-primary-200/30"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100/80 backdrop-blur-sm">
                  <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gallery Grid */}
          <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredImages.map((image, index) => (
              <motion.button
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white p-0 text-left shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-500"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                  <ZoomIn className="h-5 w-5" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 opacity-0 transition group-hover:opacity-100">
                  <p className="text-sm font-semibold text-white">{image.alt}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">{image.category}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage ? (
        <div
          className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(241,245,249,0.9)_45%,rgba(226,232,240,0.84)_100%)] p-3 pt-4 pb-24 backdrop-blur-md sm:items-center sm:p-5"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-2xl border border-slate-200 bg-white/95 p-2 text-slate-600 shadow-lg transition hover:bg-slate-50 sm:right-6 sm:top-6"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white/95 p-3 text-slate-600 shadow-lg transition hover:bg-slate-50 disabled:opacity-40 sm:left-6"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            disabled={currentIndex <= 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white/95 p-3 text-slate-600 shadow-lg transition hover:bg-slate-50 disabled:opacity-40 sm:right-6"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            disabled={currentIndex >= filteredImages.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            className="max-h-[88vh] w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-[0_24px_70px_rgba(148,163,184,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedImage.src.replace("w=900", "w=1400")}
              alt={selectedImage.alt}
              className="max-h-[72vh] w-full bg-slate-50 object-contain"
            />
            <div className="border-t border-slate-200 bg-white px-5 py-4 text-slate-900 sm:px-6">
              <p className="font-semibold">{selectedImage.alt}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedImage.category}</p>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
