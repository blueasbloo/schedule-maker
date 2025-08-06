import type React from "react";
import { useState } from "react";
import { 
  Dialog, DialogTitle, Box, IconButton, 
  DialogContent, FormControl, InputLabel, 
  Select, MenuItem, Alert, Typography, 
  DialogActions, Button, CircularProgress 
} from "@mui/material";
import { toPng, toJpeg } from "html-to-image";
import type { ExportModalProps } from "../../types";
import { Close, Download } from "@mui/icons-material";
import { useCustomTheme } from "../../contexts/useCustomTheme";


const ExportModal: React.FC<ExportModalProps> = ({ scheduleData, isOpen, onClose }) => {
  const [exportFormat, setExportFormat] = useState("png");
  const [exportQuality, setExportQuality] = useState("high");
  const [isExporting, setIsExporting] = useState(false);
  const { currentTheme } = useCustomTheme();

  const exportSchedule = async () => {
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const element = document.getElementById("schedule-preview");
      if (!element) {
        throw new Error("Schedule preview not found. Please make sure the preview is visible.");
      }

      const elementsToHide = [
        '[data-testid="export-button"]',
        '[data-testid="image-controls"]',
        '[data-testid="settings-icon"]',
        "button[aria-label]", // Any buttons with aria-labels
        ".MuiIconButton-root", // All Material-UI icon buttons
      ];

      const hiddenElements: { element: HTMLElement; originalDisplay: string }[] = [];

      elementsToHide.forEach((selector) => {
        const elements = element.querySelectorAll(selector)
        elements.forEach((el) => {
          const htmlEl = el as HTMLElement
          hiddenElements.push({
            element: htmlEl,
            originalDisplay: htmlEl.style.display,
          })
          htmlEl.style.display = "none"
        })
      });

      const options = {
        width: 1600,
        height: 900,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        pixelRatio: exportQuality === "high" ? 1.2 : 1,
        backgroundColor: undefined,
        cacheBust: true,
        useCORS: true,
        allowTaint: true,
      };

      let dataUrl: string;

      if (exportFormat === "jpeg") {
        dataUrl = await toJpeg(element, { ...options, quality: 0.95 });
      } else {
        dataUrl = await toPng(element, options);
      }

      // Restore original display values
      hiddenElements.forEach(({ element: el, originalDisplay }) => {
        el.style.display = originalDisplay;
      })

      // Create download link
      const link = document.createElement("a")
      link.download = `stream-schedule-${scheduleData.startDate}-to-${scheduleData.endDate}.${exportFormat}`
      link.href = dataUrl
      link.click()

      // Close modal after successful export
      onClose()
    } catch (error) {
      console.error("Export failed:", error)
      alert(`Export failed: ${(error as Error).message}`)
    } finally {
      setIsExporting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: currentTheme.colors.surfaceBackground }}>
        <Box sx={{ display: "flex", fontSize: "1.5rem", alignItems: "center", gap: 1 }}>
          Export Schedule
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ backgroundColor: currentTheme.colors.surfaceBackground }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, my: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select value={exportFormat} label="Format" onChange={(e) => setExportFormat(e.target.value)}>
              <MenuItem value="png">PNG</MenuItem>
              <MenuItem value="jpeg">JPEG</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Quality</InputLabel>
            <Select value={exportQuality} label="Quality" onChange={(e) => setExportQuality(e.target.value)}>
              <MenuItem value="standard">Standard (1600x900)</MenuItem>
              <MenuItem value="high">High (1920x1080)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Alert severity="info" sx={{ mb: 1, backgroundColor: currentTheme.colors.footerBackground }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            Export Preview
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Your schedule will be exported as a {exportFormat.toUpperCase()} file with {exportQuality} quality at 16:9
            aspect ratio {exportQuality === "high" ? "(1920x1080)" : "(1600x900)"}.
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
            Filename: stream-schedule-{scheduleData.startDate}-to-{scheduleData.endDate}.{exportFormat}
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, mb: 1, backgroundColor: currentTheme.colors.surfaceBackground }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={exportSchedule}
          variant="contained"
          disabled={isExporting}
          startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <Download />}
        >
          {isExporting ? "Exporting..." : "Export Schedule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExportModal;