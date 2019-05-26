import * as React from 'react';
import styled from 'styled-components';

import { alpha, colors } from '^/theme';

const Root = styled.i`
  cursor: pointer;
  padding: 0.1rem;
  border: solid 1px transparent;
  border-radius: 50%;
  color: ${colors.grey.alpha(alpha.alpha8).toString()};
  transition: ease .3s;
  
  :hover {
    border-color: ${colors.grey.alpha(alpha.alpha8).toString()};
  }
`;

export enum IconType {
  speaker = 'fa-volume-up',
  search = 'fa-search',
}

interface Props {
  iconType: IconType;
  isLoading?: boolean;
  className?: string;
  onClick?(event: React.SyntheticEvent): void;
}

export default ({ iconType, isLoading, className, onClick }: Props) => {
  const iconClassName = `fa ${isLoading ? 'fa-spinner an-spin' : iconType} ${className}`;

  return (
    <Root className={iconClassName} onClick={onClick} />
  );
};
