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
import { 
  Background,
  BowIcon,
  ButtonIcon,
  Console,
  ConsoleTrans,
  DiscordIcon, 
  EyeBlueIcon,
  EyeRedIcon,
  TikTokIcon, 
  TwitchIcon, 
  TwitterIcon, 
  YoutubeIcon 
} from "../../assets/images";
import { ImageControls } from "../ImageControls/ImageControls";
import { 
  StyledActivityBox, 
  StyledEyeBox, 
  StyledBox, 
  StyledSmallBox, 
  StyledActivitySmallBox, 
  StyledActivityChip, 
  StyledImageContainerSecond, 
  StyledImageContainerFirst, 
  StyledImageContainerThird,
  StyledWeekRange 
} from "./SchedulePreview.style";


const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ABBREV = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const getPlatformIcon = (platform: string) => {
  const platformIcons: { [key: string]: any } = {
    YouTube: () => <Box paddingTop="6px"><img src={YoutubeIcon} alt="YouTube" width="30" height="30" /></Box>,
    Twitch: () => <Box paddingTop="6px"><img src={TwitchIcon} alt="Twitch" width="30" height="30" /></Box>,
    Twitter: () => <Box paddingTop="6px"><img src={TwitterIcon} alt="Twitter" width="30" height="30" /></Box>,
    Discord: () => <Box paddingTop="6px"><img src={DiscordIcon} alt="Discord" width="30" height="30" /></Box>,
    TikTok: () => <Box paddingTop="6px"><img src={TikTokIcon} alt="TikTok" width="30" height="30" /></Box>,
    Other: () => <Box paddingTop="6px"><img src={BowIcon} alt="Other" height="20" /></Box>,
  };

  return platformIcons[platform];
};

