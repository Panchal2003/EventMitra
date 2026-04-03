export const getDashboardPath = (role) => {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "serviceProvider") {
    return "/provider";
  }

  // For customers, go to home page instead of dashboard
  if (role === "customer") {
    return "/";
  }

  return "/login";
};
