export default function handler(req, res) {
  res.json({ 
    success: true, 
    message: "EventMitra API at your service!",
    endpoints: {
      auth: "/api/auth",
      admin: "/api/admin",
      provider: "/api/provider",
      customer: "/api/customer",
      public: "/api/public"
    }
  });
}