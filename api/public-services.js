const mockServices = [
  {
    _id: "s1",
    name: "Premium Wedding Catering",
    description: "Complete wedding catering with multi-cuisine menu",
    startingPrice: 50000,
    category: { _id: "1", name: "Catering" },
    createdBy: { _id: "p1", name: "John", businessName: "Tasty Bites", avatar: null, experience: 5 }
  },
  {
    _id: "s2",
    name: "Event Photography",
    description: "Professional event photography with album",
    startingPrice: 25000,
    category: { _id: "2", name: "Photography" },
    createdBy: { _id: "p2", name: "Mike", businessName: "Capture Moments", avatar: null, experience: 8 }
  },
  {
    _id: "s3",
    name: "Balloon Decoration",
    description: "Beautiful balloon arrangements for events",
    startingPrice: 15000,
    category: { _id: "3", name: "Decoration" },
    createdBy: { _id: "p3", name: "Sarah", businessName: "PartyDecor", avatar: null, experience: 3 }
  }
];

export default function handler(req, res) {
  const url = req.url || "";
  const questionIdx = url.indexOf("?");
  const path = questionIdx >= 0 ? url.substring(0, questionIdx) : url;
  
  if (path === "" || path === "/") {
    const params = new URL(url, "https://eventmitra.vercel.app").searchParams;
    const categoryId = params.get("category");
    let services = mockServices;
    if (categoryId) {
      services = mockServices.filter(s => s.category._id === categoryId);
    }
    return res.json({ success: true, data: services });
  }
  
  if (path.startsWith("/")) {
    const id = path.substring(1);
    const service = mockServices.find(s => s._id === id);
    if (service) {
      return res.json({ success: true, data: service });
    }
    return res.status(404).json({ success: false, message: "Service not found" });
  }
  
  res.json({ success: true, data: mockServices });
}