// handle all logic of authentication
import axios from 'axios';

import { HOST } from '^/app-configs';

import { readToken } from '^/4_services/local-storage-service';

export const isLoggedIn = (): boolean => {
  const token = readToken();
  return !!token && token.trim().length > 0;
};

// trying to login by Google - 1st time
export const authLoginByGoogle = (idToken: string, keepSignIn = true): Promise<any> => {
  const body = { id_token: idToken, keepSignIn };
  return axios.post(HOST.api.getUrl(HOST.api.user.login_by_google), body);
};

// trying to signup & login by Google - 2nd time
export const authConnectToGoogle = (
  email: string,
  username: string,
  signedRequest: string,
  password = ''
): Promise<any> => {
  const body = { email, username, signedRequest, password };
  return axios.post(HOST.api.getUrl(HOST.api.user.connect_to_google), body);
};
