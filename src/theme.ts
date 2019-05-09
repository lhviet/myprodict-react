// tslint:disable
import Color from 'color';
import { css } from 'styled-components';

export const colors = {
  bgBlue: new Color('#1f759e'),
  bgHighlight: new Color('rgb(253, 255, 228)'),

  borderGray: new Color('rgb(179, 179, 179)'),

  grey: new Color('rgb(97, 97, 97)'),
  dark: new Color('rgb(57,57,57)'),
  red: new Color('#dc3545'),
  blue: new Color('rgb(82, 145, 248)'),
  blueDark: new Color('rgb(54,78,148)'),
  green: new Color('rgb(104, 153, 80)'),

  primaryBtn: new Color('#007aee'),
  primaryBtnHover: new Color('#0066c9'),
  primaryBtnBorder: new Color('#5597e3'),
};

export const zIndex = {
  topbarNav: 1030,
};

const btnStyles = css`
  cursor: pointer;
  display: inline-block;
  color: inherit;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid ${colors.grey.toString()};
  padding: .375rem .75rem;
  border-radius: .25rem;
  transition: 
    color .15s ease-in-out,
    background-color .15s ease-in-out,
    border-color .15s ease-in-out,
    box-shadow .15s ease-in-out;
    
  :hover {
    border-color: ${colors.primaryBtnBorder.toString()};
  }`;
export const styles = {
  scrollbar: css`
    ::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 4px transparent;
      background-color: transparent;
      border-radius: 6px;
    }
    ::-webkit-scrollbar {
      width: 8px;
      background-color: transparent;
    }
    ::-webkit-scrollbar-thumb {
      -webkit-box-shadow: inset 0 0 4px transparent;
      background-color: ${colors.borderGray.alpha(.5).toString()};
      border-radius: 6px;
    }
  `,
  primaryBtn: css`
    ${btnStyles};
    color: #fff;
    background-color: ${colors.primaryBtn.toString()};
    :hover {
      background-color: ${colors.primaryBtnHover.toString()};
    }
  `,
  primaryOutlineBtn: css`
    ${btnStyles};
    color: ${colors.dark.alpha(.8).toString()};
    background-color: transparent;
    :hover {
      color: ${colors.dark.toString()};
    }
  `,
};
