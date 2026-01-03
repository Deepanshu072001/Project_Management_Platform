import React, { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import getAppTheme from "./theme/theme"; // UPDATED: theme must be a FUNCTION
import "./App.css";
const qc = new QueryClient();

function Root() {
  const [mode, setMode] = useState("light");

  // Dynamic theme (light/dark)
  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App mode={mode} setMode={setMode} />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
