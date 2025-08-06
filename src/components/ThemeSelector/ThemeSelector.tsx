import { 
  ThemeSelectorContainer, 
  Label, 
  ThemeGrid, 
  ThemeOption, 
  ColorPreview, 
  ThemeName 
} from "./ThemeSelector.style";
import { useCustomTheme } from "../../contexts/useCustomTheme";

const ThemeSelector = () => {
  const { currentTheme, setTheme, themes } = useCustomTheme();

  return (
    <ThemeSelectorContainer>
      <Label>Color Theme</Label>
      <ThemeGrid>
        {themes.map((theme) => (
          <ThemeOption
            key={theme.id}
            isActive={currentTheme.id === theme.id}
            primaryColor={theme.colors.primary}
            secondaryColor={theme.colors.secondary}
            onClick={() => setTheme(theme.id)}
          >
            <ColorPreview primaryColor={theme.colors.primary} secondaryColor={theme.colors.secondary} />
            <ThemeName isActive={currentTheme.id === theme.id} primaryColor={theme.colors.primary}>
              {theme.name}
            </ThemeName>
          </ThemeOption>
        ))}
      </ThemeGrid>
    </ThemeSelectorContainer>
  )
};

export default ThemeSelector;