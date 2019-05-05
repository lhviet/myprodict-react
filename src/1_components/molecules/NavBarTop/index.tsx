import React  from 'react';
import { NavLink } from 'react-router-dom';
import { isAdminOrSuperAdmin, MPTypes } from 'myprodict-model/lib-esm';
import styled from 'styled-components';

import { colors } from '^/theme';

const LOGO_URL = 'http://d30qxb56opqku1.cloudfront.net/images/logo.png';

const Root = styled.nav`
  display: flex;
  justify-content: flex-start;
  height: 2rem;
  padding: .5rem .8rem;
  background-color: ${colors.bgDark.toString()};  
`;
const NavBrandLink = styled.a`
  line-height: 0;
`;
const NavBrandIcon = styled.img.attrs({
  alt: 'logo',
  src: LOGO_URL,
})`
  width: 2rem;
  height: 2rem;
`;

interface NavBarTopProps {
  isLoggedIn: boolean;
  userRole: MPTypes.UserRole;
  className?: string;
}

const NavBarTop: React.FunctionComponent<NavBarTopProps> = (
  { isLoggedIn, userRole, className }: NavBarTopProps
) => {
  return (
    <Root className={className}>
      <NavBrandLink href="/">
        <NavBrandIcon />
      </NavBrandLink>
      <NavLink to="/read-aloud" className={'a-bright'} activeClassName={'active'} exact={true}>
        Read Aloud
      </NavLink>
      <NavLink to="/app" className={'a-bright'} activeClassName={'active'} exact={true}>
        App
      </NavLink>
      <NavLink to="/" className={'a-bright'} activeClassName={'active'} exact={true}>
        <i className={'fa fa-home fa-2x'} />
      </NavLink>
      {isLoggedIn && isAdminOrSuperAdmin(userRole) && <div>
        <NavLink to="/word/add" className={'a-bright ml-3'} activeClassName={'active'}>
          <i className={'fa fa-plus-circle fa-2x text-warning'} />
        </NavLink>
        <NavLink to="/word/admin" className={'a-bright ml-3'} activeClassName={'active'}>
          <i className={'fa fa-list-ul fa-2x text-warning'} />
        </NavLink>
      </div>}
    </Root>
  );
};

export default NavBarTop;
