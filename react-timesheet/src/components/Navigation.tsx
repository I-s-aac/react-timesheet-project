"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
  Button,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

export default function NavigationDrawer() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use MUI theme to detect screen size
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ padding: "20px", width: "200px" }}>
      <Typography variant="h6" sx={{ marginBottom: "20px" }}>
        Contents TBD
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Button
          component={Link}
          href="/timesheets-list"
          variant="text"
          sx={{ textTransform: "none" }}
        >
          Timesheets
        </Button>
        <Button
          component={Link}
          href="/auth-page"
          variant="text"
          sx={{ textTransform: "none" }}
        >
          Auth Page
        </Button>
        <Button
          component={Link}
          href="/tutorial"
          variant="text"
          sx={{ textTransform: "none" }}
        >
          Tutorial
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: isLargeScreen ? "200px" : "auto" }}>
      {!isLargeScreen && (
        <IconButton color="error" onClick={toggleDrawer}>
          <MenuOutlinedIcon />
        </IconButton>
      )}
      <Drawer
        variant={isLargeScreen ? "permanent" : "temporary"}
        open={isLargeScreen || mobileOpen}
        onClose={toggleDrawer}
        anchor="left"
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
