import * as React from 'react';
import styled from 'styled-components';

import { colors } from '^/theme';
import IconWithSpinner, {IconType} from '^/1_components/atoms/IconWithSpinner';

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
  width: calc(100% - 1rem);
  padding: .5rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: ${colors.blue.toString()};
  background-color: white;
  background-clip: padding-box;
  border: none;
  border-bottom: solid 2px ${colors.grey.alpha(.5).toString()};
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
  color: ${colors.blue.alpha(.8).toString()};
  cursor: pointer;
`;

interface Props {
  isSearching?: boolean;
  value?: string;
  className?: string;
  onChange(value: string): void;
}

interface SearchInputFieldState {
  value: string;
  isFocusing: boolean;
}

class SearchInputField extends React.Component<Props, SearchInputFieldState> {
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
    const { isSearching, className, onChange }: Props = this.props;

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
