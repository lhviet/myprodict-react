import React, { SyntheticEvent } from 'react';
import styled from 'styled-components';

import { alpha, colors } from '^/theme';

const Root = styled.button`
  padding: .25rem .4rem;
  font-size: .8rem;
  text-align: center;
  color: ${colors.grey.alpha(alpha.alpha8).toString()};
  border: solid 1px transparent;
  border-radius: 3px;
  background-color: transparent;
  cursor: pointer;
  
  i {
    margin-left: .4rem;
  }
  
  :hover {
    border-color: ${colors.blue.toString()};
  }
`;

interface ButtonStatusProps {
  labels: [string, string];
  fontIcons: [string, string];
  isExpanded?: boolean;
  className?: string;
  onClick?(): void;
}
export default ({ labels, fontIcons, isExpanded, onClick, className }: ButtonStatusProps) => {
  const label: string = isExpanded ? labels[0] : labels[1];
  const icon: string = isExpanded ? fontIcons[0] : fontIcons[1];

  const handleClick = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    if (onClick) {
      onClick();
    }
  };

  return (
    <Root onClick={handleClick} className={className}>
      {label}
      <i className={`fa ${icon}`} />
    </Root>
  );
};
