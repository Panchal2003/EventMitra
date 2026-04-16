import { Booking } from "../models/Booking.js";
import { BOOKING_STATUS } from "./bookingLifecycle.js";

const parseTime = (time) => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

export const checkTimeOverlap = async (providerId, eventDate, startTime, endTime, serviceIds = [], excludeBookingId = null) => {
  const dateStr = new Date(eventDate).toISOString().split("T")[0];
  
  const query = {
    provider: providerId,
    eventDate: {
      $gte: new Date(dateStr),
      $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000)
    },
    status: {
      $in: [
        BOOKING_STATUS.CONFIRMED,
        BOOKING_STATUS.IN_PROGRESS,
        BOOKING_STATUS.OTP_PENDING,
        BOOKING_STATUS.COMPLETED,
      ],
    },
    eventTime: { $exists: true, $ne: "" }
  };

  if (serviceIds && serviceIds.length > 0) {
    query.services = { $in: serviceIds };
  }

  const existingBookings = await Booking.find(query);

  let bookings = existingBookings;
  if (excludeBookingId) {
    bookings = existingBookings.filter(
      b => String(b._id) !== String(excludeBookingId)
    );
  }

  const newStartMins = parseTime(startTime);
  const newEndMins = endTime ? parseTime(endTime) : newStartMins + 120;

  for (const booking of bookings) {
    const existingStart = parseTime(booking.eventTime);
    const existingEnd = existingStart + 120;

    if (
      (newStartMins >= existingStart && newStartMins < existingEnd) ||
      (newEndMins > existingStart && newEndMins <= existingEnd) ||
      (newStartMins <= existingStart && newEndMins >= existingEnd)
    ) {
      return {
        hasOverlap: true,
        existingBooking: booking
      };
    }
  }

  return { hasOverlap: false };
};

export const getAvailableTimeSlots = async (providerId, eventDate, durationHours = 2, serviceIds = []) => {
  const dateStr = new Date(eventDate).toISOString().split("T")[0];
  
  const query = {
    provider: providerId,
    eventDate: {
      $gte: new Date(dateStr),
      $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000)
    },
    status: {
      $in: [
        BOOKING_STATUS.CONFIRMED,
        BOOKING_STATUS.IN_PROGRESS,
        BOOKING_STATUS.OTP_PENDING,
        BOOKING_STATUS.COMPLETED,
      ],
    },
    eventTime: { $exists: true, $ne: "" }
  };

  if (serviceIds && serviceIds.length > 0) {
    query.services = { $in: serviceIds };
  }

  const existingBookings = await Booking.find(query).select("eventTime");

  const durationMins = durationHours * 60;
  const bookedSlots = existingBookings.map(b => ({
    start: parseTime(b.eventTime),
    end: parseTime(b.eventTime) + 120
  }));

  const allSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 20) {
      allSlots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }

  const availableSlots = allSlots.filter(time => {
    const timeMins = parseTime(time);
    const endMins = timeMins + durationMins;
    
    return !bookedSlots.some(slot =>
      (timeMins >= slot.start && timeMins < slot.end) ||
      (endMins > slot.start && endMins <= slot.end) ||
      (timeMins <= slot.start && endMins >= slot.end)
    );
  });

  return availableSlots;
};

export const getAvailableTimeSlotsForServices = async (providerId, eventDate, serviceIds, durationHours = 2) => {
  const dateStr = new Date(eventDate).toISOString().split("T")[0];
  
  const existingBookings = await Booking.find({
    provider: providerId,
    eventDate: {
      $gte: new Date(dateStr),
      $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000)
    },
    status: {
      $in: [
        BOOKING_STATUS.CONFIRMED,
        BOOKING_STATUS.IN_PROGRESS,
        BOOKING_STATUS.OTP_PENDING,
        BOOKING_STATUS.COMPLETED,
      ],
    },
    eventTime: { $exists: true, $ne: "" },
    services: { $in: serviceIds }
  }).select("eventTime services");

  const durationMins = durationHours * 60;

  const allSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 20) {
      allSlots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }

  const availableSlots = allSlots.filter(time => {
    const timeMins = parseTime(time);
    const endMins = timeMins + durationMins;
    
    const isBooked = existingBookings.some(booking => {
      const existingStart = parseTime(booking.eventTime);
      const existingEnd = existingStart + 120;
      
      return (
        (timeMins >= existingStart && timeMins < existingEnd) ||
        (endMins > existingStart && endMins <= existingEnd) ||
        (timeMins <= existingStart && endMins >= existingEnd)
      );
    });
    
    return !isBooked;
  });

  return availableSlots;
};
