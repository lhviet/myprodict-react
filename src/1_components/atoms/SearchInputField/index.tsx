import * as React from 'react';
import styled from 'styled-components';

import { alpha, colors } from '^/theme';
import IconWithSpinner, { IconType } from '^/1_components/atoms/IconWithSpinner';

const Root = styled.div`
  position: relative;
  width: 100%;
`;
const SearchInput = styled.input.attrs({
  type: 'text',
  placeholder: 'Type here to search...',
  'aria-label': 'search keywords',
})`
  display: block;
  width: calc(100% - 2.8rem);
  padding: .5rem 2.3rem .5rem .5rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: ${colors.blueDark.toString()};
  background-color: #fff;
  background-clip: padding-box;
  border: none;
  border-bottom: solid 2px ${colors.grey.alpha(alpha.alpha5).toString()};
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  
  :hover {
    border-color: ${colors.green.toString()};
  }
`;
const SearchIcon = styled(IconWithSpinner)`
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  font-size: 1.3rem;
  color: ${colors.blueDark.alpha(alpha.alpha6).toString()};
  cursor: pointer;
  
  :hover {
    color: ${colors.blueDark.alpha(alpha.alpha8).toString()};
  }
`;

interface Props {
  isSearching?: boolean;
  value?: string;
  className?: string;
  onChange(value: string): void;
}

interface State {
  value: string;
  isFocusing: boolean;
}

class SearchInputField extends React.Component<Props, State> {
  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      value: this.props.value || '',
      isFocusing: false
    };
  }

  handleSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({value: e.currentTarget.value});
    this.props.onChange(e.currentTarget.value);
  }
  handleSearch = () => this.props.onChange(this.state.value);

  setFocus = (isFocusing: boolean) => this.setState({isFocusing});

  render() {
    const { isSearching, className }: Props = this.props;

    return (
      <Root className={className}>
        <SearchInput
          value={this.state.value}
          onChange={this.handleSearchChange}
          onFocus={() => this.setFocus(true)}
        />
        <SearchIcon iconType={IconType.search} isLoading={isSearching} onClick={this.handleSearch} />
      </Root>
    );
  }
}

export default SearchInputField;
