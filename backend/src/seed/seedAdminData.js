import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { Service } from "../models/Service.js";
import { ServiceCategory } from "../models/ServiceCategory.js";
import { User } from "../models/User.js";
import { BOOKING_STATUS } from "../utils/bookingLifecycle.js";
import {
  calculatePayoutDueDate,
  calculateProviderPayout,
} from "../utils/paymentLifecycle.js";

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    Payment.deleteMany({}),
    Booking.deleteMany({}),
    Service.deleteMany({}),
    ServiceCategory.deleteMany({}),
    User.deleteMany({}),
  ]);

  const admin = await User.create({
    name: env.adminName,
    email: env.adminEmail,
    password: env.adminPassword,
    role: "admin",
    providerStatus: "approved",
  });

  const categories = await ServiceCategory.create([
    {
      name: "Bridal Beauty",
      description: "Beauty-first offerings for ceremonies, bridal looks, and pre-wedding rituals.",
      slug: "bridal-beauty",
      createdBy: admin._id,
    },
    {
      name: "Decor & Styling",
      description: "Venue styling, stage decor, floral design, and event atmosphere services.",
      slug: "decor-styling",
      createdBy: admin._id,
    },
    {
      name: "Entertainment",
      description: "Music, DJ, and live performance experiences for celebrations.",
      slug: "entertainment",
      createdBy: admin._id,
    },
    {
      name: "Food & Catering",
      description: "Curated food service for weddings, parties, and corporate events.",
      slug: "food-catering",
      createdBy: admin._id,
    },
  ]);

  const categoryMap = categories.reduce((accumulator, category) => {
    accumulator[category.slug] = category._id;
    return accumulator;
  }, {});

  const customers = await User.create([
    {
      name: "Riya Sharma",
      email: "riya.customer@eventmitra.com",
      password: "Customer@123",
      role: "customer",
      providerStatus: "approved",
    },
    {
      name: "Kabir Mehta",
      email: "kabir.customer@eventmitra.com",
      password: "Customer@123",
      role: "customer",
      providerStatus: "approved",
    },
    {
      name: "Neha Verma",
      email: "neha.customer@eventmitra.com",
      password: "Customer@123",
      role: "customer",
      providerStatus: "approved",
    },
  ]);

  const providers = await User.create([
    {
      name: "Aarav Events",
      email: "aarav.provider@eventmitra.com",
      password: "Provider@123",
      role: "serviceProvider",
      businessName: "Aarav Events Co.",
      phone: "+91 9876543210",
      providerStatus: "approved",
      serviceCategory: categoryMap["decor-styling"],
      experience: 8,
      basePrice: 45000,
      portfolio: [
        {
          fileName: "royal-stage-design.jpg",
          fileUrl:
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
          mimeType: "image/jpeg",
          size: 0,
        },
        {
          fileName: "floral-entrance.jpg",
          fileUrl:
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
          mimeType: "image/jpeg",
          size: 0,
        },
      ],
    },
    {
      name: "Nisha Catering Studio",
      email: "nisha.provider@eventmitra.com",
      password: "Provider@123",
      role: "serviceProvider",
      businessName: "Nisha Catering Studio",
      phone: "+91 9876501234",
      providerStatus: "approved",
      serviceCategory: categoryMap["food-catering"],
      experience: 6,
      basePrice: 55000,
      portfolio: [
        {
          fileName: "gourmet-buffet.jpg",
          fileUrl:
            "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
          mimeType: "image/jpeg",
          size: 0,
        },
      ],
    },
    {
      name: "Cater Craft",
      email: "cater.provider@eventmitra.com",
      password: "Provider@123",
      role: "serviceProvider",
      businessName: "Cater Craft",
      phone: "+91 9822004455",
      providerStatus: "pending",
      serviceCategory: categoryMap["food-catering"],
      experience: 4,
      basePrice: 40000,
    },
    {
      name: "Venue Hive",
      email: "venue.provider@eventmitra.com",
      password: "Provider@123",
      role: "serviceProvider",
      businessName: "Venue Hive",
      phone: "+91 9855512345",
      providerStatus: "suspended",
      serviceCategory: categoryMap["decor-styling"],
      experience: 10,
      basePrice: 60000,
    },
  ]);

  const services = await Service.create([
    {
      name: "Mehndi",
      category: categoryMap["bridal-beauty"],
      description: "Bridal and guest mehndi artistry with custom motifs and premium cones.",
      startingPrice: 12000,
      status: "active",
      image:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      basePricing: "Starts at INR 12,000 for bridal mehndi coverage.",
      createdBy: admin._id,
    },
    {
      name: "Makeup",
      category: categoryMap["bridal-beauty"],
      description: "Occasion, bridal, and editorial makeup packages with hair styling support.",
      startingPrice: 15000,
      status: "active",
      image:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
      basePricing: "Starts at INR 15,000 for base bridal makeup sessions.",
      createdBy: admin._id,
    },
    {
      name: "Decoration",
      category: categoryMap["decor-styling"],
      description: "Wedding and event decor with floral styling, stage design, and entrance concepts.",
      startingPrice: 45000,
      status: "active",
      image:
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
      basePricing: "Starts at INR 45,000 for stage and venue decor packages.",
      createdBy: admin._id,
    },
    {
      name: "DJ",
      category: categoryMap["entertainment"],
      description: "Professional DJ setup with curated playlists, lighting, and live crowd management.",
      startingPrice: 18000,
      status: "active",
      image:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
      basePricing: "Starts at INR 18,000 for standard celebration DJ coverage.",
      createdBy: admin._id,
    },
    {
      name: "Catering",
      category: categoryMap["food-catering"],
      description: "Buffet and plated catering for weddings, engagements, and corporate events.",
      startingPrice: 55000,
      status: "active",
      image:
        "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
      basePricing: "Starts at INR 55,000 for curated event catering packages.",
      createdBy: admin._id,
    },
    {
      name: "Live Music Experience",
      category: categoryMap["entertainment"],
      description: "Curated live band lineup with sound and stage management.",
      startingPrice: 30000,
      status: "draft",
      image:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
      basePricing: "Starts at INR 30,000 for live performance packages.",
      createdBy: admin._id,
    },
  ]);

  const [riya, kabir, neha] = customers;
  const [aarav, nisha] = providers;
  const serviceMap = services.reduce((accumulator, service) => {
    accumulator[service.name] = service;
    return accumulator;
  }, {});

  const bookings = await Booking.create([
    {
      service: serviceMap.DJ._id,
      customer: riya._id,
      eventDate: new Date("2026-04-18T18:00:00.000Z"),
      location: "Mumbai",
      guestCount: 120,
      totalAmount: 18000,
      notes: "Evening DJ and dance-floor setup requested.",
      status: BOOKING_STATUS.PENDING,
    },
    {
      service: serviceMap.Decoration._id,
      customer: neha._id,
      provider: aarav._id,
      eventDate: new Date("2026-04-12T12:00:00.000Z"),
      location: "Jaipur",
      guestCount: 260,
      totalAmount: 45000,
      notes: "Need pastel theme decor with entrance styling.",
      status: BOOKING_STATUS.PROVIDER_ASSIGNED,
      providerAssignedAt: new Date("2026-03-20T10:30:00.000Z"),
      completionOtp: {
        code: "4821",
        isVerified: false,
      },
    },
    {
      service: serviceMap.Decoration._id,
      customer: kabir._id,
      provider: aarav._id,
      eventDate: new Date("2026-04-02T09:00:00.000Z"),
      location: "Ahmedabad",
      guestCount: 180,
      totalAmount: 48000,
      notes: "Main stage design is approved. Team should arrive early for setup.",
      status: BOOKING_STATUS.CONFIRMED,
      providerAssignedAt: new Date("2026-03-18T08:00:00.000Z"),
      providerRespondedAt: new Date("2026-03-18T09:15:00.000Z"),
      completionOtp: {
        code: "5584",
        isVerified: false,
      },
    },
    {
      service: serviceMap.Decoration._id,
      customer: kabir._id,
      provider: aarav._id,
      eventDate: new Date("2026-03-23T13:00:00.000Z"),
      location: "Udaipur",
      guestCount: 220,
      totalAmount: 65000,
      notes: "Lakefront decor is live today. Team is already on-site.",
      status: BOOKING_STATUS.IN_PROGRESS,
      providerAssignedAt: new Date("2026-03-21T08:00:00.000Z"),
      providerRespondedAt: new Date("2026-03-21T09:00:00.000Z"),
      startedAt: new Date("2026-03-23T07:30:00.000Z"),
      completionOtp: {
        code: "2741",
        isVerified: false,
      },
    },
    {
      service: serviceMap.Decoration._id,
      customer: riya._id,
      provider: aarav._id,
      eventDate: new Date("2026-03-22T16:00:00.000Z"),
      location: "Delhi",
      guestCount: 160,
      totalAmount: 52000,
      notes: "Stage styling is done. Waiting for customer OTP confirmation.",
      status: BOOKING_STATUS.OTP_PENDING,
      providerAssignedAt: new Date("2026-03-17T10:00:00.000Z"),
      providerRespondedAt: new Date("2026-03-17T11:00:00.000Z"),
      startedAt: new Date("2026-03-22T08:00:00.000Z"),
      providerCompletedAt: new Date("2026-03-22T20:00:00.000Z"),
      completionOtp: {
        code: "6319",
        isVerified: false,
      },
    },
    {
      service: serviceMap.Decoration._id,
      customer: riya._id,
      provider: aarav._id,
      eventDate: new Date("2026-03-08T16:00:00.000Z"),
      location: "Udaipur",
      guestCount: 250,
      totalAmount: 52000,
      notes: "Lakefront floral styling completed successfully.",
      status: BOOKING_STATUS.COMPLETED,
      providerAssignedAt: new Date("2026-02-25T09:00:00.000Z"),
      providerRespondedAt: new Date("2026-02-25T10:00:00.000Z"),
      startedAt: new Date("2026-03-08T08:00:00.000Z"),
      providerCompletedAt: new Date("2026-03-08T19:30:00.000Z"),
      completedAt: new Date("2026-03-08T20:00:00.000Z"),
      completionOtp: {
        code: "9137",
        isVerified: true,
        verifiedAt: new Date("2026-03-08T20:00:00.000Z"),
      },
    },
    {
      service: serviceMap.Catering._id,
      customer: neha._id,
      provider: nisha._id,
      eventDate: new Date("2026-03-19T12:00:00.000Z"),
      location: "Pune",
      guestCount: 140,
      totalAmount: 62000,
      notes: "Premium buffet service completed. Payout is still pending release.",
      status: BOOKING_STATUS.COMPLETED,
      providerAssignedAt: new Date("2026-03-10T10:00:00.000Z"),
      providerRespondedAt: new Date("2026-03-10T11:00:00.000Z"),
      startedAt: new Date("2026-03-19T06:00:00.000Z"),
      providerCompletedAt: new Date("2026-03-19T22:00:00.000Z"),
      completedAt: new Date("2026-03-19T22:30:00.000Z"),
      completionOtp: {
        code: "4452",
        isVerified: true,
        verifiedAt: new Date("2026-03-19T22:30:00.000Z"),
      },
    },
  ]);

  const makePayment = ({ booking, provider, method = "bank_transfer", releasedAt, status, transactionId }) => ({
    booking: booking._id,
    provider: provider._id,
    amount: calculateProviderPayout(booking.totalAmount),
    status,
    method,
    payoutDueDate: calculatePayoutDueDate(booking.eventDate),
    releasedAt,
    transactionId,
  });

  await Payment.create([
    makePayment({
      booking: bookings[2],
      provider: aarav,
      status: "pending",
    }),
    makePayment({
      booking: bookings[3],
      provider: aarav,
      status: "pending",
    }),
    makePayment({
      booking: bookings[4],
      provider: aarav,
      status: "pending",
    }),
    makePayment({
      booking: bookings[5],
      provider: aarav,
      status: "released",
      method: "upi",
      releasedAt: new Date("2026-03-11T12:00:00.000Z"),
      transactionId: "EM-20260311-4301",
    }),
    makePayment({
      booking: bookings[6],
      provider: nisha,
      status: "pending",
    }),
  ]);

  console.log("Seed data created successfully.");
  console.log(`Admin login: ${env.adminEmail} / ${env.adminPassword}`);
  console.log("Provider login: aarav.provider@eventmitra.com / Provider@123");
  console.log("Customer login: riya.customer@eventmitra.com / Customer@123");

  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error("Seeding failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
