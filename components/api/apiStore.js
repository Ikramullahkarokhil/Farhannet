import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://farhanict.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const initialState = {
  packagesData: [],
  user: {},
  categories: [],
  activePackage: {},
  loginLoading: false,
  loginError: null,
  loading: false,
  user: null,

  loading: false,
  error: null,
};

const apiStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      fetchAllPakages: async () => {
        try {
          set({ loading: true });

          const response = await api.get(`/packages/list`);
          set({
            packagesData: response.data.packages || [],
            categories: response.data.categories.data || {},
          });
          set({ loading: false });
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          throw new Error(errorMessage);
        }
      },

      fetchCustomerPackage: async (customerId) => {
        try {
          set({ loading: true });

          const response = await api.get(
            `/customer/package-details?customer_id=${customerId}`
          );
          set({
            activePackage: response.data.packageDetails,
          });
          set({ loading: false });
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          throw new Error(errorMessage);
        }
      },

      login: async (username, password) => {
        try {
          const response = await api.post(
            `/customer/login?username=${username}&password=${password}`
          );
          set({ user: response.data.customerDetails || {} });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          throw new Error(errorMessage);
        }
      },

      resetStore: () => {
        set(initialState);
      },
      logout: () => {
        set({ user: null });
      },
    }),

    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        allPakages: state.allPakages,
        user: state.user,
      }),
    }
  )
);

export default apiStore;
