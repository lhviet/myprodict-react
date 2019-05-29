import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { isAdminOrSuperAdmin, MPTypes } from 'myprodict-model/lib-esm';
import styled from 'styled-components';

import { colors } from '^/theme';

const LOGO_URL = 'http://d30qxb56opqku1.cloudfront.net/images/logo.png';

const Root = styled.nav`
  position: relative;
  display: flex;
  justify-content: flex-end;
  height: 2rem;
  padding: .5rem .8rem;
  background-color: ${colors.bgBlue.toString()};  
`;
const NavBrandIcon = styled.img.attrs({
  alt: 'logo',
  src: LOGO_URL,
})`
  position: absolute;
  left: .5rem;
  width: 2rem;
  height: 2rem;
`;
const NavMenu = styled(NavLink)`
  margin-right: 1rem;
  font-size: 1.1rem;
  line-height: 2;
  
  i {
    font-size: 2rem;
  }
`;

interface NavBarTopProps {
  isLoggedIn: boolean;
  userRole: MPTypes.UserRole;
  className?: string;
}

const NavBarTop: React.FunctionComponent<NavBarTopProps> = (
  { isLoggedIn, userRole, className }: NavBarTopProps
) => {
  const adminMenus: ReactNode = isLoggedIn && isAdminOrSuperAdmin(userRole) ? (
    <>
      <NavMenu to="/word/add" className={'a-bright'} activeClassName={'active'}>
        <i className={'fa fa-plus-circle'} />
      </NavMenu>
      <NavMenu to="/word/admin" className={'a-bright'} activeClassName={'active'}>
        <i className={'fa fa-list-ul'} />
      </NavMenu>
    </>
  ) : undefined;

  return (
    <Root className={className}>
      <NavLink to="/" exact={true}>
        <NavBrandIcon />
      </NavLink>
      <NavMenu to="/read-aloud" className={'a-bright'} activeClassName={'active'} exact={true}>
        Read Aloud
      </NavMenu>
      <NavMenu to="/" className={'a-bright'} activeClassName={'active'} exact={true}>
        <i className={'fa fa-home'} />
      </NavMenu>
      {adminMenus}
    </Root>
  );
};

export default NavBarTop;
