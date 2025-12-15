// src/layout/Navbar.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  useTheme,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, logout } from "../api/auth";

export default function Navbar({ onMenuClick, mode, setMode }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });

  const user = data?.data?.data;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="navbar-glass"
      sx={{
        background:
          theme.palette.mode === "dark"
            ? "rgba(18, 18, 28, 0.55)"
            : "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* LEFT SECTION */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={onMenuClick}
            sx={{
              color: theme.palette.mode === "dark" ? "#E4E4E4" : "#111",
              "&:hover": { transform: "scale(1.06)" },
              transition: "0.18s",
            }}
            size="large"
          >
            <MenuIcon />
          </IconButton>

          {/* TITLE */}
          <Typography
            variant="h6"
            className="navbar-title"
            sx={{
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.6,
              color: theme.palette.mode === "dark" ? "#FFFFFF" : "#111111",
              textShadow:
                theme.palette.mode === "dark"
                  ? "0 0 12px rgba(0, 225, 255, 0.45)"
                  : "none",
              transition: "0.2s",
              "&:hover": {
                opacity: 0.85,
              },
            }}
            onClick={() => navigate("/dashboard")}
          >
            Project Management
          </Typography>
        </Box>

        {/* RIGHT SECTION */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* DARK/LIGHT SWITCH */}
          <IconButton
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            sx={{
              color: theme.palette.mode === "dark" ? "#00E5FF" : "#333333",
              transition: "0.18s",
              "&:hover": {
                transform: "scale(1.15)",
              },
            }}
            size="large"
          >
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* AVATAR */}
          <Avatar
            src={user?.avatar?.url}
            sx={{
              width: 40,
              height: 40,
              border:
                theme.palette.mode === "dark"
                  ? "2px solid rgba(0,255,255,0.22)"
                  : "2px solid rgba(0,0,0,0.15)",
              cursor: "pointer",
              transition: "0.18s",
              "&:hover": { transform: "scale(1.08)" },
            }}
            onClick={() => navigate("/profile")}
          />

          {/* LOGOUT BUTTON */}
          <Typography
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              opacity: 0.9,
              "&:hover": { opacity: 1 },
              color: theme.palette.mode === "dark" ? "#f5f5f7" : "#222",
            }}
          >
            Logout
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
