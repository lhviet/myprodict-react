import * as React from 'react';

interface ClientFacebookSignInButtonProps {
}
interface ClientFacebookSignInButtonState {
}

const FACEBOOK_BUTTON_ID = 'signin-facebook';
const FACEBOOK_INLINE_STYLE: React.CSSProperties = {
  background: '#4267b2',
  borderRadius: '5px',
  color: 'white',
  height: '40px',
  textAlign: 'center',
  width: '320px',
};

class ClientFacebookSignInButton
  extends React.Component<ClientFacebookSignInButtonProps, ClientFacebookSignInButtonState> {

  componentDidMount() {
    setTimeout(() => {  // try to wait for file async loaded
      try {
        this.renderButton();
      } catch (err) {
        // console.error('Facebook SignIn button rendered ERROR = ', err.message);
        // try again after 5 secs
        setTimeout(this.renderButton, 5000);
      }
    },         3000);
  }

  renderButton = () => {
    const finishedRendering = () => {
      const signinFacebookBtn = document.getElementById(FACEBOOK_BUTTON_ID);
      if (signinFacebookBtn) {
        signinFacebookBtn.removeAttribute('style');
        const firstChild = signinFacebookBtn.childNodes[0];
        if (firstChild.nodeName.toLowerCase() === 'span') {
          signinFacebookBtn.removeChild(firstChild);
        }
      }
    };
    FB.Event.subscribe('xfbml.render', finishedRendering);
    FB.XFBML.parse();
  };

  render() {
    return (
      <div id={FACEBOOK_BUTTON_ID} style={FACEBOOK_INLINE_STYLE}>
        <span>Loading...</span>
        <div
          className="fb-login-button"
          data-max-rows="1"
          data-size="large"
          data-button-type="login_with"
          data-show-faces="false"
          data-auto-logout-link="false"
          data-use-continue-as="true"
          data-width="320"
        />
      </div>
    );
  }
}

export default ClientFacebookSignInButton;
