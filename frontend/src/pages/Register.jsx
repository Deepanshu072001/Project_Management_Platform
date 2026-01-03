// src/pages/Register.jsx
import React, { useState } from "react";
import { TextField, Container, Box, Stack, Typography, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AvatarUpload from "../components/AvatarUpload";
import PrimaryButton from "../components/PrimaryButton";
import { register as apiRegister } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const chooseFile = (file) => {
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("email", form.email);
      fd.append("username", form.username);
      fd.append("password", form.password);
      if (avatar) fd.append("avatar", avatar);

      await apiRegister(fd);
      alert("Registered! Please verify your email before logging in.");
      navigate("/resend-verification");
    } catch (err) {
      alert(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={submit} mt={6}>
        <Typography variant="h4" mb={3}>Create an Account</Typography>

        <Stack spacing={2}>
          <AvatarUpload preview={preview} onFileChange={chooseFile} />

          <TextField
            label="Email"
            required
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <TextField
            label="Username"
            required
            fullWidth
            helperText="lowercase, minimum 3 characters"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
          />

          <TextField
            label="Password"
            type="password"
            required
            fullWidth
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <PrimaryButton type="submit">Register</PrimaryButton>

          {/* ⭐ Login Link */}
          <Typography variant="body2" textAlign="center">
            Already have an account?{" "}
            <Link
              component="button"
              color="primary"
              underline="hover"
              onClick={() => navigate("/login")}
            >
              Login here
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}
