/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Chip, 
  IconButton, 
  Paper, 
  Typography, 
} from "@mui/material";
import { 
  Download,
  InsertPhoto,
  Settings,
} from '@mui/icons-material';
import type { BackgroundTransform, ImageTransform, SchedulePreviewProps } from "../../types";
import ExportModal from "../ExportModal/ExportModal";
import { useCustomTheme } from "../../contexts/useCustomTheme";
import { DiscordIcon, TikTokIcon, TwitchIcon, TwitterIcon, YoutubeIcon } from "../../assets/images";
import { ImageControls } from "../ImageControls/ImageControls";


const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABBREV = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const getPlatformIcon = (platform: string) => {
  const platformIcons: { [key: string]: any } = {
    YouTube: () => <Box paddingTop={0.5}><img src={YoutubeIcon} alt="YouTube" width="18" height="18" /></Box>,
    Twitch: () => <Box paddingTop={0.5}><img src={TwitchIcon} alt="Twitch" width="18" height="18" /></Box>,
    Twitter: () => <Box paddingTop={0.5}><img src={TwitterIcon} alt="Twitter" width="18" height="18" /></Box>,
    Discord: () => <Box paddingTop={0.5}><img src={DiscordIcon} alt="Discord" width="18" height="18" /></Box>,
    TikTok: () => <Box paddingTop={0.5}><img src={TikTokIcon} alt="TikTok" width="18" height="18" /></Box>,
  };

  return platformIcons[platform];
};

