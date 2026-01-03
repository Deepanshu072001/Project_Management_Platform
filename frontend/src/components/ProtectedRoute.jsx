import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth";

export default function ProtectedRoute({ children }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });

  if (isLoading) return <div>Loading...</div>;

  if (isError || !data?.data?.data) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
