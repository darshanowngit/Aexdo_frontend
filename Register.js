/* eslint-disable react/no-children-prop */
import React, { PureComponent } from 'react';
import {
  Row, Card, CardBody, Col, Button, ButtonToolbar, Spinner
} from 'reactstrap';
import TextField from '@material-ui/core/TextField';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { connect } from "react-redux";
import * as actions from '../../Store/actions/index';
import { Link } from 'react-router-dom';
import Particles from 'react-particles-js';
import PhoneInput from 'react-phone-number-input';
import { isValidNumber } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';
import PlacesAutocomplete, {
  geocodeByAddress,
} from 'react-places-autocomplete';
import MenuItem from '@material-ui/core/MenuItem';
import { Icon } from '@material-ui/core';
import ChangeAppLanguage from './Layout/ChangeAppLanguage';
import * as ChangeAppLanguageFront from './Layout/ChangeAppLanguageFront';
import TopbarLanguage from './Landing/components/TopbarLanguage';
let tlang = ChangeAppLanguageFront.translateLanguage;

const tooltip_remove = tlang('tooltip_remove')?tlang('tooltip_remove'):'Remove';
const Lang_Loadingtxt = tlang('Lang_Loadingtxt') ? tlang('Lang_Loadingtxt') : 'Loading...';

class Register extends PureComponent {

  static propTypes = {
    i18n: PropTypes.shape({ changeLanguage: PropTypes.func }).isRequired,
    t: PropTypes.func.isRequired
  };

  constructor() {
    super();
    this.state = {
      name: '',
      email: '',
      company_name: '',
      company_address: '',
      registration_country: '',
      contact_number: '',
      company_strength: '',
      profile_pics: [],
      files: [],
      error: [],
      loading: false,
      is_error: false,
      old_image: [],
      company_id: null,
      holdEmail: false,
      lang_code: localStorage.getItem('language') != "" ? localStorage.getItem('language') : 'en',
    };
  }

  changeLanguage = (lng) => {
    const { i18n } = this.props;
    i18n.changeLanguage(lng);
  };

  componentWillMount() {

    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    if (id) {
      this.setState({
        holdEmail: true
      })
      this.props.getCompanyRequestOnId(this.props.apolloClient.client, { companyid: id });
    }

    var email = url.searchParams.get("email");
    if (email) {
      this.setState({
        email: email,
        holdEmail: true
      })
    }

    let languagaeData = localStorage.getItem('language');
    this.changeLanguage(languagaeData);
  }

  componentWillReceiveProps(props) {
    
    if (props.userReducer.resendRequest && this.state.company_id == null) {
      let image = JSON.parse(props.userReducer.resendRequest.attachments);

      this.setState({
        name: props.userReducer.resendRequest.name,
        email: props.userReducer.resendRequest.email,
        company_name: props.userReducer.resendRequest.display_name,
        company_address: props.userReducer.resendRequest.company_address,
        registration_country: props.userReducer.resendRequest.registration_country,
        contact_number: props.userReducer.resendRequest.contact_number,
        company_strength: props.userReducer.resendRequest.company_strength,
        old_image: image,
        // profile_pics: image.filter(val => val.profile_pic),
        // files: image.filter(val => !val.profile_pic),
        error: [],
        loading: false,
        is_error: false,
        company_id: props.userReducer.resendRequest.company_id
      })
    }

    if (props.notification) {
      if(props.notification.success == false){
        this.setState({
          loading: false
        })
      }
    }    
  }

  resetFields = () => {
    this.setState({
      name: '',
      email: '',
      company_name: '',
      company_address: '',
      registration_country: '',
      contact_number: '',
      company_strength: '',
      profile_pics: [],
      files: [],
      error: [],
      is_error: false,
    })
  }

