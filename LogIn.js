import React, { PureComponent } from "react";
import { Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import * as actions from "../../Store/actions/index";
import TextField from "@material-ui/core/TextField";
import { connect } from "react-redux";
import Particles from "react-particles-js";
import { Row, Col, Spinner } from "reactstrap";
import { Checkbox } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import fingerprint from 'fingerprintjs'
import jwt from 'jsonwebtoken';
import ChangeAppLanguage from './Layout/ChangeAppLanguage';
import TopbarLanguage from './Landing/components/TopbarLanguage';
import { Icon } from '@material-ui/core';

// login component for testing.
class LogIn extends PureComponent {
  static propTypes = {
    i18n: PropTypes.shape({ changeLanguage: PropTypes.func }).isRequired,
    t: PropTypes.func.isRequired,
  };

  //initial states
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null,
      remember_me: false,
      error: [],
      loading: false,
      forgetPassword: false,
      email: "",
      visiblePassword: null,
    };
  }

  //change language method
  changeLanguage = (lng) => {
    console.log("this.props.apolloClient.masters ", this.props.apolloClient);

    const { i18n } = this.props;
    i18n.changeLanguage(lng);
  };

  componentWillMount() {

  }

  componentWillReceiveProps(props) {
    if (props.notification) {
      this.setState({
        loading: false,
        email: "",
      });
    }
    
    if (props.notification.success) {
      this.setState({
        forgetPassword: false,
      });
    }
  }

  handleChange = (name) => (event) => {
      this.setState({
        [name]: event.target.value,
      },()=>this.forceUpdate());
  };

  handleChangeRemmeber = (name,value) => (event) => {
        this.setState({
          [name]: !value,
        },()=>this.forceUpdate());
  };

  //validaton login form email and password
  validateForm = (state) => {
    let error = [];
    let username = state.username ? state.username.trim() : "";
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (
      !username ||
      username == "" ||
      !re.test(String(username).toLowerCase())
    ) {
      error.push("username");
    }
    if (!state.password || state.password.trim() == "") {
      error.push("password");
    }
    this.setState({ error: error });
    return error;
  };

  //This will call login action
  logInAccount = () => {
    const state = this.state;
    let error = this.validateForm(state);
    if (error.length > 0) {
      return null;
    }
    let request = {
      username: state.username.trim(),
      password: state.password,
      remember_me: state.remember_me,
    };
    this.props.logIn(this.props.apolloClient.client, request);
    this.setState({
      loading: true,
    });
  };

  visiblePassword = (val) => {
    if (val == this.state.visiblePassword) {
        val = null;
    }
    this.setState({
        visiblePassword: val
    })
  }

  //call login on enter key
  handleKeyPress = (event) => {
    if (event.charCode === 13) {
      this.logInAccount();
    }
  };

  toggleReset = () => {
    this.setState({
      forgetPassword: !this.state.forgetPassword,
      email: "",
      error: [],
    });
  };

  goToRegister = () => {
    this.props.history.push('/register')
  }

  //reset password request
  sendPassword = () => {
    const state = this.state;
    let error = [];
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (
      !state.email ||
      state.email == "" ||
      !re.test(String(state.email).toLowerCase())
    ) {
      error.push("email");
      this.setState({ error: error });
      return error;
    } else {
      let request = {
        email: state.email,
      };
      this.props.forgetPassword(this.props.apolloClient.client, request);
      this.setState({ error: [] });
    }
  };

  //render component
  render() {
    const { error } = this.state;
    const { t } = this.props;

  const sign_in_up_welcome = <ChangeAppLanguage lable_key="sign_in_up_welcome" />;  
  const sign_in_up_aexdo = <ChangeAppLanguage lable_key="sign_in_up_aexdo" />;  
  const sign_in_up_start_business = <ChangeAppLanguage lable_key="sign_in_up_start_business" />;  
  const sign_in_up_username = <ChangeAppLanguage lable_key="sign_in_up_username" />; 
  const sign_in_up_password = <ChangeAppLanguage lable_key="sign_in_up_password" />;  
  const sign_in_up_signin = <ChangeAppLanguage lable_key="sign_in_up_signin" />;  
  const sign_in_up_signup = <ChangeAppLanguage lable_key="sign_in_up_signup" />;  
  const sign_in_up_email = <ChangeAppLanguage lable_key="sign_in_up_email" />;  
  const sign_in_up_sendemail = <ChangeAppLanguage lable_key="sign_in_up_sendemail" />;  
  const sign_in_up_cancel = <ChangeAppLanguage lable_key="sign_in_up_cancel" />; 
  const Login_validate_enteremail = <ChangeAppLanguage lable_key="Login_validate_enteremail" />;
  const Login_validate_enterpassword = <ChangeAppLanguage lable_key="Login_validate_enterpassword" />;
  const Login_Rememberme = <ChangeAppLanguage lable_key="Login_Rememberme" />;
  const Loginpage_forgotpwdlbl = <ChangeAppLanguage lable_key="Loginpage_forgotpwdlbl" />;
  const Loginpage_do_not_have_an_account = <ChangeAppLanguage lable_key="Loginpage_do_not_have_an_account" />;

    return (
      <div>
        <Particles
          style={{ position: "absolute" }}
          params={{
            particles: {
              number: {
                value: 70,
              },
              size: {
                value: 5,
              },
            },
            interactivity: {
              events: {
                onhover: {
                  enable: true,
                  mode: "repulse",
                },
              },
            },
          }}
        />
        <div className="theme-light">

          <div className="topbar">
            <div className="topbar__wrapper">
              <div className="topbar__left">
                <Link className="topbar__logo" to="/" />
              </div>

              <div className="topbar__right">
                <TopbarLanguage />
              </div>

            </div>
          </div>

          <div className="wrapper">
            <main>
              <div className="account sign-in-backround">
                <div className="account__wrapper">
                  <div className="account__card sign-in-card">
                    {!this.state.forgetPassword && (
                      <Row>
                        <Col sm={12} md={12} lg={12}>
                          {/* <div className="topbar__logo sign-in-logo"></div> */}
                          <Link style={{float: "right"}} className="topbar__logo" to="/" />
                          <div>
                            <div className="account__head">
                              <h3 className="account__title">
                              {sign_in_up_welcome}

                                <span className="account__logo">
                                  {" "}
                                  {sign_in_up_aexdo}
                                </span>
                              </h3>
                              <h4 className="account__subhead subhead">
                              {sign_in_up_start_business}

                              </h4>
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={12} lg={12}>
                          <form
                            className=""
                            onSubmit={() => this.logInAccount()}
                          >
                            <div className="form__form-group">
                              <TextField
                                required
                                fullWidth
                                error={error.includes("username")}
                                className="material-form__field"
                                label={sign_in_up_email}
                                value={this.state.username}
                                onChange={this.handleChange("username")}
                              />
                              {this.state.error.includes("username") && (
                                <span class="error-message">
                                  {Login_validate_enteremail}
                                </span>
                              )}
                            </div>
                            <div className="form__form-group">
                              <TextField
                                required
                                fullWidth
                                //type={"password"}
                                type={this.state.visiblePassword === 1 ? "input" : "password"}
                                error={error.includes("password")}
                                className="material-form__field"
                                label={sign_in_up_password}
                                value={this.state.password}
                                onChange={this.handleChange("password")}
                                onKeyPress={this.handleKeyPress}
                                InputProps={{
                                  endAdornment: <Icon className="visible-icon" onClick={() => this.visiblePassword(1)} position="start">{this.state.visiblePassword === 1 ? "visibility_off" : "visibility"}</Icon>,
                                }}
                              />
                              {this.state.error.includes("password") && (
                                <span class="error-message">
                                  {Login_validate_enterpassword}
                                </span>
                              )}
                            </div>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  style={{ padding: "0px 10px",color:"#c00" }}
                                  value="remember_me"
                                  checked={this.state.remember_me}
                                  onChange={this.handleChangeRemmeber("remember_me",this.state.remember_me)}
                                />
                              }
                              label={Login_Rememberme}
                            />
                            <div style={{ display: "flex" }}>
                              <button
                                style={{ marginRight: "5px" }}
                                className="btn btn-success account__btn system-btn"
                                type="button"
                                onClick={(e) => this.logInAccount()}
                                disabled={this.state.loading}
                              >
                                
                                {sign_in_up_signin}
                                {this.state.loading ? (
                                  <Spinner
                                    size="sm"
                                    //color="primary"
                                    style={{ marginLeft: "10px", color: "#fff" }}
                                  />
                                ) : null}
                              </button>
                              {/* <Link
                                style={{ marginRight: "5px" }}
                                className="btn btn-outline-success account__btn system-btn"
                                to="/register"
                              >
                                {sign_in_up_signup}
                              </Link> */}
                            </div>
                            <div
                              className="forgot-password-link"
                              style={{ cursor: "pointer" }}
                              onClick={() => this.toggleReset()}
                            >
                              {Loginpage_forgotpwdlbl}
                            </div>
                            <div
                              className=""
                              style={{ cursor: "pointer", margin: "10px 2px", color: "#6f6f6f" }}
                            >
                              {Loginpage_do_not_have_an_account} <label onClick={() => this.goToRegister()} style={{ cursor: "pointer", color: "#E64823", display: "inline" }}>{sign_in_up_signup}</label>
                            </div>
                          </form>
                        </Col>
                      </Row>
                    )}
                    {this.state.forgetPassword && (
                      <Row>
                        <Col sm={12} md={12} lg={12}>
                          <div className="topbar__logo sign-in-logo"></div>
                          <div>
                            <div className="account__head">
                              <h3 className="account__title">
                              {Loginpage_forgotpwdlbl}

                                {/* <span className="account__logo">
                                  {" "}
                                  {sign_in_up_aexdo}

                                </span> */}
                              </h3>
                              <h4 className="account__subhead subhead">
                              {sign_in_up_start_business}

                              </h4>
                            </div>
                          </div>
                        </Col>
                        <Col sm={12} md={12} lg={12}>
                          <div className="form__form-group">
                            <TextField
                              required
                              fullWidth
                              error={error.includes("email")}
                              className="material-form__field"
                              label={sign_in_up_email}

                              value={this.state.email}
                              onChange={this.handleChange("email")}
                              // onKeyUp={this.sendPassword}
                            />
                            {this.state.error.includes("email") && (
                              <span class="error-message">
                                {Login_validate_enteremail}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex" }}>
                            <button
                              style={{ marginRight: "5px" }}
                              className="btn btn-outline-success account__btn system-btn"
                              type="button"
                              onClick={(e) => this.toggleReset()}
                              disabled={this.state.loading}
                            >
                              {sign_in_up_cancel}
                            </button>
                            
                            <button
                              style={{ marginRight: "5px" }}
                              className="btn btn-success account__btn system-btn"
                              type="button"
                              onClick={(e) => this.sendPassword()}
                              disabled={this.state.loading}
                            >
                              {sign_in_up_sendemail}
                              
                              {this.state.loading ? (
                                <Spinner
                                  size="sm"
                                  //color="primary"
                                  style={{ marginLeft: "10px", color: "#fff" }}
                                />
                              ) : null}
                            </button>
                            
                          </div>
                        </Col>
                      </Row>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

LogIn.propTypes = {
  t: PropTypes.func.isRequired,
};

//load reducers
const mapStateToProps = (state) => {
  return {
    authReducer: state.authReducer,
    apolloClient: state.apolloClient,
    notification: state.notification,
  };
};

//load actions
const mapDispatchToProps = (dispatch) => {
  return {
    logIn: (client, request) => {
      dispatch(actions.logIn(client, request));
    },
    forgetPassword: (client, request) => {
      dispatch(actions.forgetPassword(client, request));
    },
  };
};



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation("common")(LogIn)); //export component
