import styled from "styled-components";

export const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

export const AppContainer = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const PreviewContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const HiddenPreview = styled.div`
  position: fixed;
  top: -9999px;
  left: -9999px;
  pointer-events: none;
`;