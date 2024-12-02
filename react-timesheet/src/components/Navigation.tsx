"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

// Reusable wrapper for Next.js Link
const NextLink = React.forwardRef(function NextLink(props, ref) {
  return <Link {...props} ref={ref} />;
});

export default function NavigationDrawer() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use MUI theme to detect screen size
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <div style={{ padding: "20px", width: "200px" }}>
      <Typography variant="h6" style={{ marginBottom: "20px" }}>
        Contents TBD
      </Typography>
      <List>
        <ListItem button component={NextLink} href="/timesheets-list">
          <ListItemText primary="Timesheets" />
        </ListItem>
        <ListItem button component={NextLink} href="/auth-page">
          <ListItemText primary="Auth Page" />
        </ListItem>
        <ListItem button component={NextLink} href="/tutorial">
          <ListItemText primary="Tutorial" />
        </ListItem>
        <ListItem button component={NextLink} href="/dev-page">
          <ListItemText primary="Dev Stuff" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div style={{ width: isLargeScreen ? "200px" : "auto" }}>
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
    </div>
  );
}
