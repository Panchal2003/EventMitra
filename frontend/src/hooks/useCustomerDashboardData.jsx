import { useCallback, useEffect, useState } from "react";
import { customerApi } from "../services/api";

const initialState = {
  summary: null,
  services: [],
  bookings: [],
};

export function useCustomerDashboardData() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInFlight, setActionInFlight] = useState("");

  const loadCustomerData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, servicesResponse, bookingsResponse] = await Promise.all([
        customerApi.getDashboard(),
        customerApi.getServices(),
        customerApi.getBookings(),
      ]);

      setState({
        summary: dashboardResponse.data.data,
        services: servicesResponse.data.data,
        bookings: bookingsResponse.data.data,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load customer booking data. Please confirm the backend is running and seeded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  const wrapAction = useCallback(
    async (label, action) => {
      setActionInFlight(label);

      try {
        const response = await action();
        await loadCustomerData();
        return response;
      } finally {
        setActionInFlight("");
      }
    },
    [loadCustomerData]
  );

  return {
    ...state,
    loading,
    error,
    actionInFlight,
    refresh: loadCustomerData,
    createBooking: (payload) =>
      wrapAction("create-customer-booking", () => customerApi.createBooking(payload)),
  };
}
