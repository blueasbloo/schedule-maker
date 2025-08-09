/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { 
  AppContainer,
  PreviewContainer,
  HiddenPreview,
  AppWrapper,
} from "./App.style";
import SchedulePreview from "./components/SchedulePreview/SchedulePreview";
import ScheduleEditor from "./components/ScheduleEditor/ScheduleEditor";
import Footer from "./components/Footer/Footer";
import type { BackgroundTransform, ImageTransform, ScheduleData, TabPanelProps } from "./types";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Box, Container, createTheme, CssBaseline, ThemeProvider as MuiThemeProvider, Tab, Tabs } from "@mui/material";
import { Settings, Visibility } from "@mui/icons-material";
import { useCustomTheme } from "./contexts/useCustomTheme";


const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
};


const AppContent = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    startDate: "",
    endDate: "",
    timezone: "PST",
    timezones: [
      { id: "est", label: "Eastern Standard Time", abbreviation: "EST", enabled: true },
      { id: "cest", label: "Central European Summer Time", abbreviation: "CEST", enabled: true },
      { id: "jst", label: "Japan Standard Time", abbreviation: "JST", enabled: true },
    ],
    artistName: "artist name",
    showArtist: true,
    socialMediaHandles: [
      { id: "1", platform: "YouTube", handle: "@username", enabled: false },
      { id: "2", platform: "Twitch", handle: "@username", enabled: false },
      { id: "3", platform: "Twitter", handle: "@username", enabled: false },
    ],
    schedule: {},
    scheduleTitle: "SCHEDULE",
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
    transparentBackground: false,
    schedulePosition: "right"
  });

  const [activeTab, setActiveTab] = useState(0);
  const { currentTheme, isDarkMode } = useCustomTheme();

  const muiTheme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: currentTheme.colors.primary,
      },
      secondary: {
        main: currentTheme.colors.secondary,
      },
      background: {
        default: currentTheme.colors.surfaceBackground,
        paper: currentTheme.colors.surfaceBackground,
      },
      text: {
        primary: currentTheme.colors.surfaceText,
      },
    },
  });

  // Initialize with current week
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    setScheduleData((prev: any) => ({
      ...prev,
      startDate: startOfWeek.toISOString().split("T")[0],
      endDate: endOfWeek.toISOString().split("T")[0],
    }))
  }, [])

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setScheduleData((prev: any) => ({
        ...prev,
        backgroundImage: e.target?.result as string,
        imageTransform: {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          flipX: false,
          flipY: false,
        },
      }))
    }
    reader.readAsDataURL(file)
  };

  const handleImageTransformChange = (transform: ImageTransform) => {
    setScheduleData((prev) => ({
      ...prev,
      imageTransform: transform,
    }))
  };
  const handleBackgroundTransformChange = (transform: BackgroundTransform) => {
    setScheduleData((prev) => ({
      ...prev,
      backgroundTransform: transform,
    }))
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />

      <AppWrapper>
        <AppContainer>
          <Container maxWidth="xl">
            <Box>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "1rem",
                    },
                  }}
                >
                  <Tab
                    icon={<Settings />}
                    iconPosition="start"
                    label="Editor"
                    id="schedule-tab-0"
                    aria-controls="schedule-tabpanel-0"
                  />
                  <Tab
                    icon={<Visibility />}
                    iconPosition="start"
                    label="Preview"
                    id="schedule-tab-1"
                    aria-controls="schedule-tabpanel-1"
                  />
                </Tabs>
              </Box>


                <TabPanel value={activeTab} index={0}>
                  <ScheduleEditor
                    scheduleData={scheduleData}
                    setScheduleData={setScheduleData}
                    onImageUpload={handleImageUpload}
                  />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  <PreviewContainer>
                    <SchedulePreview 
                      scheduleData={scheduleData} 
                      onImageTransformChange={handleImageTransformChange} 
                      onBackgroundTransformChange={handleBackgroundTransformChange} 
                    />
                  </PreviewContainer>
                </TabPanel>


            </Box>

            {/* Hidden preview for export functionality */}
            <HiddenPreview>
              <SchedulePreview scheduleData={scheduleData} isExporting={true} />
            </HiddenPreview>
          </Container>
        </AppContainer>

        <Footer />
      </AppWrapper>
    </MuiThemeProvider>
  )
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
};

export default App;
