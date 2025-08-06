import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  DialogContentText,
} from "@mui/material";
import { useCustomTheme } from "../../contexts/useCustomTheme";


interface HelpDialogProps {
  open: boolean
  onClose: () => void
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ open, onClose }) => {
  const { currentTheme, isDarkMode } = useCustomTheme();
  const descriptionElementRef = useRef<HTMLElement>(null);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      scroll={"paper"}
      sx={{
        "& .MuiDialog-paper": {
          bgcolor: isDarkMode ? currentTheme.colors.surfaceBackground : "background.paper",
          color: isDarkMode ? currentTheme.colors.surfaceText : "text.primary",
        },
      }}
    >
      <DialogTitle sx={{ color: currentTheme.colors.primary, fontWeight: "bold" }}>
        How to Use Stream Schedule
      </DialogTitle>
      <DialogContent dividers
        sx={{
          // Custom scrollbar styling for dark mode
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: isDarkMode ? "#2c2c2c" : "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: isDarkMode ? "#555" : "#c1c1c1",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: isDarkMode ? "#777" : "#a8a8a8",
            },
          },
          "&::-webkit-scrollbar-thumb:active": {
            backgroundColor: isDarkMode ? "#999" : "#8a8a8a",
          },
        }}
      >
        <DialogContentText ref={descriptionElementRef} tabIndex={-1}>
          {/* Getting Started */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: currentTheme.colors.primary, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              ・Getting Started・
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Choose your preferred color theme from the theme dropdown" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Toggle between light and dark modes using the switch" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Select the starting day for the week" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Choose your preferred timezone(s)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Enter your social media handle(s)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Choose your preferred schedule layout" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Upload your own background image for your schedule" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Add and customize activities for your schedule" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />
          {/* Creating Your Schedule */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: currentTheme.colors.primary, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              ・Creating Your Schedule・
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Click on any day to start customizing it" />
              </ListItem>
              <ListItem>
                <ListItemText primary='Use "Add Entry" to add new activities to your schedule' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Choose between "Stream" or "Offline" for activity type' />
              </ListItem>
              <ListItem>
                <ListItemText primary="Set the time, title, subtitle, set activity to member-only or not, and choose preferred tags to highlight your activity" />
              </ListItem>
              <ListItem>
                <ListItemText primary='Offline activities will show your custom text or "OFFLINE" by default' />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />
          {/* Timezone Configuration */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: currentTheme.colors.primary, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              ・Timezone Configuration・
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary='Click "Timezone Settings" to expand the section' />
              </ListItem>
              <ListItem>
                <ListItemText primary="Enable up to 3 different timezones for your international audience" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Toggle each timezone on/off and select from available options" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Times will be automatically converted and displayed in the Preview" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Time tags will automatically indicate if the activity happens on the next day for certain timezones" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />
          {/* Social Media Handles */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ color: currentTheme.colors.primary, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              ・Social Media Handles・
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary='Click "Social Media" to expand the section' />
              </ListItem>
              <ListItem>
                <ListItemText primary={`Toggle "Show Artist" to display artist's name/social media handle in the Preview`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Add up to 5 social media handles to display in your schedule" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Choose from YouTube, Twitch, Twitter, TikTok, and Discord platforms" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Each handle appears as a small chip with platform icon, displayed at the bottom of the image section in the Preview" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />
          {/* Layout Configuration */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: currentTheme.colors.primary, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              ・Layout Configuration・
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary='Click "Layout Settings" to expand the section' />
              </ListItem>
              <ListItem>
                <ListItemText primary="Input title to display above your schedule" />
              </ListItem>
              <ListItem>
                <ListItemText primary='Toggle "Transparent Background" to use your uploaded image as full background for your schedule' />
              </ListItem>
              <ListItem>
                <ListItemText primary='Choose "Left Side" or "Right Side" for Schedule Content Position' />
              </ListItem>
              <ListItem>
                <ListItemText primary="+ Left Side: Schedule content on left, character image on right" />
              </ListItem>
              <ListItem>
                <ListItemText primary="+ Right Side: Schedule content on right, character image on left" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Layout position helps you optimize the design based on your image composition" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />
          {/* Customizing Your Image */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: currentTheme.colors.primary, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              ・Customizing Your Image・
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary='Click "Upload Image" to select an image file from your computer' />
              </ListItem>
              <ListItem>
                <ListItemText primary="Go to the Preview tab after uploading an image" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Click the Settings icon on top of your image to open controls" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Drag your image to reposition it (not available with full background)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Use sliders to adjust scale and rotation" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Use buttons for quick 90° rotations and flipping horizontally or vertically" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Use position inputs for precise adjustments" />
              </ListItem>
              <ListItem>
                <ListItemText primary='Click "Reset All" to revert all changes' />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 2 }} />
          {/* Exporting Your Schedule */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: currentTheme.colors.primary, mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              ・Exporting Your Schedule・
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary='Click the "Export Schedule" button in the Preview to start downloading your schedule' />
              </ListItem>
              <ListItem>
                <ListItemText primary="Choose your preferred format: PNG or JPEG" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Your schedule will be exported at 16:9 resolution" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Select image quality: Standard (1600x900) or High (1920x1080)" />
              </ListItem>
            </List>
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            color: "white",
            fontWeight: "bold",
            mx: 2, my: 1,
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default HelpDialog;