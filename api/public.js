const mockCategories = [
  { _id: "1", name: "Catering", slug: "catering", description: "Food catering services", serviceCount: 5, listedServices: 3 },
  { _id: "2", name: "Photography", slug: "photography", description: "Event photography", serviceCount: 3, listedServices: 2 },
  { _id: "3", name: "Decoration", slug: "decoration", description: "Event decoration", serviceCount: 4, listedServices: 2 },
  { _id: "4", name: "DJ & Music", slug: "dj-music", description: "DJ and music services", serviceCount: 2, listedServices: 1 },
  { _id: "5", name: "Venue", slug: "venue", description: "Venue booking", serviceCount: 2, listedServices: 1 }
];

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
  const path = req.url || "";
  
  if (path.includes("/service-categories")) {
    return res.json({ success: true, data: mockCategories });
  }
  
  if (path.includes("/services")) {
    const categoryId = new URL(req.url, "http://localhost").searchParams.get("category");
    let services = mockServices;
    if (categoryId) {
      services = mockServices.filter(s => s.category._id === categoryId);
    }
    return res.json({ success: true, data: services });
  }
  
  if (path.includes("/services/")) {
    const id = path.split("/services/").pop();
    const service = mockServices.find(s => s._id === id);
    if (service) {
      return res.json({ success: true, data: service });
    }
    return res.status(404).json({ success: false, message: "Service not found" });
  }
  
  res.json({ success: true, message: "Public API is working" });
}