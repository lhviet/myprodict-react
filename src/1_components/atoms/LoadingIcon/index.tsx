import * as React from 'react';
import styled from 'styled-components';

import { colors } from '^/theme';

const trackAlpha = 0.3;
const Root = styled.span`
  display: inline-block;
  font-size: 2rem;
  position: relative;
  text-indent: -9999em;
  width: 2em;
  height: 2em;
  border-radius: 50%;
  border-top: .2em solid ${colors.grey.alpha(trackAlpha).toString()};
  border-right: .2em solid ${colors.grey.alpha(trackAlpha).toString()};
  border-bottom: .2em solid ${colors.grey.alpha(trackAlpha).toString()};
  border-left: .2em solid ${colors.grey.toString()};
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation: load8 1.2s infinite linear;
  animation: load8 1.2s infinite linear;
  
  :after {
    border-radius: 50%;
    width: 2em;
    height: 2em;
  }
  @-webkit-keyframes load8 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes load8 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
`;

interface Props {
  className?: string;
}

export default ({ className }: Props) => (<Root className={className} />);
