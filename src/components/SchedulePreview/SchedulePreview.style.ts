import { Box, Chip, styled } from "@mui/material";

export const StyledBox = styled(Box)(
  () => `
  &.halftone {
    position: absolute;
    background-color: #CB4F59;
    top: 4px;
    left: 4px;
    height: 112px;
    width: 600px;
    z-index: 90;
    border-right: 2.5px solid #D0D0D0;
    --dotSize: 0.08rem;
    --bgSize: 0.85rem;
    --bgPosition: calc(var(--bgSize) / 2);
    --dotColor: #d0d0d0a5;

    :after {
      content: '';
      position: absolute;
      inset: 0;

      background-image: radial-gradient(
        circle at center,
        var(--dotColor) var(--dotSize),
        transparent 0
      ), radial-gradient(circle at center, var(--dotColor) var(--dotSize), transparent 0);
      background-size: var(--bgSize) var(--bgSize);
      background-position: 0 0, var(--bgPosition) var(--bgPosition);

      mask-image: linear-gradient(to right, var(--dotColor), rgb(0 0 0 / 0));
    }

    .inner-halftone {
      position: absolute;
      height: 90px;
      width: 590px;
      top: 10px;
      left: 10px;
      z-index: 95;
      border: 2px dashed #d0d0d0bc;
      border-top-left-radius: 16px;
      border-bottom-left-radius: 16px;
      border-right: none;
      align-content: center;
      justify-items: center;
      color: #E5E5E5;
    }
  }
`);

export const StyledActivityBox = styled(Box)(
  () => `
  &.halftone-activity {
    position: absolute;
    background-color: #CB4F59;
    top: 2.5px;
    left: 2.5px;
    right: 2.5px;
    bottom: 2.5px;
    z-index: 90;
    border-radius: 14px;
    --dotSize: 0.08rem;
    --bgSize: 0.85rem;
    --bgPosition: calc(var(--bgSize) / 2);
    --dotColor: #d0d0d0a5;

    :after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      background-image: radial-gradient(
        circle at center,
        var(--dotColor) var(--dotSize),
        transparent 0
      ), radial-gradient(circle at center, var(--dotColor) var(--dotSize), transparent 0);
      background-size: var(--bgSize) var(--bgSize);
      background-position: 0 0, var(--bgPosition) var(--bgPosition);
    }

    .inner-halftone-activity {
      position: absolute;
      top: 11px;
      left: 0;
      right: 0;
      bottom: 11px;
      z-index: 95;
      border-top: 2px solid #d0d0d0bc;
      border-bottom: 2px solid #d0d0d0bc;
      display: flex;
      flex-direction: row;
      align-items: center;
      color: #473c3a;
      background-color: #F4E0DF;
      justify-content: space-between;
      padding-right: 30px;
      padding-left: 60px;
    }
  }
`);

export const StyledEyeBox = styled(Box)(() => `
  &.blue-eye {
    display: flex;
    height: 50px;
    width: 50px;
    position: absolute;
    background-color: #494561;
    z-index: 100;
    border-radius: 50px;
    border: 2px dashed #D0D0D0;
  }

  &.red-eye {
    display: flex;
    height: 40px;
    width: 40px;
    position: absolute;
    background-color: #CB4F59;
    z-index: 100;
    border-radius: 50px;
    border: 2px dashed #D0D0D0;
  }
`);

export const StyledSmallBox = styled(Box)(
  () => `
  &.halftone-small-box {
    position: absolute;
    background-color: #CB4F59;
    top: 0;
    left: 0;
    height: 214px;
    width: 295px;
    z-index: 92;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    border-right: 2.5px solid #494561;  
    border-top: 2.5px solid #494561;  
    border-left: 2.5px solid #494561;  
    border-bottom: 2.5px solid #D0D0D0;
    --dotSize: 0.08rem;
    --bgSize: 0.85rem;
    --bgPosition: calc(var(--bgSize) / 2);
    --dotColor: #d0d0d0a5;

    :after {
      content: '';
      position: absolute;
      inset: 0;

      background-image: radial-gradient(
        circle at center,
        var(--dotColor) var(--dotSize),
        transparent 0
      ), radial-gradient(circle at center, var(--dotColor) var(--dotSize), transparent 0);
      background-size: var(--bgSize) var(--bgSize);
      background-position: 0 0, var(--bgPosition) var(--bgPosition);

      mask-image: linear-gradient(to top, var(--dotColor), rgb(0 0 0 / 0));
    }

    .inner-halftone-small-box {
      position: absolute;
      height: 195px;
      width: 262px;
      top: 12px;
      left: 12px;
      z-index: 95;
      border: 2px dashed #d0d0d0bc;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      border-bottom: none;
      align-content: center;
      justify-items: center;
      color: #E5E5E5;
      text-align: center;
      padding-left: 5px;
      padding-right: 5px;
    }

    .inner-pattern-small-box {
      position: absolute;
      height: 195px;
      width: 262px;
      top: 12px;
      left: 12px;
      z-index: 90;
      opacity: 0.06;
      rotate: 180deg;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;

      --s: 50px; /* control the size*/
      --c1: #d0d0d0;
      --c2: #cb4f59;
      
      --_g: 
        var(--c2) 6%  14%,var(--c1) 16% 24%,var(--c2) 26% 34%,var(--c1) 36% 44%,
        var(--c2) 46% 54%,var(--c1) 56% 64%,var(--c2) 66% 74%,var(--c1) 76% 84%,var(--c2) 86% 94%;
      background:
        radial-gradient(100% 100% at 100% 0,var(--c1) 4%,var(--_g),#0008 96%,#0000),
        radial-gradient(100% 100% at 0 100%,#0000, #0008 4%,var(--_g),var(--c1) 96%)
        var(--c1);
      background-size: var(--s) var(--s);
    }
  }
`);

