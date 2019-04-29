import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { isAdminOrSuperAdmin, MPTypes } from 'myprodict-model/lib-esm';

import SearchInputField from '^/1_components/atoms/SearchInputField';

import style from './style.module.scss';

const LOGO_URL = 'http://d30qxb56opqku1.cloudfront.net/images/logo.png';

interface NavBarTopProps {
  isResultListDisplay: boolean; // enable result list to display or not
  isSearching: boolean;
  searchResult: any;
  isLoggedIn: boolean;
  userRole: MPTypes.UserRole;
  onSearchChange(keyword: string): any;
}

const NavBarTop = (
  { isLoggedIn, isSearching, isResultListDisplay, userRole, searchResult, onSearchChange }: NavBarTopProps
) => {
  const items = searchResult.models && searchResult.models.length > 9 ?
    searchResult.models.slice(0, 9) : [];
  return (
    <nav className={'navbar navbar-expand-lg navbar-dark bg-dark fixed-top ' + style.navBarTop}>
      <a className={style.navbarBrand} href="/">
        <img className="brand" src={LOGO_URL} alt="logo" />
      </a>
      <div className={style.searchBar}>
        <SearchInputField
          isSearching={isSearching}
          onChange={onSearchChange}
          items={items}
          isResultListDisplay={isResultListDisplay}
        />
      </div>
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
    </nav>
  );
};

export default NavBarTop;
