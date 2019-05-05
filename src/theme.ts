import Color from 'color';

export const colors = {
  bgDark: new Color('#343a40'),
  bgHighlight: new Color('rgb(253, 255, 228)'),

  borderGray: new Color('rgb(179, 179, 179)'),

  grey: new Color('rgb(97, 97, 97)'),
  red: new Color('#dc3545'),
  blue: new Color('rgb(26, 103, 228)'),
  green: new Color('rgb(104, 153, 80)'),
};

export const zIndex = {
  topbarNav: 1030,
};

export const styles = {
  scrollbar: `
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
};