export const StyledActivitySmallBox = styled(Box)(
  () => `
  &.halftone-activity-small-box {
    position: absolute;
    background-color: #F4E0DF;
    top: 0;
    left: 0;
    height: 300px;
    width: 300px;
    z-index: 92;

    .inner-halftone-activity-small-box {
      position: absolute;
      height: 270px;
      width: 270px;
      top: 12px;
      left: 12px;
      z-index: 95;
      border: 2px dashed #473c3adb;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      color: #473c3a;
      padding-left: 10px;
      padding-right: 10px;
    }
  }

  &.halftone-activity-small-box-behind {
    position: absolute;
    background-color: #CB4F59;
    top: 0;
    left: 0;
    height: 300px;
    width: 300px;
    z-index: 92;
    border-radius: 10px;
    --dotSize: 0.08rem;
    --bgSize: 0.85rem;
    --bgPosition: calc(var(--bgSize) / 2);
    --dotColor: #d0d0d0a5;

    :after {
      content: '';
      position: absolute;
      inset: 0;

      background-image: radial-gradient(
        circle at center,
        var(--dotColor) var(--dotSize),
        transparent 0
      ), radial-gradient(circle at center, var(--dotColor) var(--dotSize), transparent 0);
      background-size: var(--bgSize) var(--bgSize);
      background-position: 0 0, var(--bgPosition) var(--bgPosition);
    }
  }
`);

export const StyledActivityChip = styled(Chip)(
  () => `
  &.activity-chip {
    height: 25px;
    width: fit-content;
    border-radius: 0;
    background: #438bee;
    color: #f5f5f5;
    font-size: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    mask: radial-gradient(5px at 5px 5px,#0000 98%,#000) -5px -5px;

    span {
      border: 1px solid #ffffff42;
      margin: 5px;
      border-radius: 3px;
      padding: 0 6px;
    }
  }
`);

export const StyledImageContainerFirst = styled(Box)(
  () => `
  width: 600px;
  height: 800px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #F4E0DF;
  border: 2.5px solid #473c3a;
  border-radius: 24px;
  transform: rotate(2deg);
  margin: 60px 20px 0 -50px;
  z-index: 40;

  .container-box-image {
    width: 590px;
    height: 782px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-color: #F4E0DF;
    border: 2px solid #473c3a;
    border-radius: 18px;
    margin-right: 8px;
  }
`);

export const StyledImageContainerSecond = styled(Box)(
  () => `
  width: 580px;
  height: 840px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #F4E0DF;
  border: 2.5px solid #ffffff;
  border-radius: 24px;
  transform: rotate(-2deg);
  top: 30px;
  left: -35px;
  z-index: 30;

  .container-box-dashed {
    position: absolute;
    width: 580px;
    height: 800px;
    top: 20px;
    right: 20px;
    border: 2.5px dashed #473c3adb;
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    color: #473c3a;
    padding-left: 10px;
    padding-right: 10px;
  }
`);

export const StyledImageContainerThird = styled(Box)(
  () => `
  .container-box-dots {
    position: absolute;
    background-color: #CB4F59;
    border: 2.5px solid #ffffff;
    top: 22px;
    left: -42px;
    width: 580px;
    height: 800px;
    z-index: 20;
    border-radius: 24px;
    transform: rotate(2deg);
    --dotSize: 0.08rem;
    --bgSize: 0.85rem;
    --bgPosition: calc(var(--bgSize) / 2);
    --dotColor: #d0d0d0a5;

    :after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 18px;

      background-image: radial-gradient(
        circle at center,
        var(--dotColor) var(--dotSize),
        transparent 0
      ), radial-gradient(circle at center, var(--dotColor) var(--dotSize), transparent 0);
      background-size: var(--bgSize) var(--bgSize);
      background-position: 0 0, var(--bgPosition) var(--bgPosition);
    }
  }
`);

export const StyledWeekRange = styled(Box)(
  () => `
  position: absolute;
  top: 0;
  padding: 12px 18px;
  z-index: 250;

  width: 50px;
  height: 160px;
  box-sizing: content-box;
  // position: relative;
  text-align: center;
  text-transform: uppercase;
  background: #494561;
  mask: radial-gradient(12px at right,#0000 98%,#000);

  :before {
    content: "";
    position: absolute;
    right: 0;
    bottom: -10px;
    width: 0;
    height: 0;
    border-top: 13px solid #494561;
    border-left: 55px solid transparent;
    // border-right: 55px solid transparent;
    z-index: 210;
    mask: radial-gradient(12px at right,#0000 98%,#000);
  }
  :after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -10px;
    width: 0;
    height: 0;
    border-top: 13px solid #494561;
    // border-left: 55px solid transparent;
    border-right: 55px solid transparent;
    z-index: 210;
    mask: radial-gradient(12px at right,#0000 98%,#000);
  }
`);