  validateSignupForm = () => {
    let error = [];
    // var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let validEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let alpha = /^[a-zA-ZÀ-ÿ\s-, ]+$/;  
    let alphaNumber = /^[a-zA-ZÀ-ÿ0-9\s, ]+$/;  
    let registeredEmail = this.state.email.trim();

    if (!this.state.name || !this.state.name.match(alpha)) {
      error.push('name')
    }
    if (!registeredEmail || !validEmail.test(String(registeredEmail).toLowerCase())) {
      error.push('email')
    }
    if (!this.state.company_name || !this.state.company_name.match(alphaNumber)) {
      error.push('company_name')
    }
    if (!this.state.company_address) {
      error.push('company_address')
    }
    if (!this.state.registration_country) {
      error.push('registration_country')
    }
    if (!this.state.contact_number || !isValidNumber(this.state.contact_number)) {
      error.push('contact_number')
    }
    if (!this.state.company_strength || isNaN(this.state.company_strength) || this.state.company_strength < 0) {
      error.push('company_strength')
    }
    if (this.state.profile_pics.length == 0 && !this.state.company_id) {
      error.push('profile_pics')
    }
    if (this.state.files.length == 0 && !this.state.company_id) {
      error.push('files')
    }

    this.setState({
      error: error,
      is_error: true
    })
    return error;
  }

  registerNewUserRequest = () => {
    let validateError = this.validateSignupForm();
    
    this.state.email = this.state.email.trim();
    
    if (validateError.length == 0) {

      if (this.state.company_id) {
        this.props.signUpUpdateRequest(this.props.apolloClient.client, this.state)
      } else {
        this.props.signUpRequest(this.props.apolloClient.client, this.state)
      }
      this.setState({
        loading: true
      })
    }
  }

  handleChange = (name) => event => {
    let value = event.target.value
    this.setState({
      [name]: name === "company_strength" ? (value > 1 ? value : 1) : value
    },
      () => {
        if (this.state.is_error) {
          this.validateSignupForm();
        }
      })
  }

  onProfileDrop = (file) => {
    this.setState({
      profile_pics: file.map(fl => Object.assign(fl, { preview: URL.createObjectURL(fl) }))
    },
      () => {
        if (this.state.is_error) {
          this.validateSignupForm();
        }
      });
  }

  removeProfileFile = (index, e) => {
    this.setState({
      profile_pics: this.state.profile_pics.filter((v, i) => index != i).map(fl => Object.assign(fl, { preview: URL.createObjectURL(fl) }))
    },
      () => {
        if (this.state.is_error) {
          this.validateSignupForm();
        }
      });
  }


  onDrop = (file) => {
    this.setState({
      files: this.state.files.concat(file.map(fl => Object.assign(fl, { preview: URL.createObjectURL(fl) })))
    },
      () => {
        if (this.state.is_error) {
          this.validateSignupForm();
        }
      });
  }

  removeFile = (index, e) => {
    this.setState({
      files: this.state.files.filter((v, i) => index != i).map(fl => Object.assign(fl, { preview: URL.createObjectURL(fl) }))
    },
      () => {
        if (this.state.is_error) {
          this.validateSignupForm();
        }
      });
  }

  cancelRegister = () => {
    //window.location = "/signin";
    this.props.history.push('/signin')
  }

  handlePhoneChange = phoneNo => {
    this.setState({
      contact_number: phoneNo,
    },
      () => {
        if (this.state.is_error) {
          this.validateSignupForm();
        }
      });
  };

  handleChangeaddress = (name) => value => {
    this.setState({
      [name]: value
    },
      () => {
        if (this.state.is_error) {
          this.validateSignupForm();
        }
      }
    )
  }

