// src/context/AnalyticsFiltersContext.js
import React, { createContext, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";

const AnalyticsFiltersContext = createContext();

export function useAnalyticsFilters() {
  const ctx = useContext(AnalyticsFiltersContext);
  if (!ctx) throw new Error("useAnalyticsFilters must be used within provider");
  return ctx;
}

export function AnalyticsFiltersProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaults = {
    projectIds: [],
    status: "",
    priority: "",
    user: "",
    dateFrom: "",
    dateTo: "",
  };

  const urlToFilters = () => {
    const p = { ...defaults };
    if (searchParams.get("projects")) p.projectIds = searchParams.get("projects").split(",");
    if (searchParams.get("status")) p.status = searchParams.get("status");
    if (searchParams.get("priority")) p.priority = searchParams.get("priority");
    if (searchParams.get("user")) p.user = searchParams.get("user");
    if (searchParams.get("from")) p.dateFrom = searchParams.get("from");
    if (searchParams.get("to")) p.dateTo = searchParams.get("to");
    return p;
  };

  const [localFilters, setLocalFilters] = useState(urlToFilters);

  const applyFiltersToUrl = (filters) => {
    const params = {};
    if (filters.projectIds?.length) params.projects = filters.projectIds.join(",");
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.user) params.user = filters.user;
    if (filters.dateFrom) params.from = filters.dateFrom;
    if (filters.dateTo) params.to = filters.dateTo;

    setSearchParams(params, { replace: true });
    setLocalFilters(filters);
  };

  const resetFilters = () => {
    setSearchParams({}, { replace: true });
    setLocalFilters(defaults);
  };

  return (
    <AnalyticsFiltersContext.Provider
      value={{
        filters: localFilters,
        setFilters: applyFiltersToUrl,
        resetFilters,
      }}
    >
      {children}
    </AnalyticsFiltersContext.Provider>
  );
}
