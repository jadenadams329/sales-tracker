import { create } from "zustand";
import { Sale, CountsData, SaleResponse, ApiError } from "../interfaces";
import { csrfFetch } from "../services/csrf";

interface SaleFilters {
  page?: number;
  size?: number;
  serviceDateFrom?: string;
  serviceDateTo?: string;
  serviced?: string;
}

interface SaleState {
  sales: Sale[];
  counts: CountsData;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  filters: SaleFilters;

  // Actions
  setSales: (filters?: SaleFilters) => Promise<void>;
  clearSales: () => void;
  createSale: (sale: Omit<Sale, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateSale: (id: number, sale: Partial<Sale>) => Promise<void>;
  deleteSale: (id: number) => Promise<void>;
  setFilters: (filters: Partial<SaleFilters>) => void;
  clearFilters: () => void;
}

export const useSaleStore = create<SaleState>((set, get) => ({
  sales: [],
  counts: {
    agreementLength: { "One-time": 0, "12 Months": 0, "24 Months": 0 },
    planType: { "One-time": 0, 'Basic': 0, 'Pro': 0, 'Premium': 0 },
    autopay: { 'None': 0, 'CC': 0, 'ACH': 0 },
    serviced: { 'Pending': 0, 'Yes': 0, 'No': 0 },
  },
  isLoading: false,
  currentPage: 1,
  pageSize: 20,
  filters: {},

  setSales: async (filters?: SaleFilters) => {
    set({ isLoading: true });
    try {
      // Combine existing filters with new filters
      const currentFilters = get().filters;
      const newFilters = { ...currentFilters, ...filters };
      set({ filters: newFilters });

      // Build query string
      const queryParams = new URLSearchParams();
      if (newFilters.page) queryParams.append("page", newFilters.page.toString());
      if (newFilters.size) queryParams.append("size", newFilters.size.toString());
      if (newFilters.serviceDateFrom) queryParams.append("serviceDateFrom", newFilters.serviceDateFrom);
      if (newFilters.serviceDateTo) queryParams.append("serviceDateTo", newFilters.serviceDateTo);
      if (newFilters.serviced) queryParams.append("serviced", newFilters.serviced);

      const response = await csrfFetch(`/api/sales?${queryParams.toString()}`);
      const data = await response.json() as SaleResponse;

      set({
        sales: data.data.sales,
        counts: data.data.counts,
        isLoading: false,
        currentPage: filters?.page || get().currentPage
      });
    } catch (err) {
      set({ isLoading: false });
      const response = err as Response;
      const errorData = await response.json();
      throw errorData as ApiError;
    }
  },

  clearSales: () => {
    set({ sales: [], counts: {
      agreementLength: { "One-time": 0, "12 Months": 0, "24 Months": 0 },
      planType: { "One-time": 0, 'Basic': 0, 'Pro': 0, 'Premium': 0 },
      autopay: { 'None': 0, 'CC': 0, 'ACH': 0 },
      serviced: { 'Pending': 0, 'Yes': 0, 'No': 0 },
    },
    });
  },

  createSale: async (sale) => {
    set({ isLoading: true });
    try {
      const response = await csrfFetch("/api/sales", {
        method: "POST",
        body: JSON.stringify(sale),
      });
      await response.json();

      // Refresh the sales list after creating
      await get().setSales(get().filters);
    } catch (err) {
      set({ isLoading: false });
      const response = err as Response;
      const errorData = await response.json();
      throw errorData as ApiError;
    }
  },

  updateSale: async (id, sale) => {
    set({ isLoading: true });
    try {
      const response = await csrfFetch(`/api/sales/${id}`, {
        method: "PUT",
        body: JSON.stringify(sale),
      });
      await response.json();

      // Refresh the sales list after updating
      await get().setSales(get().filters);
    } catch (err) {
      set({ isLoading: false });
      const response = err as Response;
      const errorData = await response.json();
      throw errorData as ApiError;
    }
  },

  deleteSale: async (id) => {
    set({ isLoading: true });
    try {
      const response = await csrfFetch(`/api/sales/${id}`, {
        method: "DELETE",
      });
      await response.json();

      // Refresh the sales list after deleting
      await get().setSales(get().filters);
    } catch (err) {
      set({ isLoading: false });
      const response = err as Response;
      const errorData = await response.json();
      throw errorData as ApiError;
    }
  },

  setFilters: (filters) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...filters } });
  },

  clearFilters: () => {
    set({
      filters: {},
      currentPage: 1
    });
  },
}));
