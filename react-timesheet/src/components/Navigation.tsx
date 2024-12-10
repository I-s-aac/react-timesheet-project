"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Button,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useUndoContext } from "@/contexts/UndoContext";

export default function NavigationDrawer() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const width = "150px";

  // Use MUI theme to detect screen size
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  const { undoStack } = useUndoContext();

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ padding: "20px", width: width }}>
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
        <Button
          onClick={() => {
            if (undoStack[0]) undoStack[0].undo();
          }}
          variant="text"
          sx={{ textTransform: "none" }}
        >
          {undoStack.length > 0 ? (<span>Undo Last Delete</span>) : (<span>Nothing to Undo</span>)}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: isLargeScreen ? width : "auto" }} className="md:me-5">
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
