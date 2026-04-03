const mockCategories = [
  { _id: "1", name: "Catering", slug: "catering", description: "Food catering services", serviceCount: 5, listedServices: 3 },
  { _id: "2", name: "Photography", slug: "photography", description: "Event photography", serviceCount: 3, listedServices: 2 },
  { _id: "3", name: "Decoration", slug: "decoration", description: "Event decoration", serviceCount: 4, listedServices: 2 },
  { _id: "4", name: "DJ & Music", slug: "dj-music", description: "DJ and music services", serviceCount: 2, listedServices: 1 },
  { _id: "5", name: "Venue", slug: "venue", description: "Venue booking", serviceCount: 2, listedServices: 1 }
];

export default function handler(req, res) {
  res.json({ success: true, data: mockCategories });
}