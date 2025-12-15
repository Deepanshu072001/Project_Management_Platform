// src/components/PrimaryButton.jsx
import React from "react";
import { Button } from "@mui/material";

export default function PrimaryButton({ children, sx, ...props }) {
  return (
    <Button
      {...props}
      variant="contained"
      sx={{
        backgroundColor: "#2962FF",
        borderRadius: "8px",
        height: 40,
        textTransform: "none",
        fontWeight: 600,
        fontSize: "14px",
        "&:hover": { backgroundColor: "#1E4ECC" },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}