// Enhanced timezone conversion helper with day difference calculation
const convertTimeWithDayDiff = (time: string, fromTz: string, toTz: string): { time: string; dayDiff: number } => {
  const timezoneOffsets: { [key: string]: number } = {
    pst: -8, // UTC-8
    pdt: -7, // UTC-7
    cst: -6, // UTC-6
    est: -4, // UTC-4
    gmt: 0, // UTC+0 (same as UTC)
    cet: 1, // UTC+1
    cest: 2, // UTC+2
    wib: 7, // UTC+7
    jst: 9, // UTC+9
    aest: 10, // UTC+10
  };

  const [hours, minutes] = time.split(":").map(Number);
  const fromOffset = timezoneOffsets[fromTz.toLowerCase()] || 0;
  const toOffset = timezoneOffsets[toTz.toLowerCase()] || 0;

  let convertedHours = hours + (toOffset - fromOffset);
  let dayDiff = 0;

  // Handle day overflow/underflow and track day difference
  if (convertedHours < 0) {
    convertedHours += 24;
    dayDiff = -1;
  } else if (convertedHours >= 24) {
    convertedHours -= 24;
    dayDiff = 1;
  }

  return {
    time: `${convertedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    dayDiff,
  };
};

const SchedulePreview: React.FC<SchedulePreviewProps> = ({ 
  scheduleData, 
  onImageTransformChange, 
  isExporting = false 
}) => {
  const { currentTheme, isDarkMode } = useCustomTheme();
  const [showImageControls, setShowImageControls] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBackgroundControls, setShowBackgroundControls] = useState(false);

  const [backgroundTransform, setBackgroundTransform] = useState<BackgroundTransform>({
    scale: 1,
    positionX: 50,
    positionY: 50,
  });

  // Date time handlers
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "MMM dd").toUpperCase();
    } catch {
      return dateString;
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour24 = Number.parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const getDayIndicatorLetter = (currentDayIndex: number, dayDiff: number): string => {
    if (dayDiff === 0) return "";
    const targetDayIndex = (currentDayIndex + dayDiff + 7) % 7; // Handle negative indices
    const dayLetters = ["M", "T", "W", "T", "F", "S", "S"];
    return dayLetters[targetDayIndex];
  };

  const getWeekDates = () => {
    if (!scheduleData.startDate) return [];
    try {
      const startDate = parseISO(scheduleData.startDate);
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(startDate, i);
        dates.push(currentDate.getDate().toString().padStart(2, "0"));
      }
      return dates;
    } catch {
      return ["01", "02", "03", "04", "05", "06", "07"];
    }
  };

  const weekDates = getWeekDates();

  const getImageTransformStyle = () => {
    const { x, y, scale, rotation, flipX, flipY } = scheduleData.imageTransform
    const scaleX = flipX ? -scale : scale
    const scaleY = flipY ? -scale : scale
    return {
      transform: `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`,
      transformOrigin: "center center",
      cursor: isDragging ? "grabbing" : scheduleData.backgroundImage ? "grab" : "default",
    }
  };

  const getTransparentBackgroundStyle = () => {
    if (!scheduleData.transparentBackground || !scheduleData.backgroundImage) {
      return {}
    }

    return {
      backgroundImage: `url(${scheduleData.backgroundImage})`,
      backgroundSize: `${backgroundTransform.scale * 100}%`,
      backgroundPosition: `${backgroundTransform.positionX}% ${backgroundTransform.positionY}%`,
      backgroundRepeat: "no-repeat",
    }
  };

  // Image control handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scheduleData.backgroundImage || !onImageTransformChange || isExporting) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - scheduleData.imageTransform.x,
      y: e.clientY - scheduleData.imageTransform.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scheduleData.backgroundImage || !onImageTransformChange || isExporting) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    onImageTransformChange({
      ...scheduleData.imageTransform,
      x: newX,
      y: newY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Activity entry handlers
  const renderActivityTags = (entry: any) => {
    const tags = [];

    if (entry.tags?.collab) {
      tags.push(
        <Chip
          key="collab"
          label="COLLAB"
          size="small"
          className="poetsen-one-font"
          sx={{
            bgcolor: currentTheme.colors.secondary,
            color: "white",
            fontSize: "0.7rem",
            height: "22px",
          }}
        />,
      )
    }

    if (entry.tags?.announcement) {
      tags.push(
        <Chip
          key="announcement"
          label="ANNOUNCEMENT"
          size="small"
          className="poetsen-one-font"
          sx={{
            bgcolor: currentTheme.colors.primary,
            color: "white",
            fontSize: "0.625rem",
            height: "22px",
          }}
        />,
      )
    }

    if (entry.tags?.special) {
      tags.push(
        <Chip
          key="special"
          label="???"
          size="small"
          className="poetsen-one-font"
          sx={{
            bgcolor: currentTheme.colors.tertiary,
            color: "white",
            fontSize: "0.625rem",
            height: "22px",
          }}
        />,
      )
    }

    return tags;
  }

  const renderTimeBadges = (entry: any, dayIndex: number) => {
    const enabledTimezones = scheduleData.timezones.filter((tz) => tz.enabled);

    return enabledTimezones.map((timezone, index) => {
      const timeData =
        index === 0
          ? { time: entry.time, dayDiff: 0 }
          : convertTimeWithDayDiff(entry.time, enabledTimezones[0].id, timezone.id);

      const dayIndicator = getDayIndicatorLetter(dayIndex, timeData.dayDiff);

      return (
        <Chip
          key={timezone.id}
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography className="poetsen-one-font" variant="caption">
                {formatTime(timeData.time)} ({timezone.abbreviation.toUpperCase()})
              </Typography>
              {dayIndicator && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    opacity: 0.9,
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                  }}
                >
                  ({dayIndicator})
                </Typography>
              )}
            </Box>
          }
          size="small"
          sx={{
            bgcolor: currentTheme.colors.timeBadgeSet?.[index % (currentTheme.colors.timeBadgeSet?.length || 1)] || 
              (index === 0 ? currentTheme.colors.primary : currentTheme.colors.secondary),
            color: currentTheme.colors.textSet?.[index % (currentTheme.colors.textSet?.length || 1)] || 
              (index === 0 ? "white" : "darkgray"),
            fontSize: "0.65rem",
            height: "24px",
            fontWeight: 600,
          }}
        />
      )
    })
  };

  const renderDayContent = (dayEntries: any[], dayIndex: number, _day: string, dayDate: string) => {
    const cardBgColor = currentTheme.colors.cardBackground;
    const cardBorderColor = currentTheme.colors.cardBorder;

    const DayAbbreviationChip = ({ dayIndex }: { dayIndex: number }) => (
      <Chip
        label={DAY_ABBREV[dayIndex]}
        size="small"
        className="titan-one-font"
        sx={{
          bgcolor: currentTheme.colors.primarySet?.[dayIndex % (currentTheme.colors.primarySet.length || 1)] || currentTheme.colors.primary,
          color: currentTheme.colors.textSet?.[dayIndex % (currentTheme.colors.textSet.length || 1)] || "white",
          fontSize: "0.8rem",
          boxShadow: scheduleData.transparentBackground ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
          zIndex: 1,
          rotate: "-25deg",
          marginLeft: "-10px",
          marginTop: "-5px",
          width: "50px"
        }}
      />
    );

    const DayTab = () => (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 80,
          position: "relative",
          alignSelf: "center",
        }}
      >
        <Paper
          sx={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "white",
            borderRadius: 2,
            backdropFilter: "blur(2px)",
          }}
        >
          <Typography
            variant="h5"
            className="coiny-font"
            sx={{
              color: currentTheme.colors.primary,
            }}
          >
            {dayDate}
          </Typography>
        </Paper>

        {/* Dashed connecting line */}
        {/* <Box
          sx={{
            position: "absolute",
            right: -24,
            top: "50%",
            width: 24,
            height: 2,
            borderTop: `2px dashed ${currentTheme.colors.primary}40`,
            transform: "translateY(-50%)",
          }}
        /> */}
      </Box>
    );

    if (dayEntries.length === 0) {
      // Default activity
      return (
        <Box sx={{ display: "flex", margin: "8px 0", height: "95px" }}>
          <DayAbbreviationChip dayIndex={dayIndex} />
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "flex-start", 
              gap: 2, 
              zIndex: 0,
              position: "absolute",
              width: "54%",
            }}
          >
            <Card
              sx={{
                flex: 1,
                bgcolor: cardBgColor,
                borderRadius: 2,
                border: `3px solid ${cardBorderColor}`,
                height: 95,
                backdropFilter: "blur(2px)",
                display: "flex",
              }}
            >
              <DayTab />
              <CardContent sx={{ display: "flex", p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignSelf: "center" }}>
                  <Typography className="titan-one-font" variant="h5" sx={{ color: currentTheme.colors.textPrimary }}>
                    No Activities
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      );
    }

    if (dayEntries.length === 1) {
      const entry = dayEntries[0]

      if (entry.type === "offline") {
         const offlineText = entry.offlineText || "OFFLINE";
        return (
          <Box sx={{ display: "flex", margin: "8px 0", height: "95px" }}>
            <DayAbbreviationChip dayIndex={dayIndex} />
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: 2, 
                zIndex: 0,
                position: "absolute",
                width: "54%",
              }}
            >
              <Card
                sx={{
                  flex: 1,
                  bgcolor: currentTheme.colors.primary,
                  borderRadius: 2,
                  height: 95,
                  display: "flex",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <DayTab />
                <CardContent 
                  sx={{ 
                    p: 2, 
                    "&:last-child": { pb: 2 },
                    position: "relative",
                    minHeight: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Repeating offline text pattern background */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -70,
                      left: -90,
                      bottom: -180,
                      right: -760,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      transform: "rotate(12deg)",
                      opacity: 0.3,
                      pointerEvents: "none",
                      overflow: "hidden",
                    }}
                  >
                    {/* Create multiple rows of offline text */}
                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                      <Box
                        key={rowIndex}
                        sx={{
                          display: "flex",
                          gap: "10px",
                          whiteSpace: "nowrap",
                          transform: rowIndex % 2 === 0 ? "translateX(0)" : "translateX(-60px)",
                        }}
                      >
                        {Array.from({ length: 12 }).map((_, colIndex) => (
                          <Typography
                            key={colIndex}
                            className="poetsen-one-font"
                            sx={{
                              color: "white",
                              fontSize: "1.5rem",
                              letterSpacing: "0.1em",
                              userSelect: "none",
                            }}
                          >
                            {offlineText}
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
      }

      return (
        <Box sx={{ display: "flex", margin: "8px 0", height: "95px" }}>
          <DayAbbreviationChip dayIndex={dayIndex} />
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "flex-start", 
              gap: 2, 
              zIndex: 0,
              position: "absolute",
              width: "54%",
            }}
          >
            <Card
              sx={{
                flex: 1,
                bgcolor: cardBgColor,
                borderRadius: 2,
                border: `3px solid ${cardBorderColor}`,
                height: 95,
                backdropFilter: "blur(2px)",
                display: "flex",
                overflow: "visible"
              }}
            >
              <DayTab />
              <CardContent sx={{ p: "6px 8px", "&:last-child": { pb: 1 }, width: "100%", overflow: "visible" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignSelf: "center", flex: 1, mr: 2 }}>
                    <Typography variant="h5" 
                      className="titan-one-font"
                      sx={{
                        color: entry.memberOnly ? currentTheme.colors.textSecondary : currentTheme.colors.textPrimary,
                      }}
                      >
                      {entry.title}
                    </Typography>
                    <Typography variant="body1" 
                      className="lilita-one-font"
                      sx={{ 
                        color: entry.memberOnly ? currentTheme.colors.textSecondary : currentTheme.colors.textPrimary, mb: 1 
                      }}
                    >
                      {entry.subtitle}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-end" }}>
                    {renderTimeBadges(entry, dayIndex)}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", position: "absolute", bottom: -12, }}>
                  {renderActivityTags(entry)}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      );
    }

    // Multiple activities
    return (
      <Box sx={{ display: "flex", margin: "8px 0", height: "95px" }}>
        <DayAbbreviationChip dayIndex={dayIndex} />
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "flex-start", 
            gap: 2, 
            zIndex: 0,
            position: "absolute",
            width: "54%",
          }}
        >
          <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            {dayEntries.slice(0, 2).map((entry, index) => (
              <Card
                key={entry.id}
                sx={{
                  bgcolor: entry.type === "offline" ? currentTheme.colors.primary : cardBgColor,
                  borderRadius: 2,
                  border: entry.type === "offline" ? "none" : `3px solid ${cardBorderColor}`,
                  height: 95,
                  backdropFilter: "blur(2px)",
                  display: "flex",
                  overflow: entry.type === "offline" ? "hidden" : "visible",
                  position: entry.type === "offline" ? "relative" : "unset",
                }}
              >
                { index === 0 && <DayTab />}
                { entry.type === "offline" ? (
                  <CardContent 
                    sx={{ 
                      p: 2, 
                      "&:last-child": { pb: 2 },
                      position: "relative",
                      minHeight: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Repeating OFFLINE pattern background */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -70,
                        left: -90,
                        right: -400,
                        bottom: -60,
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        transform: "rotate(12deg)",
                        opacity: 0.3,
                        pointerEvents: "none",
                        overflow: "hidden",
                      }}
                    >
                      {/* Create multiple rows of OFFLINE text */}
                      {Array.from({ length: 8 }).map((_, rowIndex) => (
                        <Box
                          key={rowIndex}
                          sx={{
                            display: "flex",
                            gap: "10px",
                            whiteSpace: "nowrap",
                            transform: rowIndex % 2 === 0 ? "translateX(0)" : "translateX(-60px)",
                          }}
                        >
                          {Array.from({ length: 12 }).map((_, colIndex) => (
                            <Typography
                              key={colIndex}
                              className="poetsen-one-font"
                              sx={{
                                color: "white",
                                fontSize: "1.5rem",
                                letterSpacing: "0.1em",
                                userSelect: "none",
                              }}
                            >
                              {entry.offlineText}
                            </Typography>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                ) : (
                  <CardContent sx={{ p: "6px 8px", "&:last-child": { pb: 1 }, width: "100%", overflow: "visible", paddingLeft: index === 1 ? "20px" : "8px" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignSelf: "center", flex: 1, mr: 2 }}>
                        <Typography variant="body1"
                          className="titan-one-font"
                          sx={{ 
                            fontSize: "0.9rem",
                            color: entry.memberOnly ? currentTheme.colors.textSecondary : currentTheme.colors.textPrimary, mb: 0.5 
                          }}
                        >
                          {entry.title}
                        </Typography>
                        <Typography variant="body2" 
                          className="lilita-one-font"
                          sx={{ 
                            fontSize: "0.85rem",
                            color: entry.memberOnly ? currentTheme.colors.textSecondary : currentTheme.colors.textPrimary, mb: 1, display: "block" 
                          }}
                        >
                          {entry.subtitle}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                        {renderTimeBadges(entry, dayIndex)}
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", position: "absolute", bottom: -20, mb: 1 }}>
                      {renderActivityTags(entry)}
                    </Box>
                  </CardContent>
                )}
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  // Determine layout order based on schedule position
  const isScheduleOnLeft = scheduleData.schedulePosition === "left";

  const renderImageSection = () => (
    <Box
      sx={{
        width: 680,
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {!scheduleData.backgroundImage && (
        <Box sx={{ textAlign: "center", color: "rgba(255, 255, 255, 0.8)" }}>
          <Typography variant="h2" sx={{ fontSize: "4rem", mb: 2 }}>
            <InsertPhoto sx={{ width: "2em", height: "2em", opacity: "90%" }} />
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Upload your image
          </Typography>
          <Typography variant="subtitle1">in the Editor tab</Typography>
        </Box>
      )}
      {scheduleData.backgroundImage && !scheduleData.transparentBackground ? (
        <Box
          component="img"
          src={scheduleData.backgroundImage}
          alt="Character/Avatar"
          sx={{
            position: "absolute",
            maxWidth: "none",
            userSelect: "none",
            ...getImageTransformStyle(),
          }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
      ) : (
        <></>
      )}

      {/* Artist Credit and Social Media */}
      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Artist Credit */}
        <Box
          sx={{
            bgcolor: currentTheme.colors.primary,
            color: "white",
            px: 2,
            py: 1,
            fontSize: "0.75rem",
            alignSelf: "flex-start",
            fontFamily: "PoetsenOne, sans-serif",
            height: "32px",
            position: "relative",
            '::after': {
              content: '""',
              position: "absolute",
              height: "32px",
              width: 0,
              top: 0,
              right: "-15px",
              borderBottom: "16px solid transparent",
              borderLeft: `16px solid ${currentTheme.colors.primary}`,
              borderTop: "16px solid transparent",
            }
          }}
        >
          {scheduleData.showArtist ? scheduleData.artistName : ""}
        </Box>

        {/* Social Media Handles */}
        {scheduleData.socialMediaHandles.filter((handle) => handle.enabled && handle.handle.trim()).length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              maxWidth: "100%",
            }}
          >
            {scheduleData.socialMediaHandles
              .filter((handle) => handle.enabled && handle.handle.trim())
              .map((handle) => {
                const IconComponent = getPlatformIcon(handle.platform);
                return (
                  <Box
                    key={handle.id}
                    sx={{
                      bgcolor: currentTheme.colors.cardBackground,
                      color: currentTheme.colors.textPrimary,
                      px: 1.5,
                      borderRadius: 2,
                      fontSize: "0.625rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      backdropFilter: "blur(2px)",
                      border: `2px solid ${currentTheme.colors.cardBorder}`,
                      height: "24px",
                    }}
                  >
                    <IconComponent sx={{ fontSize: 12 }} />
                    <Typography
                      className="poetsen-one-font"
                      variant="caption"
                      sx={{
                        fontSize: "0.625rem",
                        color: currentTheme.colors.textPrimary,
                      }}
                    >
                      {handle.handle}
                    </Typography>
                  </Box>
                )
              })}
          </Box>
        )}
      </Box>

      {/* Image Controls Button */}
      {scheduleData.backgroundImage && onImageTransformChange && !isExporting && !scheduleData.transparentBackground && (
        <IconButton
          data-testid="settings-icon"
          onClick={() => setShowImageControls(true)}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
          }}
        >
          <Settings />
        </IconButton>
      )}

      {/* Full-background Controls Button */}
      {scheduleData.backgroundImage && !isExporting && scheduleData.transparentBackground && (
        <IconButton
          data-testid="settings-icon"
          onClick={() => setShowBackgroundControls(true)}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
          }}
        >
          <Settings />
        </IconButton>
      )}
    </Box>
  );

  const renderScheduleSection = () => {
    const sectionBg = `radial-gradient(circle, ${currentTheme.colors.bgColor1} 3px, transparent 3px), radial-gradient(circle, ${currentTheme.colors.bgColor2} 3px, transparent 3px), radial-gradient(circle, ${currentTheme.colors.bgColor2} 3px, transparent 3px), radial-gradient(circle, ${currentTheme.colors.bgColor1} 3px, transparent 3px)`;

    return (
      <Box
        sx={{
          flex: 1,
          backgroundColor: scheduleData.transparentBackground ? "transparent" : currentTheme.colors.surfaceBackground,
          backgroundImage: scheduleData.transparentBackground ? "none" : sectionBg,
          backgroundSize: "60px 60px",
          backgroundPosition: "0 0, 30px 0, 15px 30px, 45px 30px",
          backgroundBlendMode: isDarkMode ? "normal" : "hard-light",
          padding: "24px 30px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h3"
            className="titan-one-font"
            sx={{
              fontSize: "2.8rem",
              fontWeight: 800,
              color: currentTheme.colors.primary,
              display: "flex",
              alignItems: "center",
              WebkitTextStroke: "0.8px white",
              px: 1.5,
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.75)",
            }}
          >
            {scheduleData.scheduleTitle}
          </Typography>
        </Box>
        {/* Week Range */}
        <Box sx={{
          position: "absolute",
          top: 0,
          right: scheduleData.schedulePosition === "left" ? 16 : "auto",
          left: scheduleData.schedulePosition === "right" ? 16 : "auto",
          backgroundColor: currentTheme.colors.primary,
          padding: "12px 18px",
          borderRadius: "0 0 25px 25px",
        }}>
          <Typography 
            variant="body1" 
            className="titan-one-font"
            sx={{ 
              color: "white",
            }}
          >
            {`${formatDate(scheduleData.startDate)} - ${formatDate(scheduleData.endDate)}`}
          </Typography>
        </Box>

        {/* Schedule Days */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
          {DAYS.map((day, index) => {
            const dayEntries = scheduleData.schedule[day] || [];
            const dayDate = weekDates[index] || (index + 1).toString().padStart(2, "0");

            return <Box key={day}>{renderDayContent(dayEntries, index, day, dayDate)}</Box>;
          })}
        </Box>
      </Box>
    )
  };

  return (
    <Box sx={{ position: "relative" }}>
      {/* Main Schedule Container */}
      <Paper
        id="schedule-preview"
        elevation={3}
        sx={{
          width: 1600,
          height: 900,
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          position: "relative",
          ...(scheduleData.transparentBackground && scheduleData.backgroundImage
            ? getTransparentBackgroundStyle()
            : {
                background: `linear-gradient(135deg, #8da5cbff 0%, #142648ff 100%)`,
              }),
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Render sections based on layout */}
        {isScheduleOnLeft ? (
          <>
            {renderScheduleSection()}
            {renderImageSection()}
          </>
        ) : (
          <>
            {renderImageSection()}
            {renderScheduleSection()}
          </>
        )}

      </Paper>
      {/* Export Button */}
      {!isExporting && (
        <Button
          data-testid="export-button"
          variant="contained"
          startIcon={<Download />}
          onClick={() => setShowExportModal(true)}
          sx={{
            position: "absolute",
            left: scheduleData.schedulePosition === "right" ? 475 : "auto",
            right: scheduleData.schedulePosition === "left" ? 16 : "auto",
            bottom: 16,
            zIndex: 15,
            backgroundColor: currentTheme.colors.buttonColor,
            "&:hover": {
              backgroundColor: currentTheme.colors.buttonColorHover,
              transform: "translateY(-1px)",
            },
            color: "white",
            boxShadow: 3,
            transition: "all 0.2s",
          }}
        >
          Export Schedule
        </Button>
      )}

      {/* Small-background Controls Dialog */}
      {showImageControls && scheduleData.backgroundImage && onImageTransformChange && !isExporting && (
        <ImageControls
          mode="small-background"
          transform={scheduleData.imageTransform}
          onTransformChange={(t) => onImageTransformChange(t as ImageTransform)}
          onClose={() => setShowImageControls(false)}
          theme={currentTheme}
          title="Image Controls"
          description="Click and drag the image to reposition it, or use the controls above for precise adjustments."
          scheduleData={scheduleData}
        />
      )}

      {/* Full-background Controls Dialog */}
      {showBackgroundControls && scheduleData.transparentBackground && scheduleData.backgroundImage && !isExporting && (
        <ImageControls
          mode="full-background"
          transform={backgroundTransform}
          onTransformChange={(t) => setBackgroundTransform(t as BackgroundTransform)}
          onClose={() => setShowBackgroundControls(false)}
          theme={currentTheme}
          title="Background Controls"
          description="These controls adjust the schedule container's background image. Use the controls above for precise adjustments."
          scheduleData={scheduleData}
        />
      )}

      {/* Export Modal */}
      <ExportModal scheduleData={scheduleData} isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </Box>
  )
}

export default SchedulePreview;