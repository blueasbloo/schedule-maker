// import { Button } from "@mui/material";
// import { Feedback, Twitter } from "@mui/icons-material";
import { Twitter } from "@mui/icons-material";
import { useCustomTheme } from "../../contexts/useCustomTheme";
import { 
  FooterContainer, 
  FooterContent, 
  LeftSection, 
  CreditText, 
  RightSection, 
  TwitterLink 
} from "./Footer.style";


const Footer = () => {
  const { currentTheme } = useCustomTheme();

  // const handleFeedbackClick = () => {
  //   const subject = encodeURIComponent("Stream Schedule Feedbacks");
  //   const body = encodeURIComponent("I would like to send feedbacks on...");
  //   const mailtoLink = `mailto:blueasbloo@gmail.com?subject=${subject}&body=${body}`;
  //   window.open(mailtoLink);
  // };

  return (
    <FooterContainer bgcolor={currentTheme.colors.footerBackground} textcolor={currentTheme.colors.surfaceText}>
      <FooterContent>
        <LeftSection>
          {/* <Button
            variant="outlined"
            startIcon={<Feedback />}
            onClick={handleFeedbackClick}
            sx={{
              borderColor: currentTheme.colors.primary,
              color: currentTheme.colors.primary,
              "&:hover": {
                borderColor: currentTheme.colors.primary,
                backgroundColor: `${currentTheme.colors.primary}10`,
              },
            }}
          >
            Send Feedback
          </Button>

          <CreditText>Help us improve this app with your suggestions!</CreditText> */}
        </LeftSection>

        <RightSection>
          <CreditText>Created by</CreditText>
          <TwitterLink
            href="https://twitter.com/blueasbloo"
            target="_blank"
            rel="noopener noreferrer"
            color={currentTheme.colors.primary}
          >
            <Twitter fontSize="small" />
            @blueasbloo
          </TwitterLink>
        </RightSection>
      </FooterContent>
    </FooterContainer>
  )
};

export default Footer;