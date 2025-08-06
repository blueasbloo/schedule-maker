import { styled } from "styled-components";

export const ThemeSelectorContainer = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

export const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
`;

export const ThemeOption = styled.button<{ isActive: boolean; primaryColor: string; secondaryColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border: 2px solid ${(props) => (props.isActive ? props.primaryColor : "#e5e7eb")};
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => props.primaryColor};
    transform: translateY(-1px);
  }
`;

export const ColorPreview = styled.div<{ primaryColor: string; secondaryColor: string }>`
  width: 40px;
  height: 20px;
  border-radius: 0.25rem;
  background: linear-gradient(135deg, ${(props) => props.primaryColor} 0%, ${(props) => props.secondaryColor} 100%);
  margin-bottom: 0.5rem;
`;

export const ThemeName = styled.span<{ isActive: boolean; primaryColor: string }>`
  font-size: 0.75rem;
  font-weight: ${(props) => (props.isActive ? "600" : "500")};
  color: ${(props) => (props.isActive ? props.primaryColor : "#6b7280")};
`;