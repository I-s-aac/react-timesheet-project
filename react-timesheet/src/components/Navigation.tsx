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

export default function NavigationDrawer() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Use MUI theme to detect screen size
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md")); // Adjust for "md" screens and larger

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <div style={{ padding: "20px" }}>
      <Typography variant="h6" style={{ marginBottom: "20px" }}>
        Contents TBD
      </Typography>
      <List>
        <Link href="/timesheets-list/" passHref>
          <ListItem button="true" component="a">
            <ListItemText primary="Timesheets" />
          </ListItem>
        </Link>
        <Link href="/auth-page">
          <ListItem button="true">
            <ListItemText primary="Auth Page" />
          </ListItem>
        </Link>
        <Link href="/tutorial">
          <ListItem button="true">
            <ListItemText primary="Tutorial" />
          </ListItem>
        </Link>
        <Link href="/dev-page">
          <ListItem>
            <ListItemText primary="Dev Stuff" />
          </ListItem>
        </Link>
      </List>
    </div>
  );

  return (
    <div className="">
      {!isLargeScreen && (
        <IconButton color="error" onClick={toggleDrawer}>
          <MenuOutlinedIcon />
        </IconButton>
      )}

      <Drawer
        className="w-[200px]"
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
