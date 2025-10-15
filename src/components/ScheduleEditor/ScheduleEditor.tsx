/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useState, useEffect } from "react";
import type { ScheduleEntry, ScheduleEditorProps, SocialMediaHandle } from "../../types";
import { 
  Alert, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip, 
  FormControl, 
  FormControlLabel, 
  Grid, 
  IconButton, 
  InputLabel, 
  MenuItem, 
  Paper, 
  Select, 
  Switch, 
  TextField, 
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Checkbox,
  FormGroup,
  RadioGroup,
  Radio,
} from "@mui/material";
import { useCustomTheme } from "../../contexts/useCustomTheme";
import HelpDialog from "../HelpDialog/HelpDialog";
import { Add, CheckCircle, Delete, Help, Palette, Upload, ExpandMore, Public, ViewModule, Person } from "@mui/icons-material";
import { CustomThemeToggle } from "../LightModeToggle/LightModeToggle";
import { AVAILABLE_TIMEZONES, DAYS } from "../../constants/dayTime";
import { format, parseISO } from "date-fns"


const SOCIAL_MEDIA_PLATFORMS = [
  { id: "YouTube", label: "YouTube", placeholder: "@yourchannel" },
  { id: "Twitch", label: "Twitch", placeholder: "yourstream" },
  { id: "Twitter", label: "Twitter", placeholder: "@yourusername" },
  { id: "Discord", label: "Discord", placeholder: "YourServer#1234" },
  { id: "TikTok", label: "TikTok", placeholder: "@yourusername" },
];

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    return format(parseISO(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
};

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ scheduleData, setScheduleData, onImageUpload, onImageRestore }) => {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const { currentTheme, setTheme, themes, isDarkMode } = useCustomTheme();
  const [showHelp, setShowHelp] = useState(false);
  const [hasAttemptedImageLoad, setHasAttemptedImageLoad] = useState(false);
  useEffect(() => {
    if (scheduleData) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem('schedule-maker-data', JSON.stringify(scheduleData));
        } catch (error) {
          console.error('Failed to save schedule data:', error);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [scheduleData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!hasAttemptedImageLoad && !scheduleData.backgroundImage) {
        setHasAttemptedImageLoad(true);
        
        const savedImage = localStorage.getItem('schedule-maker-image');
        if (savedImage) {
          try {
            const imageData = JSON.parse(savedImage);
            fetch(imageData.data)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], imageData.name, { type: imageData.type });
                if (onImageRestore) {
                  onImageRestore(file);
                } else {
                  onImageUpload(file);
                }
              })
              .catch(error => {
                console.error('Failed to restore image:', error);
              });
          } catch (error) {
            console.error('Failed to load saved image:', error);
          }
        } else {
          console.log('ScheduleEditor: No saved image found in localStorage');
        }
      } else if (scheduleData.backgroundImage) {
        setHasAttemptedImageLoad(true);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAttemptedImageLoad, scheduleData.backgroundImage]);

  // Schedule Entry Management
  const addScheduleEntry = (day: string) => {
    const newEntry: ScheduleEntry = {
      id: Date.now().toString(),
      time: "09:00",
      title: "Stream title Here",
      subtitle: "Description here",
      type: "stream",
      memberOnly: false,
      tags: { collab: false, announcement: false, custom: false, customText: "" },
    }

    setScheduleData((prev: any) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: [...(prev.schedule[day] || []), newEntry],
      },
    }))
  };

  const updateScheduleEntry = (day: string, entryId: string, field: keyof ScheduleEntry, value: any) => {
    setScheduleData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]:
          prev.schedule[day]?.map((entry) => {
            if (entry.id === entryId) {
              const updatedEntry = { ...entry, [field]: value };
              if (field === "type" && value === "offline" && !updatedEntry.offlineText) {
                updatedEntry.offlineText = "OFFLINE";
              }
              if (field === "type" && value === "stream") {
                delete updatedEntry.offlineText;
              }
              return updatedEntry;
            }
            return entry;
          }) || [],
      },
    }))
  };

  const updateScheduleEntryTag = 
    (
      day: string, 
      entryId: string, 
      tagType: "collab" | "announcement", 
      value: boolean,
    ) => {
    setScheduleData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]:
          prev.schedule[day]?.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  tags: {
                    ...entry.tags,
                    [tagType]: value,
                  },
                }
              : entry,
          ) || [],
      },
    }))
  };

  const updateCustomEntryTag = 
    (
      day: string, 
      entryId: string, 
      custom: boolean,
      customText: string,
    ) => {
    setScheduleData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]:
          prev.schedule[day]?.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  tags: {
                    ...entry.tags,
                    custom: custom,
                    customText: customText,
                  },
                }
              : entry,
          ) || [],
      },
    }))
  };

  const removeScheduleEntry = (day: string, entryId: string) => {
    setScheduleData((prev: any) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: prev.schedule[day]?.filter((entry: { id: string; }) => entry.id !== entryId) || [],
      },
    }))
  };

  // Image Upload Handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Image file is too large. Please choose a file smaller than 5MB for automatic saving.');
        onImageUpload(file);
        return;
      }

      // Convert file to base64 and store in localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        const imageData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64String,
          uploadedAt: new Date().toISOString()
        };
        
        try {
          const dataString = JSON.stringify(imageData);
          // Check if the data would fit in localStorage (approximate size check)
          if (dataString.length > 4.5 * 1024 * 1024) {
            alert('Image is large and may not persist between sessions. Consider using a smaller image.');
          } else {
            localStorage.setItem('schedule-maker-image', dataString);
          }
        } catch (error) {
          console.error('Failed to save image to localStorage:', error);
          if (error instanceof DOMException && error.code === 22) {
            alert('Storage quota exceeded. Image will not persist between sessions.');
          }
        }
      };
      reader.readAsDataURL(file);
      onImageUpload(file)
    }
  };

  const clearSavedImage = () => {
    try {
      localStorage.removeItem('schedule-maker-image');
      setScheduleData((prev) => ({
        ...prev,
        backgroundImage: null,
        imageTransform: {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          flipX: false,
          flipY: false,
        },
        backgroundTransform: {
          positionX: 50,
          positionY: 50,
          scale: 1,
        },
      }));
    } catch (error) {
      console.error('Failed to clear saved image:', error);
    }
  };

  const handleHelpOpen = () => {
    setShowHelp(true)
  };

  const handleHelpClose = () => {
    setShowHelp(false)
  };

  // Themes Handlers
  const lightThemes = themes.filter((theme: any) => !theme.isDark);
  const currentBaseTheme = lightThemes.find(
    (theme: any) => theme.id === currentTheme.id || theme.id === currentTheme.id.replace("-dark", "")
  );

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId);
  };

  // Timezone Handlers
  const handleTimezoneToggle = (timezoneId: string) => {
    setScheduleData((prev) => ({
      ...prev,
      timezones: prev.timezones.map((tz) => (tz.id === timezoneId ? { ...tz, enabled: !tz.enabled } : tz))
    }))
  };

  const handleTimezoneChange = (index: number, newTimezoneId: string) => {
    const newTimezone = AVAILABLE_TIMEZONES.find((tz) => tz.id === newTimezoneId)
    if (!newTimezone) return

    setScheduleData((prev) => ({
      ...prev,
      timezones: prev.timezones.map((tz: any, i: any) => (i === index ? { ...newTimezone, enabled: tz.enabled } : tz))
    }))
  };

  const getEnabledTimezonesCount = () => {
    return scheduleData.timezones.filter((tz: any) => tz.enabled).length;
  };

  // Social Media Handlers
  const handleSocialMediaToggle = (handleId: string) => {
    setScheduleData((prev) => ({
      ...prev,
      socialMediaHandles: prev.socialMediaHandles.map((handle) =>
        handle.id === handleId ? { ...handle, enabled: !handle.enabled } : handle,
      ),
    }))
  };

  const handleSocialMediaChange = (handleId: string, field: keyof SocialMediaHandle, value: string) => {
    setScheduleData((prev) => ({
      ...prev,
      socialMediaHandles: prev.socialMediaHandles.map((handle) =>
        handle.id === handleId ? { ...handle, [field]: value } : handle,
      ),
    }))
  };

  const addSocialMediaHandle = () => {
    const newHandle: SocialMediaHandle = {
      id: Date.now().toString(),
      platform: "YouTube",
      handle: "",
      enabled: true,
    }

    setScheduleData((prev) => ({
      ...prev,
      socialMediaHandles: [...prev.socialMediaHandles, newHandle],
    }))
  };

  const removeSocialMediaHandle = (handleId: string) => {
    setScheduleData((prev) => ({
      ...prev,
      socialMediaHandles: prev.socialMediaHandles.filter((handle) => handle.id !== handleId),
    }))
  };

  const getEnabledSocialMediaCount = () => {
    return scheduleData.socialMediaHandles.filter((handle) => handle.enabled && handle.handle.trim()).length
  };

  const getPlatformPlaceholder = (platform: string) => {
    const platformData = SOCIAL_MEDIA_PLATFORMS.find((p) => p.id === platform)
    return platformData?.placeholder || "@yourhandle"
  };

  return (
    <>
      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={2}>
            <CardHeader
              title="General Settings"
              sx={{
                variant: "h6", 
                fontWeight: "bold",
                pb: 1
              }}
              action={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* Instructions */}
                  <IconButton onClick={handleHelpOpen} size="small" title="Help">
                    <Help />
                  </IconButton>

                  {/* Theme Toggle */}
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <CustomThemeToggle />
                  </Box>
                </Box>
              }
            />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Color Theme</InputLabel>
                  <Select
                    value={currentBaseTheme?.id || "pink"}
                    label="Color Theme"
                    onChange={(e) => handleThemeChange(e.target.value)}
                    startAdornment={<Palette sx={{ mr: 1, color: "action.active" }} />}
                  >
                    {lightThemes.map((theme) => (
                      <MenuItem key={theme.id} value={theme.id}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 12,
                              borderRadius: 0.5,
                              background: theme.colors.primary,
                              flexShrink: 0,
                            }}
                          />
                          <Box
                            sx={{
                              width: 20,
                              height: 12,
                              borderRadius: 0.5,
                              background: theme.colors.secondary,
                              flexShrink: 0,
                            }}
                          />
                          <Box
                            sx={{
                              width: 20,
                              height: 12,
                              borderRadius: 0.5,
                              background: theme.colors.tertiary,
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2">{theme.name}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Schedule Starting Date"
                  type="date"
                  value={scheduleData.startDate}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    // Calculate the Monday of the selected week
                    const dayOfWeek = selectedDate.getDay();
                    const startOfWeek = new Date(selectedDate);
                    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                    startOfWeek.setDate(selectedDate.getDate() - daysToSubtract);

                    // Calculate the Sunday (end of week)
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);

                    setScheduleData((prev) => ({
                      ...prev,
                      startDate: startOfWeek.toISOString().split("T")[0],
                      endDate: endOfWeek.toISOString().split("T")[0],
                    }))
                  }}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  helperText={
                    scheduleData.startDate && scheduleData.endDate
                      ? `Week: ${formatDate(scheduleData.startDate)} - ${formatDate(scheduleData.endDate)}`
                      : "Select any date to set the week"
                  }
                />
              </Box>

              {/* Timezone Settings */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: 48,
                    "&.Mui-expanded": { minHeight: 48 },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Public />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Timezone Settings
                    </Typography>
                    <Chip
                      label={`${getEnabledTimezonesCount()}/3`}
                      size="small"
                      color={getEnabledTimezonesCount() > 0 ? "primary" : "default"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1 }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 2, color: "text.secondary" }}>
                    Enable up to 3 timezones to display in schedule preview
                  </Typography>

                  {scheduleData.timezones.map((timezone, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Switch
                          checked={timezone.enabled}
                          onChange={() => handleTimezoneToggle(timezone.id)}
                          size="small"
                          disabled={!timezone.enabled && getEnabledTimezonesCount() >= 3}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Timezone {index + 1}
                        </Typography>
                        {timezone.enabled && (
                          <Chip label={timezone.abbreviation} size="small" color="primary" variant="outlined" />
                        )}
                      </Box>

                      {timezone.enabled && (
                        <FormControl fullWidth size="small">
                          <InputLabel>Select Timezone</InputLabel>
                          <Select
                            value={timezone.id}
                            label="Select Timezone"
                            onChange={(e) => handleTimezoneChange(index, e.target.value)}
                          >
                            {AVAILABLE_TIMEZONES.map((tz) => (
                              <MenuItem key={tz.id} value={tz.id}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                  <Typography variant="body2">{tz.label}</Typography>
                                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    {tz.abbreviation}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {index < 2 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}

                  {getEnabledTimezonesCount() === 0 && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Enable at least one timezone to show time information in your schedule
                      </Typography>
                    </Alert>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Username Section */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: 48,
                    "&.Mui-expanded": { minHeight: 48 },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Social Media
                    </Typography>
                    <Chip
                      label={`${getEnabledSocialMediaCount()}/5`}
                      size="small"
                      color={scheduleData.showArtist || getEnabledSocialMediaCount() > 0 ? "primary" : "default"}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1 }}>
                  {/* Artist Credit */}
                  <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scheduleData.showArtist}
                          onChange={(e) => setScheduleData((prev) => ({ ...prev, showArtist: e.target.checked }))}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Show Artist
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Display artist's name in schedule preview
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Artist Name"
                      value={scheduleData.artistName}
                      onChange={(e) => setScheduleData((prev) => ({ ...prev, artistName: e.target.value }))}
                      placeholder="@username"
                      size="small"
                      disabled={!scheduleData.showArtist}
                      sx={{
                        "& .MuiInputBase-input": {
                          opacity: scheduleData.showArtist ? 1 : 0.5,
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Social Media Handles */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Social Media Handles
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Add />}
                        onClick={addSocialMediaHandle}
                        disabled={scheduleData.socialMediaHandles.length >= 5}
                        sx={{ textTransform: "none" }}
                      >
                        Add Handle
                      </Button>
                    </Box>

                    <Typography variant="caption" sx={{ display: "block", mb: 2, color: "text.secondary" }}>
                      Add up to 5 social media handles to display in schedule preview
                    </Typography>

                    {scheduleData.socialMediaHandles.map((handle, index) => {
                      return (
                        <Box key={handle.id} sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <Switch
                              checked={handle.enabled}
                              onChange={() => handleSocialMediaToggle(handle.id)}
                              size="small"
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Social Media {index + 1}
                            </Typography>
                            {scheduleData.socialMediaHandles.length > 3 && (
                              <IconButton
                                size="small"
                                onClick={() => removeSocialMediaHandle(handle.id)}
                                sx={{ ml: "auto" }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Box>

                          {handle.enabled && (
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 1 }}>
                              <FormControl size="small">
                                <InputLabel>Platform</InputLabel>
                                <Select
                                  value={handle.platform}
                                  label="Platform"
                                  onChange={(e) => handleSocialMediaChange(handle.id, "platform", e.target.value)}
                                >
                                  {SOCIAL_MEDIA_PLATFORMS.map((platform) => {
                                    return (
                                      <MenuItem key={platform.id} value={platform.id}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <Typography variant="body2">{platform.label}</Typography>
                                        </Box>
                                      </MenuItem>
                                    )
                                  })}
                                </Select>
                              </FormControl>

                              <TextField
                                size="small"
                                label="Handle"
                                value={handle.handle}
                                onChange={(e) => handleSocialMediaChange(handle.id, "handle", e.target.value)}
                                placeholder={getPlatformPlaceholder(handle.platform)}
                              />
                            </Box>
                          )}

                          {index < scheduleData.socialMediaHandles.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                      )
                    })}

                    {scheduleData.socialMediaHandles.length === 0 && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          💡 Add social media handles to display them in your schedule preview
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Layout Settings */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: 48,
                    "&.Mui-expanded": { minHeight: 48 },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ViewModule />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Layout Settings
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Schedule Title"
                      value={scheduleData.scheduleTitle}
                      onChange={(e) => setScheduleData((prev) => ({ ...prev, scheduleTitle: e.target.value }))}
                      placeholder="Enter schedule title"
                      size="small"
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={scheduleData.transparentBackground || false}
                          onChange={(e) =>
                            setScheduleData((prev) => ({ ...prev, transparentBackground: e.target.checked }))
                          }
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Transparent Background
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Use uploaded image as full schedule background
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      Schedule Content Position
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={scheduleData.schedulePosition || "right"}
                        onChange={(e) =>
                          setScheduleData((prev) => ({
                            ...prev,
                            schedulePosition: e.target.value as "left" | "right",
                          }))
                        }
                        row
                      >
                        <FormControlLabel
                          value="left"
                          control={<Radio size="small" />}
                          label={
                            <Typography variant="body2">
                              Left Side
                              <Typography variant="caption" color="text.secondary" display="block">
                                Schedule on left, image on right
                              </Typography>
                            </Typography>
                          } 
                          sx={{ mb: 1 }}
                        />
                        <FormControlLabel
                          value="right"
                          control={<Radio size="small" />}
                          label={
                            <Typography variant="body2">
                              Right Side
                              <Typography variant="caption" color="text.secondary" display="block">
                                Image on left, schedule on right
                              </Typography>
                            </Typography>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {scheduleData.transparentBackground && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        With transparent background enabled, your uploaded image will cover the entire schedule area.
                      </Typography>
                    </Alert>
                  )}
                </AccordionDetails>
              </Accordion>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Background Image
                </Typography>
                <input
                  id="background-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Upload />}
                    onClick={() => document.getElementById("background-image")?.click()}
                  >
                    Upload Image
                  </Button>
                  {scheduleData.backgroundImage && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => {
                        clearSavedImage();
                      }}
                      sx={{ minWidth: 'auto' }}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
                {scheduleData.backgroundImage && (
                  <Alert severity="success" icon={<CheckCircle />} sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Image uploaded successfully!
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                      💡 Go to Preview tab to edit your image position, size, and rotation. Both the image and all your edits will be restored automatically when you reopen the app.
                    </Typography>
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Day Selection */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={2}>
            <CardHeader
              title="Select Day"
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {DAYS.map((day) => (
                  <Button
                    key={day}
                    variant={selectedDay === day ? "contained" : "outlined"}
                    onClick={() => setSelectedDay(day)}
                    sx={{
                      justifyContent: "space-between",
                      textTransform: "none",
                      py: 1,
                      color: isDarkMode ? "white" : (selectedDay === day ? "white" : currentTheme.colors.primary),
                      borderColor: isDarkMode ? "white" : currentTheme.colors.primary,
                    }}
                    endIcon={
                      scheduleData.schedule[day]?.length > 0 ? (
                        <Chip
                          label={scheduleData.schedule[day].length}
                          size="small"
                          sx={{
                            bgcolor: selectedDay === day ? "rgba(255,255,255,0.25)" : currentTheme.colors.primary,
                            color: selectedDay === day ? "white" : "white",
                            minWidth: "24px",
                            height: "20px",
                          }}
                        />
                      ) : null
                    }
                  >
                    {day}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule Entries */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={2}>
            <CardHeader
              title={`${selectedDay} Schedule`}
              action={
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => addScheduleEntry(selectedDay)}
                  disabled={scheduleData.schedule[selectedDay]?.length >= 2}
                  sx={{ textTransform: "none", m: 1 }}
                >
                  Add Entry
                </Button>
              }
              sx={{ pb: 1 }}
            />
            <CardContent>
              {scheduleData.schedule[selectedDay]?.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {scheduleData.schedule[selectedDay].map((entry) => (
                    <Paper
                      key={entry.id}
                      elevation={1}
                      sx={{
                        p: 2,
                        border: `1px solid ${currentTheme.colors.borderLight}`,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, mb: 3 }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={entry.type}
                            label="Type"
                            onChange={(e) => updateScheduleEntry(selectedDay, entry.id, "type", e.target.value)}
                          >
                            <MenuItem value="stream">Stream</MenuItem>
                            <MenuItem value="offline">Offline</MenuItem>
                          </Select>
                        </FormControl>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeScheduleEntry(selectedDay, entry.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      {entry.type === "stream" && (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <TextField
                              fullWidth
                              label="Time"
                              type="time"
                              value={entry.time}
                              onChange={(e) => updateScheduleEntry(selectedDay, entry.id, "time", e.target.value)}
                              size="small"
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <TextField
                              fullWidth
                              label="Title"
                              value={entry.title}
                              onChange={(e) => updateScheduleEntry(selectedDay, entry.id, "title", e.target.value)}
                              placeholder="Stream Title Here"
                              size="small"
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <TextField
                              fullWidth
                              label="Subtitle"
                              value={entry.subtitle}
                              onChange={(e) => updateScheduleEntry(selectedDay, entry.id, "subtitle", e.target.value)}
                              placeholder="Sub header title here"
                              size="small"
                            />
                          </Box>

                          {/* Member Only Toggle */}
                          <Box sx={{ mb: 2 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={entry.memberOnly || false}
                                  onChange={(e) =>
                                    updateScheduleEntry(selectedDay, entry.id, "memberOnly", e.target.checked)
                                  }
                                  size="medium"
                                />
                              }
                              label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      Member Only
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Restrict this activity to members only
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                            />
                          </Box>

                          {/* Tags Section */}
                          <Box sx={{ mb: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: "text.secondary" }}>
                                Stream Tags
                              </Typography>
                            </Box>
                            <FormGroup row>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={entry.tags?.collab || false}
                                    onChange={(e) =>
                                      updateScheduleEntryTag(selectedDay, entry.id, "collab", e.target.checked)
                                    }
                                    size="small"
                                    sx={{
                                      color: currentTheme.colors.secondary,
                                      "&.Mui-checked": {
                                        color: currentTheme.colors.secondary,
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                                    Collab
                                  </Typography>
                                }
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={entry.tags?.announcement || false}
                                    onChange={(e) =>
                                      updateScheduleEntryTag(selectedDay, entry.id, "announcement", e.target.checked)
                                    }
                                    size="small"
                                    sx={{
                                      color: currentTheme.colors.primary,
                                      "&.Mui-checked": {
                                        color: currentTheme.colors.primary,
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                                    Announcement
                                  </Typography>
                                }
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={entry.tags?.custom || false}
                                    onChange={(e) =>
                                      updateCustomEntryTag(selectedDay, entry.id, e.target.checked, entry.tags?.customText || "")
                                    }
                                    size="small"
                                    sx={{
                                      color: currentTheme.colors.tertiary,
                                      "&.Mui-checked": {
                                        color: currentTheme.colors.tertiary,
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                                    Custom
                                  </Typography>
                                }
                              />
                            </FormGroup>

                            {/* Custom Tag Input */}
                            {entry.tags?.custom && (
                              <Box sx={{ mt: 1, mb: 2 }}>
                                <TextField
                                  fullWidth
                                  label="Custom Tag"
                                  value={entry.tags?.customText || ""}
                                  onChange={(e) => updateCustomEntryTag(selectedDay, entry.id, entry.tags?.custom || false, e.target.value)}
                                  placeholder="Enter custom tag text"
                                  size="small"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      "&:hover fieldset": {
                                        borderColor: currentTheme.colors.primary,
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: currentTheme.colors.primary,
                                      },
                                    },
                                  }}
                                />
                              </Box>
                            )}

                            {(entry.tags?.collab || entry.tags?.announcement || (entry.tags?.customText && entry.tags?.customText.trim())) && (
                              <Box sx={{ my: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {entry.tags.collab && (
                                  <Chip
                                    label="COLLAB"
                                    size="small"
                                    sx={{
                                      bgcolor: currentTheme.colors.secondary,
                                      color: currentTheme.colors.tagTextSet?.[1],
                                      fontSize: "0.625rem",
                                      height: "20px",
                                      fontWeight: 600,
                                    }}
                                  />
                                )}
                                {entry.tags.announcement && (
                                  <Chip
                                    label="ANNOUNCEMENT"
                                    size="small"
                                    sx={{
                                      bgcolor: currentTheme.colors.primary,
                                      color: currentTheme.colors.tagTextSet?.[0],
                                      fontSize: "0.625rem",
                                      height: "20px",
                                      fontWeight: 600,
                                    }}
                                  />
                                )}
                                {entry.tags.custom && entry.tags.customText && entry.tags.customText.trim() && (
                                  <Chip
                                    label={entry.tags.customText.toUpperCase()}
                                    size="small"
                                    sx={{
                                      bgcolor: currentTheme.colors.tertiary,
                                      color: currentTheme.colors.tagTextSet?.[2],
                                      fontSize: "0.625rem",
                                      height: "20px",
                                      fontWeight: 600,
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                          </Box>
                        </>
                      )}

                      {entry.type === "offline" && (
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            label="Offline Text"
                            value={entry.offlineText || "OFFLINE"}
                            onChange={(e) =>
                              updateScheduleEntry(selectedDay, entry.id, "offlineText", e.target.value)
                            }
                            placeholder="OFFLINE"
                            size="small"
                            helperText="This text will be displayed on the Offline card"
                          />
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    No entries for {selectedDay}
                  </Typography>
                  <Typography variant="body2">Click "Add Entry" to get started</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Help Dialog */}
      <HelpDialog open={showHelp} onClose={handleHelpClose} />
    </>
  )
};

export default ScheduleEditor;