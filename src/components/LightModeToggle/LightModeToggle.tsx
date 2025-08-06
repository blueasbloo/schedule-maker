import { Box } from "@mui/material";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useCustomTheme } from "../../contexts/useCustomTheme";


export const CustomThemeToggle = () => {
  const { currentTheme, isDarkMode, toggleDarkMode } = useCustomTheme();

  const { width, height, iconSize } = { width: 60, height: 30, iconSize: 16 };
  const buttonSize = height - 4;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        onClick={toggleDarkMode}
        sx={{
          width,
          height,
          borderRadius: height / 2,
          backgroundColor: isDarkMode ? "#2c2c2c" : "#e8e8e8",
          position: "relative",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          alignItems: "center",
          padding: "2px",
          boxShadow: isDarkMode ? "inset 0 2px 4px rgba(0,0,0,0.3)" : "inset 0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* Background Icons */}
        <Box
          sx={{
            position: "absolute",
            left: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <LightMode
            sx={{
              fontSize: iconSize,
              color: isDarkMode ? "#666" : "#fff",
              transition: "color 0.3s ease",
            }}
          />
        </Box>

        <Box
          sx={{
            position: "absolute",
            right: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <DarkMode
            sx={{
              fontSize: iconSize,
              color: isDarkMode ? "#fff" : "#666",
              transition: "color 0.3s ease",
            }}
          />
        </Box>

        {/* Sliding Button */}
        <Box
          sx={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: "50%",
            backgroundColor: currentTheme.colors.primary,
            position: "absolute",
            left: isDarkMode ? `${width - buttonSize - 2}px` : "2px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            boxShadow: `0 0 6px ${currentTheme.colors.primary}, 0 1px 3px rgba(0,0,0,0.2)`,
          }}
        >
          {isDarkMode ? (
            <DarkMode
              sx={{
                fontSize: iconSize,
                color: "#fff",
              }}
            />
          ) : (
            <LightMode
              sx={{
                fontSize: iconSize,
                color: "#fff",
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
