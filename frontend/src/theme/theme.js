// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,

      // ---- Existing Colors (Kept) ----
      primary: { main: "#2962FF", light: "#42A5F5" },
      success: { main: "#43A047" },
      warning: { main: "#FB8C00" },
      error: { main: "#E53935" },
      info: { main: "#0288D1" },

      // ---- Light / Dark Backgrounds ----
      background: {
        default: mode === "dark" ? "#0F111A" : "#F5F7FB",
        paper: mode === "dark" ? "#1A1D24" : "#FFFFFF",
      },

      // ---- Text Colors ----
      text: {
        primary: mode === "dark" ? "#FFFFFF" : "#0F141A",
        secondary: mode === "dark" ? "#B0B8C3" : "#6F7885",
      },
    },

    // ---- Shape ----
    shape: {
      borderRadius: 10,
    },

    // ---- Typography ----
    typography: {
      fontFamily: "Inter, Roboto, sans-serif",
      h1: { fontSize: 32 },
      h4: { fontWeight: 600 },
    },

    // ---- Component-Level Styling ----
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: "all 0.3s ease",
            boxShadow:
              mode === "dark"
                ? "0px 2px 10px rgba(0,0,0,0.4)"
                : "0px 2px 10px rgba(0,0,0,0.08)",
          },
        },
      },

      MuiContainer: {
        styleOverrides: {
          root: { transition: "all 0.3s ease" },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: { transition: "0.3s ease" },
        },
      },
    },
  });

export default getTheme;
