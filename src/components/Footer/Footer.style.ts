import { styled } from "styled-components";

export const FooterContainer = styled.footer<{ bgcolor: string; textcolor: string }>`
  background: ${(props) => props.bgcolor};
  color: ${(props) => props.textcolor};
  padding: 1.5rem 2rem;
  margin-top: auto;
  border-top: 1px solid ${(props) => props.textcolor}20;
`;

export const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const CreditText = styled.span`
  font-size: 0.875rem;
  opacity: 0.8;
`;

export const TwitterLink = styled.a<{ color: string }>`
  color: ${(props) => props.color};
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;