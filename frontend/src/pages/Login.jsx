// src/pages/Login.jsx
import React, { useState } from "react";
import { TextField, Container, Box, Stack, Typography, Link } from "@mui/material";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form); // backend sets cookies
      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={submit} mt={6}>
        <Typography variant="h4" mb={3}>Login</Typography>

        <Stack spacing={2}>
          <TextField
            label="Email"
            required
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <TextField
            label="Password"
            type="password"
            required
            fullWidth
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <PrimaryButton type="submit">Login</PrimaryButton>

          {/* ⭐ Register Link */}
          <Typography variant="body2" textAlign="center">
            Not registered yet?{" "}
            <Link
              component="button"
              color="primary"
              underline="hover"
              onClick={() => navigate("/register")}
            >
              Create an account
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
