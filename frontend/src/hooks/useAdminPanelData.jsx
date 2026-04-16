import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../services/api";

const initialState = {
  metrics: null,
  categories: [],
  services: [],
  providers: [],
  bookings: [],
  payments: [],
};

export function useAdminPanelData() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInFlight, setActionInFlight] = useState("");

  const loadPanelData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        dashboardResponse,
        categoriesResponse,
        servicesResponse,
        providersResponse,
        bookingsResponse,
        paymentsResponse,
      ] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getServiceCategories(),
        adminApi.getServices(),
        adminApi.getProviders(),
        adminApi.getBookings(),
        adminApi.getPayments(),
      ]);

      setState({
        metrics: dashboardResponse.data.data,
        categories: categoriesResponse.data.data,
        services: servicesResponse.data.data,
        providers: providersResponse.data.data,
        bookings: bookingsResponse.data.data,
        payments: paymentsResponse.data.data,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load admin data. Please confirm the API is running and seeded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPanelData();
  }, [loadPanelData]);

  const wrapAction = useCallback(
    async (label, action) => {
      setActionInFlight(label);

      try {
        await action();
        await loadPanelData();
      } finally {
        setActionInFlight("");
      }
    },
    [loadPanelData]
  );

  return {
    ...state,
    loading,
    error,
    actionInFlight,
    refresh: loadPanelData,
    createServiceCategory: (payload) =>
      wrapAction("create-service-category", () => adminApi.createServiceCategory(payload)),
    createService: (payload) => wrapAction("create-service", () => adminApi.createService(payload)),
    updateService: (id, payload) =>
      wrapAction(`update-service-${id}`, () => adminApi.updateService(id, payload)),
    deleteService: (id) => wrapAction(`delete-service-${id}`, () => adminApi.deleteService(id)),
    updateProviderStatus: (id, status) =>
      wrapAction(`provider-${id}-${status}`, () => adminApi.updateProviderStatus(id, status)),
    assignProvider: (id, providerId) =>
      wrapAction(`assign-provider-${id}`, () => adminApi.assignProvider(id, providerId)),
    cancelBooking: (id) => wrapAction(`cancel-booking-${id}`, () => adminApi.cancelBooking(id)),
    releasePayout: (id, payload) =>
      wrapAction(`release-payment-${id}`, () => adminApi.releasePayout(id, payload)),
  };
}
