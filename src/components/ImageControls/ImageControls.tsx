import type React from "react";
import { Box, Typography, IconButton, Slider, Button, TextField, Paper } from "@mui/material";
import {
  Close,
  RotateRight,
  RotateLeft,
  Flip,
  RestartAlt,
  DragIndicator,
} from "@mui/icons-material";
import type { ColorTheme } from "../../types/theme";
import type { ImageTransform, ScheduleData } from "../../types";
import { useCustomTheme } from "../../contexts/useCustomTheme";
import { useCallback, useEffect, useRef, useState } from "react";


interface BackgroundTransform {
  scale: number;
  positionX: number;
  positionY: number;
};

interface ImageControlsProps {
  mode: "small-background" | "full-background";
  transform: ImageTransform | BackgroundTransform;
  onTransformChange: (transform: ImageTransform | BackgroundTransform) => void;
  onClose: () => void;
  theme: ColorTheme;
  title: string;
  description: string;
  scheduleData: ScheduleData;
};

export const ImageControls: React.FC<ImageControlsProps> = ({
  mode,
  transform,
  onTransformChange,
  onClose,
  theme,
  title,
  description,
  scheduleData,
}) => {

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ 
    x: 195, //top
    y: scheduleData.schedulePosition === "left" ? "auto" : 960, //left
    z: scheduleData.schedulePosition === "left" ? 180 : "auto", //right
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const isSmallBackgroundMode = mode === "small-background";
  const characterTransform = transform as ImageTransform;
  const backgroundTransform = transform as BackgroundTransform;
  const { currentTheme, isDarkMode } = useCustomTheme();


  // Dragging handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newTop = e.clientY - dragStart.y;
    const newLeft = e.clientX - dragStart.x;
    const newRight = window.innerWidth - (e.clientX - dragStart.x) - 350; // dialog width

    // Keep dialog within viewport bounds
    const maxTop = window.innerHeight - 560; // approximate dialog height
    const minTop = 0;
    const minLeft = 0;
    const maxLeft = window.innerWidth - 350;
    const minRight = 0;

    const boundedTop = Math.max(minTop, Math.min(newTop, maxTop))

    // Determine which side to position based on current layout and mouse position
    const isScheduleOnLeft = scheduleData.schedulePosition === "left";
    const screenCenter = window.innerWidth / 2;
    const mouseOnLeftSide = e.clientX < screenCenter;

    if (isScheduleOnLeft) {
      // Schedule on left, image on right - prefer right positioning
      if (mouseOnLeftSide && newRight >= minRight) {
        // Mouse on left side, use right positioning if there's space
        setPosition({
          x: boundedTop,
          y: "auto",
          z: Math.max(minRight, newRight),
        });
      } else {
        // Use left positioning
        const boundedLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
        setPosition({
          x: boundedTop,
          y: boundedLeft,
          z: "auto",
        });
      }
    } else {
      // Schedule on right, image on left - prefer left positioning
      if (!mouseOnLeftSide && newLeft >= minLeft && newLeft <= maxLeft) {
        // Mouse on right side, use left positioning if there's space
        setPosition({
          x: boundedTop,
          y: Math.max(minLeft, Math.min(newLeft, maxLeft)),
          z: "auto",
        });
      } else {
        // Use right positioning
        setPosition({
          x: boundedTop,
          y: "auto",
          z: Math.max(minRight, newRight),
        });
      }
    }
  }, [isDragging, dragStart.x, dragStart.y, scheduleData.schedulePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Update the dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dialogRef.current) return;

    setIsDragging(true);
    const rect = dialogRef.current.getBoundingClientRect()
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    // Prevent text selection while dragging
    e.preventDefault()
  };

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Scale handlers (both modes)
  const handleScaleChange = (_event: Event, newValue: number | number[]) => {
    if (isSmallBackgroundMode) {
      onTransformChange({
        ...characterTransform,
        scale: newValue as number,
      })
    } else {
      onTransformChange({
        ...backgroundTransform,
        scale: newValue as number,
      })
    }
  };

  // Position handlers (different for each mode)
  const handlePositionChange = (axis: "x" | "y", value: number) => {
    if (isSmallBackgroundMode) {
      onTransformChange({
        ...characterTransform,
        [axis]: value,
      })
    } else {
      // Full-background mode uses percentages
      const key = axis === "x" ? "positionX" : "positionY"
      onTransformChange({
        ...backgroundTransform,
        [key]: value,
      })
    }
  };

  // Small-background handlers
  const handleRotationChange = (_event: Event, newValue: number | number[]) => {
    if (!isSmallBackgroundMode) return
    onTransformChange({
      ...characterTransform,
      rotation: newValue as number,
    })
  };

  const handleRotate = (degrees: number) => {
    if (!isSmallBackgroundMode) return
    onTransformChange({
      ...characterTransform,
      rotation: (characterTransform.rotation + degrees) % 360,
    })
  };

  const handleFlip = (axis: "x" | "y") => {
    if (!isSmallBackgroundMode) return
    if (axis === "x") {
      onTransformChange({
        ...characterTransform,
        flipX: !characterTransform.flipX,
      })
    } else {
      onTransformChange({
        ...characterTransform,
        flipY: !characterTransform.flipY,
      })
    }
  };

  // Reset handlers (different for each mode)
  const handleReset = () => {
    if (isSmallBackgroundMode) {
      onTransformChange({
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
      })
    } else {
      onTransformChange({
        scale: 1,
        positionX: 50,
        positionY: 50,
      })
    }
  };

  // Full-background preset handlers
  const handleBackgroundPreset = (positionX: number, positionY: number) => {
    if (isSmallBackgroundMode) return
    onTransformChange({
      ...backgroundTransform,
      positionX,
      positionY,
    })
  };

  return (
    <Paper
      ref={dialogRef}
      data-testid="image-controls"
      elevation={8}
      sx={{
        position: "fixed",
        top: position.x,
        left: position.y !== "auto" ? position.y : undefined,
        right: position.z !== "auto" ? position.z : undefined,
        zIndex: 20,
        width: 350,
        bgcolor: isDarkMode ? currentTheme.colors.surfaceBackground : "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(2px)",
        borderRadius: 2,
        p: 2,
        overflow: "visible",
        cursor: isDragging ? "grabbing" : "default",
        transition: isDragging ? "none" : "all 0.2s ease",
      }}
    >
      {/* Header */}
      <Box 
        onMouseDown={handleMouseDown}
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DragIndicator
            sx={{
              color: theme.colors.primary,
              fontSize: 20,
              opacity: 0.7,
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, pt: 1 }}>

        {/* Scale Control (both modes) */}
        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom sx={{ fontWeight: 500 }}>
            Scale: {(isSmallBackgroundMode ? characterTransform.scale : backgroundTransform.scale).toFixed(2)}x
          </Typography>
          <Slider
            value={isSmallBackgroundMode ? characterTransform.scale : backgroundTransform.scale}
            onChange={handleScaleChange}
            min={isSmallBackgroundMode ? 0.1 : 0.5}
            max={3}
            step={0.1}
            sx={{ color: theme.colors.primary }}
          />
        </Box>

        {/* Rotation Control (Small-background mode only) */}
        {isSmallBackgroundMode && (
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom sx={{ fontWeight: 500 }}>
              Rotation: {characterTransform.rotation}°
            </Typography>
            <Slider
              value={characterTransform.rotation}
              onChange={handleRotationChange}
              min={0}
              max={360}
              step={1}
              sx={{ color: theme.colors.primary }}
            />
          </Box>
        )}

        {/* Quick Actions (Small-background mode only) */}
        {isSmallBackgroundMode && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, mb: 3 }}>
            <Button variant="outlined" startIcon={<RotateRight />} onClick={() => handleRotate(90)} size="small">
              90°
            </Button>
            <Button variant="outlined" startIcon={<RotateLeft />} onClick={() => handleRotate(-90)} size="small">
              -90°
            </Button>
            <Button variant="outlined" startIcon={<Flip />} onClick={() => handleFlip("x")} size="small">
              Flip H
            </Button>
            <Button variant="outlined" startIcon={<Flip sx={{ transform: "rotate(90deg)" }}/>} onClick={() => handleFlip("y")} size="small">
              Flip V
            </Button>
          </Box>
        )}

        {/* Position Controls */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              {isSmallBackgroundMode ? "X Position" : "Horizontal Position"}
            </Typography>
            <TextField
              type="number"
              value={isSmallBackgroundMode ? Math.round(characterTransform.x) : Math.round(backgroundTransform.positionX)}
              onChange={(e) => handlePositionChange("x", Number(e.target.value) || 0)}
              size="small"
              fullWidth
              inputProps={{
                min: isSmallBackgroundMode ? -1000 : 0,
                max: isSmallBackgroundMode ? 1000 : 100,
              }}
              InputProps={{
                endAdornment: (
                  <Typography variant="caption" color="text.secondary">
                    {isSmallBackgroundMode ? "px" : "%"}
                  </Typography>
                ),
              }}
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              {isSmallBackgroundMode ? "Y Position" : "Vertical Position"}
            </Typography>
            <TextField
              type="number"
              value={isSmallBackgroundMode ? Math.round(characterTransform.y) : Math.round(backgroundTransform.positionY)}
              onChange={(e) => handlePositionChange("y", Number(e.target.value) || 0)}
              size="small"
              fullWidth
              inputProps={{
                min: isSmallBackgroundMode ? -1000 : 0,
                max: isSmallBackgroundMode ? 1000 : 100,
              }}
              InputProps={{
                endAdornment: (
                  <Typography variant="caption" color="text.secondary">
                    {isSmallBackgroundMode ? "px" : "%"}
                  </Typography>
                ),
              }}
            />
          </Box>
        </Box>

        {/* Full-background Position Presets (Full-background mode only) */}
        {!isSmallBackgroundMode && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1, mb: 3 }}>
            <Button variant="outlined" onClick={() => handleBackgroundPreset(0, 0)} size="small">
              Top Left
            </Button>
            <Button variant="outlined" onClick={() => handleBackgroundPreset(100, 0)} size="small">
              Top Right
            </Button>
            <Button variant="outlined" onClick={() => handleBackgroundPreset(50, 50)} size="small">
              Center
            </Button>
            <Button variant="outlined" onClick={() => handleBackgroundPreset(50, 100)} size="small">
              Bottom
            </Button>
          </Box>
        )}

        {/* Reset Button */}
        <Button
          variant="contained"
          color="error"
          fullWidth
          startIcon={<RestartAlt />}
          onClick={handleReset}
          sx={{ mb: 2 }}
          size="small"
        >
          {isSmallBackgroundMode ? "Reset All" : "Reset Background"}
        </Button>

        {/* Help Text */}
        <Box sx={{ bgcolor: isDarkMode ? currentTheme.colors.footerBackground : "grey.100", p: 1.5, borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
            💡 <strong>Tip:</strong> {description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
};
