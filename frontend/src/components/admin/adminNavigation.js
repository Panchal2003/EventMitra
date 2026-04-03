import {
  CalendarCheck2,
  IndianRupee,
  LayoutDashboard,
  Sparkles,
  UserCircle,
  Users,
} from "lucide-react";

export const adminNavigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
    end: true,
    color: "text-violet-500",
  },
  {
    id: "services",
    label: "Services",
    icon: Sparkles,
    path: "/admin/services",
    color: "text-fuchsia-500",
  },
  {
    id: "providers",
    label: "Providers",
    icon: Users,
    path: "/admin/providers",
    color: "text-cyan-500",
  },
  {
    id: "customers",
    label: "Customers",
    icon: UserCircle,
    path: "/admin/customers",
    color: "text-emerald-500",
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: CalendarCheck2,
    path: "/admin/bookings",
    color: "text-amber-500",
  },
  {
    id: "payments",
    label: "Payments",
    icon: IndianRupee,
    path: "/admin/payments",
    color: "text-rose-500",
  },
];
