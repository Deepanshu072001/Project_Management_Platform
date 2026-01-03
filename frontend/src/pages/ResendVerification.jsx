// src/pages/ResendVerification.jsx
import React, { useState } from "react";
import { Box, TextField, Typography, Button } from "@mui/material";
import axios from "../api/axiosInstance";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const resend = async () => {
    try {
      await axios.post("/users/resend-email-verification", { email });
      setMessage("Verification email sent! Check your inbox.");
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to send verification email."
      );
    }
  };

  return (
    <Box width="400px" mx="auto" mt={10} textAlign="center">
      <Typography variant="h5" mb={3}>
        Resend Email Verification
      </Typography>

      <TextField
        fullWidth
        label="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button variant="contained" fullWidth onClick={resend}>
        Send Verification Email
      </Button>

      {message && (
        <Typography mt={3} color="primary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
