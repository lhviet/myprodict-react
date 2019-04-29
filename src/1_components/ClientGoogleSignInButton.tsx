import * as React from 'react';
import { loadScript } from '^/4_services/browser-client-script-service';

interface ClientGoogleSignInButtonProps {
  signinSuccess(googleUser: gapi.auth2.GoogleUser): void;
  signinFailure(): void;
}
interface ClientGoogleSignInButtonState {
}

const GOOGLE_BUTTON_ID = 'signin-google';
const GOOGLE_API_JS_SRC = 'https://apis.google.com/js/platform.js';

class ClientGoogleSignInButton extends React.Component<ClientGoogleSignInButtonProps, ClientGoogleSignInButtonState> {

  constructor(props: ClientGoogleSignInButtonProps, context: any) {
    super(props, context);
  }

  componentDidMount() {
    setTimeout(() => {  // try to wait for file async loaded
      try {
        this.renderButton();
      } catch (err) {
        // console.error('Google SignIn button rendered ERROR 1 = ', err.message);
        if (!!gapi) {
          loadScript(GOOGLE_API_JS_SRC)
            .then(this.renderButton)
            .catch(err => {
              // console.error('Google SignIn button rendered ERROR 2 = ', err.message)
            });
        }
      }
    },         3000);
  }

  renderButton = () => gapi.signin2.render(GOOGLE_BUTTON_ID, {
    scope: 'profile email',
    width: 320,
    height: 40,
    longtitle: true,
    theme: 'dark',
    onsuccess: this.props.signinSuccess,
    onfailure: this.props.signinFailure
  })

  render() {
    return <div style={{display: 'inline-block'}} id={GOOGLE_BUTTON_ID} />;
  }
}

export default ClientGoogleSignInButton;
