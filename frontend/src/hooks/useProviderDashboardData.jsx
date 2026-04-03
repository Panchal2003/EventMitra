import { useCallback, useEffect, useState } from "react";
import { providerApi } from "../services/api";

const initialState = {
  summary: null,
  profile: null,
  categories: [],
  bookings: [],
  earnings: [],
  earningsSummary: null,
};

export function useProviderDashboardData() {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInFlight, setActionInFlight] = useState("");

  const loadProviderData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardResponse, categoriesResponse, profileResponse, bookingsResponse, earningsResponse] =
        await Promise.all([
          providerApi.getDashboard(),
          providerApi.getServiceCategories(),
          providerApi.getProfile(),
          providerApi.getBookings(),
          providerApi.getEarnings(),
        ]);

      setState({
        summary: dashboardResponse.data.data,
        categories: categoriesResponse.data.data,
        profile: profileResponse.data.data,
        bookings: bookingsResponse.data.data,
        earnings: earningsResponse.data.data?.payments || [],
        earningsSummary: earningsResponse.data.data,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load the expert dashboard. Please confirm the backend is running and seeded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviderData();
  }, [loadProviderData]);

  const wrapAction = useCallback(
    async (label, action) => {
      setActionInFlight(label);

      try {
        const response = await action();
        await loadProviderData();
        return response;
      } finally {
        setActionInFlight("");
      }
    },
    [loadProviderData]
  );

  return {
    ...state,
    loading,
    error,
    actionInFlight,
    refresh: loadProviderData,
    updateProfile: (payload) =>
      wrapAction("update-provider-profile", () => providerApi.updateProfile(payload)),
    uploadPortfolio: (files) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      return wrapAction("upload-provider-portfolio", () => providerApi.uploadPortfolio(formData));
    },
    respondToBooking: (id, action) =>
      wrapAction(`respond-booking-${id}-${action}`, () => providerApi.respondToBooking(id, action)),
    verifyStartOtp: (id, otp) => wrapAction(`verify-start-otp-${id}`, () => providerApi.verifyStartOtp(id, otp)),
    startJob: (id) => wrapAction(`start-job-${id}`, () => providerApi.startJob(id)),
    completeJob: (id) => wrapAction(`complete-job-${id}`, () => providerApi.completeJob(id)),
    verifyCompletionOtp: (id, payload) =>
      wrapAction(`verify-completion-otp-${id}`, () => providerApi.verifyCompletionOtp(id, payload)),
    regenerateCompletionOtp: (id) => wrapAction(`regenerate-otp-${id}`, () => providerApi.regenerateCompletionOtp(id)),
  };
}
