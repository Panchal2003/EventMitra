export const formatDate = (value) => {
  if (!value) return "-";
  
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