// Enhanced timezone conversion helper with day difference calculation
const convertTimeWithDayDiff = (time: string, fromTz: string, toTz: string): { time: string; dayDiff: number } => {
  const timezoneOffsets: { [key: string]: number } = {
    pst: -8, // UTC-8
    pdt: -7, // UTC-7
    cst: -6, // UTC-6
    est: -5, // UTC-5
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
  onBackgroundTransformChange,
  isExporting = false 
}) => {
  const { currentTheme } = useCustomTheme();
  const [showImageControls, setShowImageControls] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBackgroundControls, setShowBackgroundControls] = useState(false);

  // Background handlers
  const [isDraggingBackground, setIsDraggingBackground] = useState(false);
  const [backgroundDragStart, setBackgroundDragStart] = useState({ x: 0, y: 0 });

  console.log('~ scheduleData', scheduleData);


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
    const { x, y, scale, rotation, flipX, flipY } = scheduleData.imageTransform;
    const scaleX = flipX ? -scale : scale;
    const scaleY = flipY ? -scale : scale;
    return {
      transform: `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`,
      transformOrigin: "center center",
      cursor: isDragging ? "grabbing" : scheduleData.smallImage ? "grab" : "default",
    };
  };

  const getBackgroundStyle = () => {
    if (!scheduleData.backgroundImage) {
      return {};
    }
    const { positionX, positionY, scale } = scheduleData.backgroundTransform;

    return {
      backgroundImage: `url(${scheduleData.backgroundImage})`,
      backgroundSize: `${scale * 100}%`,
      backgroundPosition: `${positionX}% ${positionY}%`,
      backgroundRepeat: "no-repeat",
      cursor: isDraggingBackground ? "grabbing" : "grab",
      transition: isDraggingBackground ? "none" : "background-position 0.1s ease-out",
    };
  };

  // Small-background control handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scheduleData.smallImage || !onImageTransformChange || isExporting) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - scheduleData.imageTransform.x,
      y: e.clientY - scheduleData.imageTransform.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scheduleData.smallImage || !onImageTransformChange || isExporting) return;
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

  // Full-background dragging handlers
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (!scheduleData.backgroundImage || isExporting) 
      return;
    e.preventDefault();
    setIsDraggingBackground(true);

    setBackgroundDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleBackgroundMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBackground || !scheduleData.backgroundImage || !onBackgroundTransformChange || isExporting)
      return;

    const rect = e.currentTarget.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Calculate mouse movement delta
    const deltaX = e.clientX - backgroundDragStart.x;
    const deltaY = e.clientY - backgroundDragStart.y;

    // Use a base sensitivity that feels natural, then adjust for scale
    const baseSensitivity = 1; // Increase this for faster movement
    const scaleAdjustment = Math.max(0.5, 1 / Math.sqrt(scheduleData.backgroundTransform.scale)); // Smoother scale compensation

    let percentageChangeX = (deltaX / containerWidth) * 100 * baseSensitivity * scaleAdjustment;
    let percentageChangeY = (deltaY / containerHeight) * 100 * baseSensitivity * scaleAdjustment;

    // Invert movement when scale > 1 (CSS background-position behavior)
    if (scheduleData.backgroundTransform.scale > 1) {
      percentageChangeX = -percentageChangeX;
      percentageChangeY = -percentageChangeY;
    }

    // Calculate new position based on the initial position when drag started
    const newX = scheduleData.backgroundTransform.positionX + percentageChangeX;
    const newY = scheduleData.backgroundTransform.positionY + percentageChangeY;

    onBackgroundTransformChange({
      ...scheduleData.backgroundTransform,
      positionX: newX,
      positionY: newY,
    });
     // Update drag start position for next frame
    setBackgroundDragStart({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleBackgroundMouseUp = () => {
    setIsDraggingBackground(false);
  };

  // Activity entry handlers
  const renderActivityTags = (entry: any) => {
    const tags: any[] = [];
    const ActivityChip = (label: string) => (
      tags.push(
        <StyledActivityChip
          key={label}
          label={label.toUpperCase()}
          size="small"
          className="retro-computer-font activity-chip"
        />,
      )
    );

    if (entry.tags?.collab) {
      ActivityChip("collab");
    } 
    if (entry.tags?.announcement) {
      ActivityChip("announcement");
    }
    if (entry.tags?.custom && entry.tags?.customText && entry.tags.customText.trim()) {
      ActivityChip(entry.tags.customText);
    }

    return tags;
  }

  const renderTimeBadges = (entry: any, dayIndex: number, smallCard?: boolean) => {
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
              <Typography className="poetsen-one-font" variant="caption" sx={{ fontSize: smallCard ? "10px" : "12px" }}>
                {formatTime(timeData.time)} ({timezone.abbreviation.toUpperCase()})
              </Typography>
              {dayIndicator && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: smallCard ? "8px" : "10px",
                    fontWeight: 700,
                    opacity: 1,
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

    const getActualDayAbbrev = (dayIndex: number) => {
      if (!scheduleData.startDate) return DAY_ABBREV[dayIndex];
      try {
        const startDate = parseISO(scheduleData.startDate);
        const currentDate = addDays(startDate, dayIndex);
        const dayOfWeek = currentDate.getDay();
        const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return DAY_ABBREV[adjustedIndex];
      } catch {
        return DAY_ABBREV[dayIndex];
      }
    };

    const DayAbbreviationChip = ({ dayIndex }: { dayIndex: number }) => (
      <Chip
        label={getActualDayAbbrev(dayIndex)}
        size="small"
        className="retro-computer-font"
        sx={{
          bgcolor: currentTheme.colors.primarySet?.[dayIndex % (currentTheme.colors.primarySet.length || 1)] || currentTheme.colors.primary,
          color: currentTheme.colors.textSet?.[dayIndex % (currentTheme.colors.textSet.length || 1)] || "white",
          border: `2px solid ${currentTheme.colors.cardBorder}`,
          fontSize: "0.8rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          zIndex: 1,
          rotate: "-20deg",
          marginLeft: "-10px",
          marginTop: "-5px",
          height: "30px",
          width: "60px"
        }}
      />
    );

    const DayTab = ({ dayIndex }: { dayIndex: number }) => {
      if (dayIndex === 6) {
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 85,
              position: "absolute",
              alignSelf: "center",
              zIndex: 200,
            }}
          >
            <Paper
              sx={{
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: currentTheme.colors.primarySet,
                borderRadius: 2,
                border: `2.5px solid ${cardBorderColor}`,
                backdropFilter: "blur(2px)",
              }}
            >
              <Typography
                className="retro-computer-font"
                sx={{
                  color: "#E5E5E5",
                  textAlign: "center",
                  fontSize: "18px",
                  lineHeight: "20px",
                }}
              >
                {getActualDayAbbrev(dayIndex)}<br />
                {dayDate}
              </Typography>
            </Paper>
          </Box>
        );
      } else {
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 85,
              position: "absolute",
              alignSelf: "center",
              zIndex: 200,
              top: -5,
              left: 88,
            }}
          >
            <Paper
              sx={{
                width: 120,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: currentTheme.colors.primarySet,
                borderTop: "none",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
                border: `2.5px solid ${cardBorderColor}`,
                backdropFilter: "blur(2px)",
              }}
            >
              <Typography
                className="retro-computer-font"
                sx={{
                  color: "#E5E5E5",
                  textAlign: "center",
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                {getActualDayAbbrev(dayIndex)} • {dayDate}
              </Typography>
            </Paper>
          </Box>
        );
      }
    };

    const OfflineCard = (text: string) => {
      if (dayIndex === 6) {
        return (
          <Box 
            sx={{ 
              display: "flex", margin: "8px 0", 
              height: "120px", 
              width: "960px",
              }}
          >
            <DayAbbreviationChip dayIndex={dayIndex} />
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: 2, 
                zIndex: 0,
                position: "absolute",
                width: "960px"
              }}
            >
              <img
                src={BowIcon}
                alt="Bow Icon"
                style={{
                  position: "absolute",
                  zIndex: 100,
                  top: 44,
                  right: 332
                }}
              />
              <StyledEyeBox className="blue-eye"
                sx={{ 
                  left: -15,
                  bottom: -20
                }}
              >
                <img src={EyeBlueIcon} alt="Blue Eye" />
              </StyledEyeBox>
              <img src={ButtonIcon} alt="Button Icon"
                style={{
                  position: "absolute",
                  zIndex: 100,
                  top: 56,
                  left: 32,
                  transform: "rotate(90deg)"
                }}
               />
              <StyledBox className="halftone">
                <div className="inner-halftone">
                  {text ? (
                    <>
                      <Typography
                        className="retro-computer-font"
                        sx={{ display: "flex", alignItems: "center", fontSize: "26px", gap: 2 }}
                      >
                        <span style={{ fontSize: "14px", letterSpacing: "4px" }}>
                          • VICTORIA IS •
                        </span>{text}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography className="retro-computer-font" sx={{ fontSize: "30px" }}>
                        NO ACTIVITIES
                      </Typography>
                    </>
                  )}
                </div>
              </StyledBox>
              <Box
                sx={{
                  position: "absolute",
                  right: 45,
                  bottom: 12,
                  zIndex: 50,
                }}
              >
                <img 
                  src={ConsoleTrans} 
                  alt="Console Trans Background" 
                  style={{ 
                    display: "flex",
                    height: "100%",
                    width: "100%"
                  }} 
                />
              </Box>
              <Card
                sx={{
                  flex: 1,
                  bgcolor: cardBgColor,
                  borderRadius: 4,
                  border: `1px solid ${cardBorderColor}`,
                  height: 120,
                  backdropFilter: "blur(2px)",
                  display: "flex",
                }}
              >
                {/* <DayTab /> */}
                <Box
                  sx={{
                    position: "absolute",
                    right:-60,
                    top: 0,
                    bottom: -2,
                    zIndex: 90,
                    backgroundColor: cardBgColor
                  }}
                >
                  <img 
                    src={Background} 
                    alt="Offline Card Background" 
                    style={{ 
                      display: "flex",
                      height: "98%",
                      width: "98%"
                    }} 
                  />
                </Box>
              </Card>
            </Box>
          </Box>
        );
      } else {
        return (
          <Box 
            sx={{ 
              display: "flex", margin: "8px 0", 
              height: "300px", 
              width:"300px" 
              }}
          >
            <DayAbbreviationChip dayIndex={dayIndex} />
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: 2, 
                zIndex: 0,
                position: "absolute",
                width: "300px",
              }}
            >
              <img
                src={BowIcon}
                alt="Bow Icon"
                style={{
                  position: "absolute",
                  zIndex: 100,
                  left: 126,
                  bottom: 72,
                  transform: "rotate(2deg)"
                }}
              />
              <StyledEyeBox className="blue-eye"
                sx={{ 
                  left: -20,
                  bottom: 115,
                }}
              >
                <img src={EyeBlueIcon} alt="Blue Eye" />
              </StyledEyeBox>
              <Card
                sx={{
                  flex: 1,
                  bgcolor: cardBgColor,
                  borderRadius: "18px",
                  border: `3px solid ${cardBorderColor}`,
                  height: 300,
                  backdropFilter: "blur(2px)",
                  display: "flex",
                  transform: "rotate(2deg)"
                }}
              >
                {/* <DayTab /> */}
                
                <CardContent sx={{ display: "flex", p: 0, "&:last-child": { pb: 0 } }}>
                  <img src={ButtonIcon} alt="Button Icon"
                    style={{
                      position: "absolute",
                      zIndex: 100,
                      top: 32,
                      left: 134,
                    }}
                  />
                  <StyledSmallBox className="halftone-small-box">
                    <div className="inner-halftone-small-box">
                      {text ? (
                        <>
                          <Typography 
                            className="retro-computer-font"
                            sx={{ fontSize: "12px", letterSpacing: "4px" }}
                          >
                            • VICTORIA IS •
                          </Typography>
                          <Typography 
                            className="retro-computer-font" 
                            sx={{ fontSize: "24px" }}
                          >
                            {text}
                          </Typography>
                        </>
                      ) : (
                        <Typography 
                          className="retro-computer-font" 
                          sx={{ fontSize: "24px" }}
                        >
                          NO ACTIVITIES
                        </Typography>
                      )}
                      <div style={{ height: "40px", width: "80px", textAlign: "center" }}>
                        <Typography
                          className="fredoka-regular-font"
                          sx={{ fontSize: "12px", opacity: 0.5 }}
                        >
                          / / / /
                        </Typography>
                      </div>
                    </div>
                    <div className="inner-pattern-small-box"></div>
                  </StyledSmallBox>
                  <Box>
                    <img 
                      src={Console} 
                      alt="Offline Card" 
                      style={{ 
                        position: "absolute",
                        left: 1,
                        bottom: 0,
                        width: "295px",
                        zIndex: 100,
                      }} 
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
      }
    };

    const ActivityCard = (entryData: any, multiple: boolean) => {
      const Divider = ({ rotate, width }: { rotate: string, width: string }) => {
        return (
          <div style={{ rotate: rotate, height: "40px", width: width, textAlign: "center" }}>
            <Typography
              className="fredoka-regular-font"
              sx={{ fontSize: "14px", opacity: 0.5 }}
            >
              / / / /
            </Typography>
          </div>
        );
      };
      if (dayIndex === 6) {
        return (
          <Box 
            sx={{ 
              display: "flex", margin: "8px 0", 
              height: "120px", 
              width: "960px",
              }}
          >
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: 2, 
                zIndex: 0,
                position: "absolute",
                width: "960px"
              }}
            >
              <StyledActivityBox className="halftone-activity">
                <Box className="inner-halftone-activity">
                  {multiple ? (
                    <>
                      {entryData.slice(0, 2).map((entry: any) => (
                        <Box sx={{ display: "flex", flex: 1, gap: 2 }}>
                          <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Divider rotate="90deg" width={entry.subtitle ? "50px" : "104px"} />
                            <Box>
                              <Typography
                                className="fredoka-medium-font"
                                variant="h3"
                                sx={{ fontSize: "24px", lineHeight: 0.9 }}
                              >
                                {entry.title}
                              </Typography>

                              <Typography 
                                className="fredoka-medium-font"
                                variant="h6"
                                sx={{ fontSize: "14px", lineHeight: 1.2 }}>
                                {entry.subtitle}
                              </Typography>
                            </Box>
                          </Box>

                          <Box style={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-start" }}>
                              {renderTimeBadges(entry, dayIndex)}
                            </Box>
                          </Box>
                          <Box sx={{ 
                            display: "flex", 
                            flexWrap: "wrap", 
                            position: "absolute", bottom: -24,
                            paddingLeft: "15px",
                            filter: "drop-shadow(1px 0px 3px rgba(25, 25, 25, 0.45))"
                          }}>
                            {renderActivityTags(entry)}
                          </Box>
                        </Box>
                      ))}
                    </>
                  ) : (
                    <>
                      <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Divider rotate="90deg" width="80px" />
                        <Box>
                          <Typography
                            className="fredoka-medium-font"
                            variant="h3"
                            sx={{ fontSize: "36px", lineHeight: 0.9 }}
                          >
                            {entryData.title}
                          </Typography>

                          <Typography 
                            className="fredoka-medium-font"
                            variant="h6"
                            sx={{ fontSize: "16px" }}>
                            {entryData.subtitle}
                          </Typography>
                        </Box>
                      </Box>

                      <Box style={{ display: "flex", alignItems: "center" }}>
                        <Divider rotate="90deg" width="80px" />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "flex-start" }}>
                          {renderTimeBadges(entryData, dayIndex)}
                        </Box>
                      </Box>
                      <Box sx={{ 
                        display: "flex", 
                        flexWrap: "wrap", 
                        position: "absolute", bottom: -24,
                        paddingLeft: "15px",
                        filter: "drop-shadow(1px 0px 3px rgba(25, 25, 25, 0.45))"
                      }}>
                        {renderActivityTags(entryData)}
                      </Box>
                    </>
                  )}
                </Box>

              </StyledActivityBox>

              <StyledEyeBox className="red-eye"
                sx={{ 
                  top: -15,
                  right: 215,
                }}
              >
                <img src={EyeRedIcon} alt="Red Eye" />
              </StyledEyeBox>

              <DayTab dayIndex={dayIndex} />

              <Card
                sx={{
                  flex: 1,
                  bgcolor: cardBgColor,
                  borderRadius: 4,
                  border: `3px solid ${cardBorderColor}`,
                  height: 120,
                  backdropFilter: "blur(2px)",
                  display: "flex",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    right:-60,
                    top: 0,
                    bottom: -2,
                    zIndex: 90,
                    backgroundColor: cardBgColor
                  }}
                />
              </Card>
            </Box>
          </Box>
        );
      } else {
        return (
          <Box 
            sx={{ 
              display: "flex", margin: "8px 0", 
              height: "300px", 
              width:"300px" 
              }}
          >
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: 2, 
                zIndex: 0,
                position: "absolute",
                width: "300px",
              }}
            >
              <StyledEyeBox className="red-eye"
                sx={{ 
                  right: -20,
                  bottom: 50,
                }}
              >
                <img src={EyeRedIcon} alt="Red Eye" />
              </StyledEyeBox>
              {(Array.isArray(entryData) ? entryData : [entryData]).slice(0, 2).map((entry: any, index: number) => (
                <>
                  {multiple ? (
                    <Box sx={{ 
                      display: "flex",
                      position: "absolute",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      filter: "drop-shadow(1px 0px 3px rgba(25, 25, 25, 0.45))",
                      top: index === 0 ? 112 : 268,
                      right: -24,
                      zIndex: 200,
                      transform: "rotate(-4deg)"
                    }}>
                      {renderActivityTags(entry)}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: "flex",
                      position: "absolute",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      filter: "drop-shadow(1px 0px 3px rgba(25, 25, 25, 0.45))",
                      bottom: 8,
                      right: 14,
                      zIndex: 200,
                      transform: "rotate(-4deg)"
                    }}>
                      {renderActivityTags(entry)}
                    </Box>
                  )}
                </>
              ))}
              <Card
                sx={{
                  flex: 1,
                  bgcolor: cardBgColor,
                  borderRadius: 4,
                  border: `3px solid ${cardBorderColor}`,
                  height: 300,
                  backdropFilter: "blur(2px)",
                  display: "flex",
                  transform: "rotate(2deg)",
                  zIndex: 10
                }}
              >
                <DayTab dayIndex={dayIndex} />
                
                <CardContent sx={{ display: "flex", p: 0, "&:last-child": { pb: 0 } }}>
                  <StyledActivitySmallBox className="halftone-activity-small-box">
                    <Box className="inner-halftone-activity-small-box">
                      {multiple ? (
                        <>
                          {entryData.slice(0, 2).map((entry: any, index: number) => (
                            <Box>
                              <Box style={{ paddingTop: index === 0 ? "20px" : "0" }}>
                                <Typography
                                  className="fredoka-medium-font"
                                  sx={{ fontSize: "18px", lineHeight: 0.9 }}
                                >
                                  {entry.title}
                                </Typography>

                                <Typography 
                                  className="fredoka-medium-font"
                                  sx={{ fontSize: "12px", lineHeight: 1.2 }}>
                                  {entry.subtitle}
                                </Typography>
                              </Box>

                              <Box style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Box 
                                  sx={{ 
                                    display: "flex", 
                                    gap: "4px", 
                                    alignItems: "flex-start",
                                    flexWrap: "wrap",
                                    justifyContent: "center",
                                    marginTop: "4px",
                                    marginBottom: index === 1 ? "10px" : "0"
                                  }}
                                >
                                  {renderTimeBadges(entry, dayIndex, true)}
                                </Box>
                                {index === 0 && (
                                  <hr style={{
                                    margin: "10px 0",
                                    border: 0,
                                    width: "220px",
                                    height: "1.2px",
                                    backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))"
                                  }}/>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </>
                      ) : (
                        <>
                          <Box style={{ paddingTop: "20px" }}>
                            <Typography
                              className="fredoka-medium-font"
                              sx={{ fontSize: "26.5px", lineHeight: 0.9, marginBottom: "5px" }}
                            >
                              {entryData.title}
                            </Typography>

                            <Typography 
                              className="fredoka-medium-font"
                              sx={{ fontSize: "14px" }}>
                              {entryData.subtitle}
                            </Typography>
                          </Box>

                          <Box style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <hr style={{
                              marginBottom: "10px",
                              border: 0,
                              width: "220px",
                              height: "1.2px",
                              backgroundImage: "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))"
                            }}/>
                            <Box 
                              sx={{ 
                                display: "flex", 
                                gap: 0.8, 
                                alignItems: "flex-start",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                marginBottom: "4px"
                              }}
                            >
                              {renderTimeBadges(entryData, dayIndex)}
                            </Box>
                            <Divider rotate="0deg" width="80px" />
                          </Box>
                        </>
                      )}
                    </Box>
                  </StyledActivitySmallBox>
                </CardContent>
              </Card>
              <Card
                sx={{
                  flex: 1,
                  bgcolor: cardBgColor,
                  borderRadius: 4,
                  border: `3px solid ${cardBorderColor}`,
                  height: 300,
                  width: 300,
                  backdropFilter: "blur(2px)",
                  display: "flex",
                  transform: "rotate(-4deg)",
                  position: "absolute",
                  zIndex: 0
                }}
              >
                <CardContent sx={{ display: "flex", p: 0, "&:last-child": { pb: 0 } }}>
                  <StyledActivitySmallBox className="halftone-activity-small-box-behind" />
                </CardContent>
              </Card>
            </Box>
          </Box>
        );
      }
    };

    if (dayEntries.length === 0) {
      return OfflineCard("");
    }

    if (dayEntries.length === 1) {
      const entry = dayEntries[0]

      if (entry.type === "offline") {
        const offlineText = entry.offlineText || "OFFLINE";
        return OfflineCard(offlineText);
      }

      return ActivityCard(entry, false);
    }

    return ActivityCard(dayEntries, true);
  }

  // Determine layout order based on schedule position
  const isScheduleOnLeft = scheduleData.schedulePosition === "left";

  const renderImageSection = () => {
    return (
      <>
        <img
          src={BowIcon}
          alt="Bow Icon"
          style={{
            position: "absolute",
            zIndex: 50,
            left: 512,
            bottom: 400,
            transform: "rotate(2deg)",
            height: 34,
          }}
        />
        <StyledImageContainerFirst>
          <Box className="container-box-image">
            {!scheduleData.backgroundImage && !scheduleData.smallImage && (
              <Box sx={{ textAlign: "center", color: "#473c3a" }}>
                <Typography variant="h2" sx={{ fontSize: "4rem", mb: 2 }}>
                  <InsertPhoto sx={{ width: "2em", height: "2em", opacity: "90%" }} />
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Upload your image
                </Typography>
                <Typography variant="subtitle1">in the Editor tab</Typography>
              </Box>
            )}
            {scheduleData.smallImage ? (
              <Box
                component="img"
                src={scheduleData.smallImage}
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
                // <Box
                //   sx={{
                //     backgroundColor: "#F4E0DF"
                //   }}
                // >

                // </Box>
              // </Box>
            ) : (
              <></>
            )}

            {/* Image Controls Button */}
            {scheduleData.smallImage && onImageTransformChange && !isExporting && (
              <IconButton
                data-testid="settings-icon"
                onClick={() => setShowImageControls(true)}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                  zIndex: 100,
                }}
              >
                <Settings sx={{ color: "#473c3a" }}/>
              </IconButton>
            )}

            {/* Full-background Controls Button */}
            {scheduleData.backgroundImage && onBackgroundTransformChange && !isExporting && (
              <IconButton
                data-testid="settings-icon"
                onClick={() => setShowBackgroundControls(true)}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 32,
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                  zIndex: 100,
                }}
              >
                <Settings sx={{ color: "#473c3a" }}/>
              </IconButton>
            )}
          </Box>
        </StyledImageContainerFirst>
        <StyledImageContainerSecond>
          <Box className="container-box-dashed"></Box>
        </StyledImageContainerSecond>
        <StyledImageContainerThird>
          <Box className="container-box-dots"></Box>
        </StyledImageContainerThird>
      </>
    )
  };

  const renderSocialMedia = () => {
    return (
      <>
        {/* Artist Credit and Social Media */}
          <Box
            sx={{
              position: "absolute",
              bottom: 10,
              right: 30,
              display: "flex",
              flexDirection: "row",
              gap: 1.5,
            }}
          >
            {/* Artist Credit */}
            <Typography 
              className="fredoka-regular-font" 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                color: "rgba(244, 224, 223, 0.9)",
                fontSize: "20px",
              }}
            >
              ILLUST. {scheduleData.showArtist ? scheduleData.artistName : ""}
            </Typography>

            {/* Social Media Handles */}
            {scheduleData.socialMediaHandles.filter((handle) => handle.enabled && handle.handle.trim()).length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
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
                          display: "flex",
                          alignItems: "center",
                          gap: "10px"
                        }}
                      >
                        <IconComponent />
                        <Typography
                          className="fredoka-regular-font"
                          variant="caption"
                          sx={{ fontSize: "20px", color: "rgba(244, 224, 223, 0.9)" }}
                        >
                          {handle.handle}
                        </Typography>
                      </Box>
                    )
                  })}
              </Box>
            )}
          </Box>
      </>
    )
  };

  const renderScheduleSection = () => {
    // const sectionBg = `radial-gradient(circle, ${currentTheme.colors.bgColor1} 3px, transparent 3px), radial-gradient(circle, ${currentTheme.colors.bgColor2} 3px, transparent 3px), radial-gradient(circle, ${currentTheme.colors.bgColor2} 3px, transparent 3px), radial-gradient(circle, ${currentTheme.colors.bgColor1} 3px, transparent 3px)`;

    return (
      <Box
        sx={{
          flex: 1,
          // backgroundColor: scheduleData.transparentBackground ? "transparent" : currentTheme.colors.surfaceBackground,
          // backgroundImage: scheduleData.transparentBackground ? "none" : sectionBg,
          backgroundSize: "60px 60px",
          backgroundPosition: "0 0, 30px 0, 15px 30px, 45px 30px",
          padding: "20px 30px 40px 30px",
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
        <StyledWeekRange sx={{
          right: scheduleData.schedulePosition === "left" ? 16 : "auto",
          left: scheduleData.schedulePosition === "right" ? 16 : "auto",
          // backgroundColor: currentTheme.colors.primary,
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
        </StyledWeekRange>

        {/* Schedule Days */}
        <Box sx={{ flex: 1, display: "flex", flexWrap: "wrap", columnGap: 4 }}>
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
          ...(scheduleData.backgroundImage
            ? getBackgroundStyle()
            : {
                background: `linear-gradient(135deg, #8da5cbff 0%, #142648ff 100%)`,
              }),
        }}
        onMouseMove={(e) => {
          handleMouseMove(e); // Small-background dragging
          handleBackgroundMouseMove(e) // Full-background dragging
        }}
        onMouseUp={() => {
          handleMouseUp(); // Small-background dragging
          handleBackgroundMouseUp(); // Full-background dragging
        }}
        onMouseLeave={() => {
          handleMouseUp(); // Small-background dragging
          handleBackgroundMouseUp(); // Full-background dragging
        }}
        onMouseDown={(e) => {
          // Only handle background dragging if transparent background is enabled
          if (scheduleData.backgroundImage && !isExporting) {
            const target = e.target as HTMLElement;
            if (!target.closest('img') && !target.closest('button') && !target.closest('[data-testid]')) {
              handleBackgroundMouseDown(e);
            }
          }
        }}
      >
        {/* Render sections based on layout */}
        {isScheduleOnLeft ? (
          <Box sx={{
            // backgroundColor: scheduleData.transparentBackground ? "transparent" : currentTheme.colors.surfaceBackground,
            // backgroundImage: scheduleData.transparentBackground ? "none" : `radial-gradient(circle, ${currentTheme.colors.bgColor1} 3px, transparent 3px), radial-gradient(circle, ${currentTheme.colors.bgColor2} 3px, transparent 3px), radial-gradient(circle, ${currentTheme.colors.bgColor2} 3px, transparent 3px), radial-gradient(circle, ${currentTheme.colors.bgColor1} 3px, transparent 3px)`,
            backgroundColor: "transparent",
            backgroundImage: scheduleData.backgroundImage ? scheduleData.backgroundImage : "none",
          }}>
            <Box>
              {renderScheduleSection()}
              {renderSocialMedia()}
            </Box>
            <Box>
              {renderImageSection()}
            </Box>
          </Box>
        ) : (
          <>
            {renderImageSection()}
            {renderScheduleSection()}
            {renderSocialMedia()}
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
            bottom: 10,
            zIndex: 150,
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
          Export
        </Button>
      )}

      {/* Small-background Controls Dialog */}
      {showImageControls && scheduleData.smallImage && onImageTransformChange && !isExporting && (
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
      {showBackgroundControls && scheduleData.backgroundImage && onBackgroundTransformChange && !isExporting && (
        <ImageControls
          mode="full-background"
          transform={scheduleData.backgroundTransform}
          onTransformChange={(t) => onBackgroundTransformChange(t as BackgroundTransform)}
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