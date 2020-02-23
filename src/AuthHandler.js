import auth0 from "auth0-js";
import GraphQLReplicator from "./GraphQLReplicator.js";
import EventEmitter from "events";

class AuthHandler {
  constructor() {
    this.afterLogInUrl = `${window.location.protocol}//${window.location.host}/?loggedIn=1`;
    this.afterLogOutUrl = `${window.location.protocol}//${window.location.host}/?loggedIn=1`;
    this.callbackUrl = `${window.location.protocol}//${window.location.host}/?auth0callback=1`;
    const domain = "dev-jl7evyx6.auth0.com";
    this.auth0 = new auth0.WebAuth({
      domain: domain,
      clientID: "FABHPRxveNbpqDkdQwOyb8jX36rdkMVo",
      redirectUri: this.callbackUrl,
      audience: `https://${domain}/userinfo`,
      responseType: "token id_token",
      scope: "openid profile"
    });
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isExpired = this.isExpired.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    this.renewSession = this.renewSession.bind(this);

    // this.state = {
    //   idToken: null,
    //   userId: localStorage.getItem("userId"),
    //   db: null
    // };
    this.emitter = new EventEmitter();
  }

  login() {
    this.auth0.authorize();
  }

  async handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        // after we've parsed the auth0 stuff get it out of the URL
        window.location = this.afterLogInUrl;
      } else if (err) {
        console.error(err);
        this.logout();
        alert(`Error: ${err.error} - ${err.errorDescription}`);
      } else {
        if (this.isLoggedIn()) {
          this.emitter.emit("isloggedin", this);
        } else {
          this.emitter.emit("isloggedout", this);
        }
      }
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

  getIdToken() {
    return this.idToken;
  }

  setSession(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem("isLoggedIn", "true");

    // Set the time that the access token will expire at
    let expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = expiresAt;
    this.userId = authResult.idTokenPayload.sub;

    localStorage.setItem("userId", this.userId);

    this.emitter.emit("isloggedin", this);
    // navigate to the home route
    //history.replace("/");
    // this.setState({
    //   idToken: authResult.idToken,
    //   userId: this.userId
    // });

    // if (this.graphqlReplicator) {
    //   this.graphqlReplicator.restart({
    //     userId: this.userId,
    //     idToken: this.idToken
    //   });
    // }
  }

  renewSession() {
    const interval = setInterval(() => {
      const shouldRenewSession =
        this.isLoggedIn && (!this.idToken || this.isExpired());

      if (window.navigator.onLine && shouldRenewSession) {
        this.auth0.checkSession({}, (err, authResult) => {
          if (authResult && authResult.accessToken && authResult.idToken) {
            this.setSession(authResult);
            //window.location = "/"
          } else if (err) {
            this.logout();
            console.log(err);
            alert(
              `Could not get a new token (${err.error}: ${err.error_description}).`
            );
          }
        });
      }
    }, 5000);
  }

  logout() {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem("isLoggedIn");

    this.auth0.logout({
      return_to: window.location.origin
    });
    this.emitter.emit("isloggedout", this);
    // navigate to the home route
    //history.replace("/");
    // this.setState({
    //   idToken: null
    // });
  }

  isExpired() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() > expiresAt;
  }

  async init() {
    // If this is a callback URL then do the right things
    const location = window.location;
    if (
      location &&
      location.href.startsWith(this.callbackUrl) &&
      /access_token|id_token|error/.test(location.hash)
    ) {
      this.handleAuthentication();
      return;
    }

    if (this.isLoggedIn()) {
      this.renewSession();
      return;
    }
  }

  isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
  }

  //   render() {
  //     const location = this.props.location;
  //     const isCallbackPage =
  //       location && location.pathname.startsWith("/callback");

  //     if (!this.isLoggedIn() && !isCallbackPage) {
  //       return <Login loginHandler={this.login} />;
  //     }

  //     if (!this.state.db) {
  //       return <Loading />;
  //     }

  //     return (
  //       <App
  //         auth={{ userId: this.userId }}
  //         logoutHandler={this.logout}
  //         db={this.state.db}
  //       />
  //     );
}

export default AuthHandler;
