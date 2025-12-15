// src/layout/MainLayout.jsx
import React, { useState } from "react";
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(localStorage.getItem("theme") || "light");

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background:
          mode === "dark"
            ? "linear-gradient(135deg, #070816, #071029)"
            : "#f5f7fb",
      }}
    >
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Navbar
          onMenuClick={() => setOpen(true)}
          mode={mode}
          setMode={(m) => {
            setMode(m);
            localStorage.setItem("theme", m);
          }}
        />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
