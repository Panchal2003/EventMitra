import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GlassCard } from "./GlassCard";

export function MetricCard({ description, icon: Icon, title, value }) {
  return (
    <GlassCard className="overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </h3>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <motion.div
          whileHover={{ rotate: 4, scale: 1.03 }}
          className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-100 via-white to-sky-50 text-primary-700 shadow-inner"
        >
          <Icon className="h-6 w-6" />
        </motion.div>
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
        Live overview
        <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </GlassCard>
  );
}

