// src/layout/Sidebar.jsx
import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  useTheme,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../api/auth";

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { projectId } = useParams();

  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const user = data?.data?.data;

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Projects", path: "/projects" },
    { label: "Analytics", path: "/analytics" },
  ];

  if (user?.role === "admin") {
    menuItems.push({ label: "Admin Dashboard", path: "/admin" });
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 270,
          background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderRight: "1px solid rgba(255,255,255,0.04)",
          boxShadow: "4px 0 30px rgba(0,0,0,0.18)",
        },
      }}
    >
      <Box sx={{ p: 3, color: theme.palette.text.primary }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            src={user?.avatar?.url}
            sx={{
              width: 54,
              height: 54,
              border: "2px solid rgba(255,255,255,0.06)",
            }}
          />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>
              {user?.username ?? "User"}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", opacity: 0.7 }}>
              {user?.email ?? ""}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.05)" }} />

        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={{
                mb: 1,
                borderRadius: 1.5,
                "&:hover": {
                  background: "rgba(255,255,255,0.06)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}

          {projectId && (
            <ListItemButton
              onClick={() => {
                navigate(`/projects/${projectId}/notes`);
                onClose();
              }}
              sx={{
                borderRadius: 1.5,
                mt: 1,
                "&:hover": {
                  background: "rgba(255,255,255,0.06)",
                },
              }}
            >
              <ListItemText primary="Notes" />
            </ListItemButton>
          )}
        </List>
      </Box>
    </Drawer>
  );
}
