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

  console.log("[RefundPolicy] Hours until event:", hoursUntilEvent);
  console.log("[RefundPolicy] Event Date:", eventDate, "Event Time:", eventTime);

  let refundPercentOfAdvance = 50;
  let cancellationPolicy = "less_than_12_hours";
  let policyLabel = "50% refund";

  if (hoursUntilEvent > 36) {
    refundPercentOfAdvance = 100;
    cancellationPolicy = "more_than_36_hours";
    policyLabel = "100% advance refund";
  } else if (hoursUntilEvent >= 24) {
    refundPercentOfAdvance = 80;
    cancellationPolicy = "between_24_and_36_hours";
    policyLabel = "80% advance refund";
  } else if (hoursUntilEvent >= 18) {
    refundPercentOfAdvance = 75;
    cancellationPolicy = "between_18_and_24_hours";
    policyLabel = "75% advance refund";
  } else if (hoursUntilEvent >= 12) {
    refundPercentOfAdvance = 65;
    cancellationPolicy = "between_12_and_18_hours";
    policyLabel = "65% advance refund";
  }

  const refundAmount = roundCurrency(
    Math.min(Number(advancePaid || 0), (Number(advancePaid || 0) * refundPercentOfAdvance) / 100)
  );

  console.log("[RefundPolicy] Refund amount:", refundAmount, "Policy:", cancellationPolicy);

  return {
    hoursUntilEvent,
    refundAmount,
    refundPercentOfAdvance,
    cancellationPolicy,
    policyLabel,
  };
};
