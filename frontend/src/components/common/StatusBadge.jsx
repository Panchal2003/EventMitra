import { classNames } from "../../utils/classNames";

const statusStyles = {
  active: "bg-blue-50 text-blue-700 ring-blue-100",
  approved: "bg-blue-50 text-blue-700 ring-blue-100",
  confirmed: "bg-sky-50 text-sky-700 ring-sky-100",
  completed: "bg-primary-50 text-primary-700 ring-primary-100",
  draft: "bg-amber-50 text-amber-700 ring-amber-100",
  in_progress: "bg-sky-50 text-sky-700 ring-sky-100",
  otp_pending: "bg-amber-50 text-amber-700 ring-amber-100",
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  provider_assigned: "bg-violet-50 text-violet-700 ring-violet-100",
  released: "bg-primary-50 text-primary-700 ring-primary-100",
  rejected: "bg-rose-50 text-rose-600 ring-rose-100",
  suspended: "bg-rose-50 text-rose-600 ring-rose-100",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  archived: "bg-slate-100 text-slate-600 ring-slate-200",
  refunded: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusBadge({ status }) {
  const normalizedStatus = String(status || "unknown").toLowerCase();

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1",
        statusStyles[normalizedStatus] || "bg-slate-100 text-slate-600 ring-slate-200"
      )}
    >
      {normalizedStatus.replace(/_/g, " ")}
    </span>
  );
}