  handleSelect = address => {
    geocodeByAddress(address)
      .then(results => {
        var place = results[0];
        this.setState({
          company_address: place.formatted_address,
        })
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
          if (addressType) {
            if (addressType == "country") {
              var country = place.address_components[i].long_name;
              this.setState({
                registration_country: country
              })
            }
          }
        }
      })
      .catch(error => console.error('Error', error));
  };

  render() {
    const { t } = this.props;
    const { files, profile_pics } = this.state;

    const sign_in_up_signup = <ChangeAppLanguage lable_key="sign_in_up_signup" />;  
    const sign_in_up_start_business = <ChangeAppLanguage lable_key="sign_in_up_start_business" />;  

    const sign_in_up_from_company_name = <ChangeAppLanguage lable_key="sign_in_up_from_company_name" />;  
    const sign_in_up_from_company_address = <ChangeAppLanguage lable_key="sign_in_up_from_company_address" />;  
    const sign_in_up_from_registration_country = <ChangeAppLanguage lable_key="sign_in_up_from_registration_country" />;  
    const sign_in_up_form_name = <ChangeAppLanguage lable_key="sign_in_up_form_name" />; 
    
    
    const sign_in_up_from_email = <ChangeAppLanguage lable_key="sign_in_up_from_email" />;  
    const sign_in_up_from_company_strength = <ChangeAppLanguage lable_key="sign_in_up_from_company_strength" />;  
    const sign_in_up_from_company_logo = <ChangeAppLanguage lable_key="sign_in_up_from_company_logo" />;  
    const sign_in_up_from_drag_logo = <ChangeAppLanguage lable_key="sign_in_up_from_drag_logo" />;  
    const sign_in_up_from_remove = <ChangeAppLanguage lable_key="sign_in_up_from_remove" />;  
    const sign_in_up_from_upload_company_proof = <ChangeAppLanguage lable_key="sign_in_up_from_upload_company_proof" />; 

    const sign_in_up_from_upload_company_proof_note = <ChangeAppLanguage lable_key="sign_in_up_from_upload_company_proof_note" />;  
    const sign_in_up_from_drag_legal_docs = <ChangeAppLanguage lable_key="sign_in_up_from_drag_legal_docs" />;  
    const sign_in_up_from_submit = <ChangeAppLanguage lable_key="sign_in_up_from_submit" />;  
    const sign_in_up_from_cancel = <ChangeAppLanguage lable_key="sign_in_up_from_cancel" />;  
    const Signup_validate_entercmpname = <ChangeAppLanguage lable_key="Signup_validate_entercmpname" />;  
    const Signup_validate_entercmpaddress = <ChangeAppLanguage lable_key="Signup_validate_entercmpaddress" />;  
    const Signup_validate_enterregistrationcountry = <ChangeAppLanguage lable_key="Signup_validate_enterregistrationcountry" />; 

    const Signup_validate_enternameactmngr = <ChangeAppLanguage lable_key="Signup_validate_enternameactmngr" />;  
    const Signup_validate_enteremail = <ChangeAppLanguage lable_key="Signup_validate_enteremail" />;  
    const Signup_validate_entervalidmobileno = <ChangeAppLanguage lable_key="Signup_validate_entervalidmobileno" />;  
    const Signup_validate_entervalidcmpstrength = <ChangeAppLanguage lable_key="Signup_validate_entervalidcmpstrength" />;  
    const Signup_validate_enterprofilepic = <ChangeAppLanguage lable_key="Signup_validate_enterprofilepic" />;  
    const Signup_validate_enterfiles = <ChangeAppLanguage lable_key="Signup_validate_enterfiles" />;  
    const Signup_yourpastattachment = <ChangeAppLanguage lable_key="Signup_yourpastattachment" />;  

    const sign_in_up_from_mobile_phone = tlang('sign_in_up_from_mobile_phone')?tlang('sign_in_up_from_mobile_phone'):'Mobile Phone';
    
    return (
      <div>
        <Particles
          style={{ position: "absolute" }}
          params={{
            "particles": {
              "number": {
                "value": 70
              },
              "size": {
                "value": 5
              }
            },
            "interactivity": {
              "events": {
                "onhover": {
                  "enable": true,
                  "mode": "repulse"
                }
              }
            }
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
          <div className="wrapper margin-top-60">
            <main>
              <div className="account sign-in-backround">
                <div className="account__wrapper">
                  <div className="">
                    <Col md={12} lg={12} >
                      <Card>
                        <CardBody className="card-body-width">
                          <form className="material-form">
                            <Row className="register-row">
                              <Col md={12} lg={12} className="theme-light">
                                <div className="account__head">
                                  <h3 className="account__title">
                                  {/* <ChangeAppLanguage lable_key={t("sign_in_up.signup")} /> */}
                                    {sign_in_up_signup}
                                  </h3>
                                  <h4 className="account__subhead subhead">
                                    {sign_in_up_start_business}
                                  </h4>
                                </div>
                              </Col>
                              <Col xs={12} md={6} lg={6} xl={6} >

                                <div>
                                  <TextField
                                    required
                                    margin="dense"
                                    error={this.state.error.includes('company_name')}
                                    fullWidth
                                    label={sign_in_up_from_company_name}
                                    value={this.state.company_name}
                                    onChange={this.handleChange('company_name')}
                                  />
                                  {this.state.error.includes("company_name") &&
                                    <span class='error-message'>{Signup_validate_entercmpname}</span>
                                  }
                                </div>

                                <div>
                                  <PlacesAutocomplete
                                    value={this.state.company_address}
                                    onChange={this.handleChangeaddress('company_address')}
                                    onSelect={this.handleSelect}
                                    id="address"
                                    name="address"
                                    multiline
                                  >
                                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                      <React.Fragment>
                                        <TextField
                                          required
                                          fullWidth
                                          {...getInputProps({
                                            className: 'location-search-input',
                                          })}
                                          label={sign_in_up_from_company_address}
                                        />
                                        <div className="autocomplete-dropdown-container">
                                          {loading && <div>{Lang_Loadingtxt}</div>}
                                          {suggestions.map(suggestion => {
                                            const className = suggestion.active
                                              ? 'suggestion-item--active'
                                              : 'suggestion-item';
                                            // inline style for demonstration purpose
                                            const style = suggestion.active
                                              ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                              : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                            return (
                                              <div
                                                {...getSuggestionItemProps(suggestion, {
                                                  className,
                                                  style,
                                                })}
                                              >
                                                <MenuItem value={''}>{suggestion.description}</MenuItem>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </React.Fragment>
                                    )}
                                  </PlacesAutocomplete>
                                  {this.state.error.includes("company_address") &&
                                    <span class='error-message'>{Signup_validate_entercmpaddress}</span>
                                  }
                                </div>

                                <div>
                                  <TextField
                                    required
                                    margin="dense"
                                    error={this.state.error.includes('registration_country')}
                                    fullWidth
                                    label={sign_in_up_from_registration_country}
                                    value={this.state.registration_country}
                                    onChange={this.handleChange('registration_country')}
                                  />
                                  {this.state.error.includes("registration_country") &&
                                    <span class='error-message'>{Signup_validate_enterregistrationcountry}</span>
                                  }
                                </div>

                                <div>
                                  <TextField
                                    required
                                    margin="dense"
                                    fullWidth
                                    error={this.state.error.includes('name')}
                                    label={sign_in_up_form_name}
                                    value={this.state.name}
                                    onChange={this.handleChange('name')}
                                  />
                                  {this.state.error.includes("name") &&
                                    <span class='error-message'>{Signup_validate_enternameactmngr}</span>
                                  }
                                </div>
                                <div>
                                  <TextField
                                    required
                                    margin="dense"
                                    error={this.state.error.includes('email')}
                                    fullWidth
                                    label={sign_in_up_from_email}
                                    value={this.state.email}
                                    onChange={this.handleChange('email')}
                                    disabled={this.state.holdEmail}
                                  />
                                  {this.state.error.includes("email") &&
                                    <span class='error-message'>{Signup_validate_enteremail}</span>
                                  }
                                </div>
                                <div className="phone-input">
                                  <PhoneInput
                                    country="FR"
                                    placeholder={sign_in_up_from_mobile_phone}
                                    value={this.state.contact_number}
                                    onChange={phoneNo => this.handlePhoneChange(phoneNo)}
                                    className={`phoneInput ${this.state.phoneError ? 'text-danger' : ''}`}
                                  />
                                  {this.state.error.includes("contact_number") &&
                                    <span class='error-message'>{Signup_validate_entervalidmobileno}</span>
                                  }
                                </div>
                                <div>
                                  <TextField
                                    required
                                    margin="dense"
                                    error={this.state.error.includes('company_strength')}
                                    fullWidth
                                    type="number"
                                    margin="normal"
                                    inputProps = {{maxLength:5}}
                                    label={sign_in_up_from_company_strength}
                                    value={this.state.company_strength}
                                    onChange={this.handleChange('company_strength')}
                                  />
                                  {this.state.error.includes("company_strength") &&
                                    <span class='error-message'>{Signup_validate_entervalidcmpstrength}</span>
                                  }
                                </div>
                              </Col>
                              <Col xs={12} md={6} lg={6} xl={6} className={`theme-light border-left-signup`} >
                                {!this.state.company_id &&
                                  <Row>
                                    <Col xs={12} md={12} lg={12} xl={12} className={'dropdown-label-text-2'}>
                                      {sign_in_up_from_company_logo}{"*"}
                                    </Col>
                                    <Col xs={12} md={12} lg={12} xl={12}>
                                      <div className={`dropzone dropzone--single drop-signup-height`}>
                                        <Dropzone
                                          accept="image/jpeg, image/png"
                                          // name={name}
                                          multiple={false}
                                          onDrop={(fileToUpload) => {
                                            this.onProfileDrop(fileToUpload);
                                          }}
                                        >
                                          {({ getRootProps, getInputProps }) => (
                                            <div {...getRootProps()} className="dropzone__input drop-signup-height">
                                              {(!profile_pics || profile_pics.length === 0)
                                                && (
                                                  <div className="dropzone__drop-here ">
                                                    <span className="lnr lnr-upload" />
                                                    {sign_in_up_from_drag_logo}
                                                  </div>
                                                )}
                                              <input {...getInputProps()} />
                                            </div>
                                          )}
                                        </Dropzone>
                                        {profile_pics && Array.isArray(profile_pics) && profile_pics.length > 0
                                          && (
                                            <aside className="dropzone__img">
                                              <img src={profile_pics[0].preview} alt="drop-img" />
                                              <p className="dropzone__img-name">{profile_pics[0].name}</p>
                                              <button className="dropzone__img-delete" type="button" onClick={e => this.removeProfileFile(0, e)}>
                                                {sign_in_up_from_remove}
                                              </button>
                                            </aside>
                                          )}
                                      </div>
                                    </Col>
                                    {this.state.error.includes("profile_pics") &&
                                      <span class='img-error error-message'>{Signup_validate_enterprofilepic}</span>
                                    }
                                  </Row>
                                }
                                <Col xs={12} md={12} lg={12} xl={12} className={'dropdown-label-text-2'}>
                                  {sign_in_up_from_upload_company_proof}<br />
                                  {!this.state.company_id ?
                                    
                                    sign_in_up_from_upload_company_proof_note
                                    :
                                    ""
                                  }
                                </Col>
                                <Row>
                                  <Col xs={12} md={12} lg={12} xl={12} className={'dropdown-label-text'}>
                                    <div className={`dropzone dropzone--single drop-signup-height-2`}>
                                      <Dropzone
                                        accept="image/jpeg, image/png, .pdf, .ppt, .doc, .docx"
                                        multiple={true}
                                        onDrop={(fileToUpload) => {
                                          this.onDrop(fileToUpload);
                                        }}
                                      >
                                        {({ getRootProps, getInputProps }) => (
                                          <div {...getRootProps()} className="dropzone__input drop-signup-height-3">
                                            {(!files || files.length === 0)
                                              && (
                                                <div className="dropzone__drop-here">
                                                  <span className="lnr lnr-upload" /> 
                                                {sign_in_up_from_drag_legal_docs}
                                                </div>
                                              )}
                                            <input {...getInputProps()} />
                                          </div>
                                        )}
                                      </Dropzone>
                                      {files && Array.isArray(files) && files.length > 0
                                        && (
                                          <>
                                            {files.map((val, index) => {
                                              return (
                                                <aside className="dropzone__img more-image" style={{ height: "60px !important", width: "60px !important" }}>
                                                  <Icon>file_copy</Icon>
                                                  <p >{val.name}</p>
                                                  <button className="dropzone__img-delete" type="button" onClick={e => this.removeFile(index, e)}>
                                                    {tooltip_remove}
                                                  </button>
                                                </aside>
                                              )
                                            })}
                                          </>
                                        )}
                                    </div>
                                  </Col>
                                  {this.state.error.includes("files") &&
                                    <span class='img-error error-message'>{Signup_validate_enterfiles}</span>
                                  }
                                </Row>
                                <Row>
                                <h5 style={{ textAlign: "center", width: "100%", marginTop: "20px" }}>{Signup_yourpastattachment} {"*"}</h5>
                                  {this.state.old_image.map(val => {
                                    let key = Object.keys(val);
                                    return (
                                      <Col xs={12} md={12} lg={12} xl={12} style={{ textAlign: "center" }}>
                                        <a href={val[key]} target="_blank">{key}</a>
                                      </Col>
                                    )
                                  })}
                                </Row>
                              </Col>
                              <Col xs={12} md={6} lg={6} xl={6} className={`theme-light`}>
                                <ButtonToolbar className="form__button-toolbar">
                                  <Button color="success" style={{ width: "47%" }} outline={true}  type="button" onClick={this.cancelRegister}>
                                    {sign_in_up_from_cancel}
                                  </Button>

                                  <Button color="success" style={{ width: "47%" }} type="button" onClick={() => this.registerNewUserRequest()}>
                                    {sign_in_up_from_submit}
                                    {this.state.loading ? <Spinner size="sm" style={{ marginLeft: "10px", color: "#fff" }} /> : null}
                                  </Button>
                                </ButtonToolbar>

                                {/* <div className="account__btns">
                                    <Button  className="btn account__btn system-btn" style={{ marginRight: "5px" }}  onClick={this.cancelRegister} color="success" outline={true}  type="button"  >
                                      {sign_in_up_from_cancel}
                                    </Button>

                                    <button style={{ marginRight: "5px" }} onClick={() => this.registerNewUserRequest()} className="btn btn-success account__btn system-btn" type="button"  >
                                      {sign_in_up_from_submit}
                                      {this.state.loading ? <Spinner size="sm" style={{ marginLeft: "10px", color: "#fff" }} /> : null}
                                    </button>     
                                </div> */}

                              </Col>
                            </Row>
                          </form>
                        </CardBody>
                      </Card>
                    </Col >
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

Register.propTypes = {
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    authReducer: state.authReducer,
    apolloClient: state.apolloClient,
    notification: state.notification,
    userReducer: state.userReducer
  }
}

const mapDispatchToProps = dispatch => {
  return {
    signUpRequest: (client, request) => { dispatch(actions.signUpRequest(client, request)) },
    signUpUpdateRequest: (client, request) => { dispatch(actions.signUpUpdateRequest(client, request)) },
    getCompanyRequestOnId: (client, request) => { dispatch(actions.getCompanyRequestOnId(client, request)) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('common')(Register));
