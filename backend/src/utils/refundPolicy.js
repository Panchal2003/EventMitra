import { roundCurrency } from "./paymentLifecycle.js";

export const getBookingEventDateTime = (eventDate, eventTime = "") => {
  if (!eventDate) {
    return null;
  }

  const date = new Date(eventDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (!eventTime) {
    return date;
  }

  const [hours, minutes] = String(eventTime).split(":").map((part) => Number(part || 0));
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

export const getHoursUntilEvent = (eventDate, eventTime = "", currentTime = new Date()) => {
  const eventDateTime = getBookingEventDateTime(eventDate, eventTime);
  if (!eventDateTime) {
    return 0;
  }

  return (eventDateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
};

export const calculateRefundDetails = ({
  totalAmount,
  advancePaid,
  eventDate,
  eventTime,
  cancelledAt = new Date(),
}) => {
  const hoursUntilEvent = getHoursUntilEvent(eventDate, eventTime, cancelledAt);

  let refundPercentOfTotal = 10;
  let cancellationPolicy = "less_than_12_hours";
  let policyLabel = "10% refund";

  if (hoursUntilEvent > 36) {
    refundPercentOfTotal = 20;
    cancellationPolicy = "more_than_36_hours";
    policyLabel = "100% of advance";
  } else if (hoursUntilEvent >= 24) {
    refundPercentOfTotal = 18;
    cancellationPolicy = "between_24_and_36_hours";
    policyLabel = "18% of total";
  } else if (hoursUntilEvent >= 12) {
    refundPercentOfTotal = 15;
    cancellationPolicy = "between_12_and_24_hours";
    policyLabel = "15% of total";
  }

  const refundAmount = roundCurrency(
    Math.min(Number(advancePaid || 0), (Number(totalAmount || 0) * refundPercentOfTotal) / 100)
  );

  return {
    hoursUntilEvent,
    refundAmount,
    refundPercentOfTotal,
    cancellationPolicy,
    policyLabel,
  };
};
