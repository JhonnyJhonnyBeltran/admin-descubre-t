import React, { createContext, useContext, useMemo, useState } from "react";
import { EMPTY_FILTERS, type DashboardFilters } from "@/types/dashboard";

interface FilterContextValue {
  filters: DashboardFilters;
  setFilters: (f: DashboardFilters) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const getDefaultDateRange = (): Pick<DashboardFilters, "from" | "to"> => {
    const to = new Date();
    const from = new Date(to);
    from.setMonth(from.getMonth() - 1);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { from: fmt(from), to: fmt(to) };
  };

  const [filters, setFilters] = useState<DashboardFilters>({
    ...EMPTY_FILTERS,
    ...getDefaultDateRange(),
  });

  const value = useMemo(
    () => ({ filters, setFilters, resetFilters: () => setFilters({ ...EMPTY_FILTERS, ...getDefaultDateRange() }) }),
    [filters],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilterContext() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilterContext must be used within a FilterProvider");
  return ctx;
}

export default FilterProvider;
