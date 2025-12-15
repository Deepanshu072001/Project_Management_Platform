// src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { Box, Typography, CircularProgress, Button } from "@mui/material";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); 
  // "loading", "success", "error"

  useEffect(() => {
    async function verify() {
      try {
        await axios.get(`/users/verify-email/${token}`);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    }
    verify();
  }, [token]);

  return (
    <Box textAlign="center" mt={10}>
      {status === "loading" && <CircularProgress />}

      {status === "success" && (
        <>
          <Typography variant="h5" color="green" mb={2}>
            Email Verified Successfully 🎉
          </Typography>
          <Button variant="contained" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <Typography variant="h6" color="error" mb={2}>
            Verification link invalid or expired ❌
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate("/resend-verification")}
          >
            Resend Verification Email
          </Button>
        </>
      )}
    </Box>
  );
}
