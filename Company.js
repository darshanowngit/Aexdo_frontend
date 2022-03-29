import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import * as actions from '../../Store/actions/index';
import { Spinner, Button } from 'reactstrap';
import Particles from 'react-particles-js';
import ChangeAppLanguage from './Layout/ChangeAppLanguage';
import * as ChangeAppLanguageFront from './Layout/ChangeAppLanguageFront';
let tlang  = ChangeAppLanguageFront.translateLanguage;
const go_to_dashboard =  tlang('go_to_dashboard')?tlang('go_to_dashboard'):'Go to Dashboard';
const common_company =  tlang('common_company')?tlang('common_company'):'Company';
const common_choose =  tlang('common_choose')?tlang('common_choose'):'Choose';
const topbar_link_logout = tlang('topbar_link_logout')?tlang('topbar_link_logout'):'Logout';
const please_wait_login_to_admin = tlang('please_wait_login_to_admin')?tlang('please_wait_login_to_admin'):'Please Wait, Login to Super Admin';
  
// Company slection component login step 2
class Company extends PureComponent {

  static propTypes = {
    i18n: PropTypes.shape({ changeLanguage: PropTypes.func }).isRequired,
    t: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    // init states
    this.state = {
      company: null,
      companyList: [],
      project: null,
      error: [],
      loading: false,
    };
    this.showPassword = this.showPassword.bind(this);
  }

  componentDidMount() {

    let companyList = JSON.parse(this.props.authReducer.userData.company_name);

    if (companyList.length == 1 && companyList[0] == "superadmin") {
      let req = {
        email: this.props.authReducer.userData.email,
        company: "superadmin",
        projectid: null
      }

      this.props.companyLogIn(this.props.apolloClient.client, req);
    }

    if (this.props.authReducer.userData) {
      this.setState({
        companyList
      })
    }
  }

  componentWillReceiveProps(props) {
    if (props.notification) {
      this.setState({
        loading: false
      })
    }
  }

  changeLanguage = (lng) => {
    const { i18n } = this.props;
    i18n.changeLanguage(lng);
  };

  componentWillMount() {
    let languagaeData = localStorage.getItem('language');
    this.changeLanguage(languagaeData);
  }

  showPassword(e) {
    e.preventDefault();
    this.setState(prevState => ({ showPassword: !prevState.showPassword }));
  }
  changeProject = () => event => {
    this.setState({
      project: event.target.value
    })
  }

  changeCompany = () => event => {
    this.setState({
      company: event.target.value
    })
    let request = {
      companyname: event.target.value,
      userid: this.props.authReducer.userData.userid,
    }
    this.props.getCompanyProjectList(this.props.apolloClient.client, request)
  }

  //login to perticular company or super admin section
  logInAccount = () => {

    let error = [];
    if (!this.state.company) {
      error.push('company')
    }

    if (error.length == 0) {
      this.setState({ error: [] })
      let req = {
        email: this.props.authReducer.userData.email,
        company: this.state.company,
        projectid: this.state.project
      }

      this.props.companyLogIn(this.props.apolloClient.client, req);
      this.setState({
        loading: true
      })
    } else {
      this.setState({ error: error })
    }

  }

  logoutUser = () => {
    // localStorage.clear();
    localStorage.removeItem("_user_");
    localStorage.removeItem("_userDetail_");
    window.location = "/signin";
  }


  render() {
    
    const { error } = this.state;
    const { t } = this.props;

    if(this.state.companyList.length == 1 && this.state.companyList[0] == "superadmin"){
      return <div style={{ position: "absolute", left:"30%", top:"40%", fontSize:"30px" }}>{please_wait_login_to_admin}<Spinner size="md" color="success"/></div>;
    }

    if(this.props.authReducer.companyList){
      this.props.authReducer.companyList.sort(function compare(a, b) {
        var dateA = new Date(a.startDate);
        var dateB = new Date(b.startDate);
        return dateB - dateA;
      })
    }

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
          <div className="wrapper">
            <main>
              <div className="account sign-in-backround">
                <div className="account__wrapper">
                  <div className="account__card sign-in-card">
                    <div className="account__head">
                      <h3 className="account__title">{common_choose}
                        <span className="account__logo"> {common_company} </span>
                      </h3>
                    </div>
                    <form className="form">
                      <div className="form__form-group mt-2">
                        <div className="form__form-group-field">
                          <form className="">
                            <div className="form__form-group">
                              <TextField
                                select
                                error={error.includes('company')}
                                id="standard-select-currency"
                                SelectProps={{
                                  MenuProps: {
                                    className: "select-menu-width",
                                  },
                                }}
                                style={{ width: "350px" }}
                                label={<ChangeAppLanguage lable_key="sign_in_up_company" />}
                                className="material-form__field"
                                value={this.state.company}
                                onChange={this.changeCompany()}
                                InputLabelProps={{ shrink: this.state.company ? true : false }}
                              >
                                {this.state.companyList.map(option => (
                                  <MenuItem key={option} value={option}>
                                    {option.split("_").join(" ")}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </div>
                            <div className="form__form-group">
                              <TextField
                                select
                                error={error.includes('project')}
                                id="standard-select-currency"
                                SelectProps={{
                                  MenuProps: {
                                    className: "select-menu-width",
                                  },
                                }}
                                style={{ width: "350px" }}
                                label={<ChangeAppLanguage lable_key="sign_in_up_project" />}
                                className="material-form__field"
                                value={this.state.project}
                                onChange={this.changeProject()}
                                InputLabelProps={{ shrink: this.state.project ? true : false }}
                              >
                                {this.props.authReducer.companyList && this.props.authReducer.companyList.map(option => (
                                  <MenuItem key={option} value={option.projectid}>
                                    {option.projectname}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </div>
                          </form>
                        </div>
                      </div>
                      <div className="account__btns">

                        <Button  className="btn account__btn system-btn" style={{ marginRight: "5px" }} color="success" outline={true}  type="button" onClick={e => this.logoutUser()} disabled={this.state.loading}>
                          {topbar_link_logout}
                        </Button>

                        <button style={{ marginRight: "5px" }} className="btn btn-success account__btn system-btn" type="button" onClick={e => this.logInAccount()} disabled={this.state.loading}>
                          {go_to_dashboard}
                          {this.state.loading ? <Spinner size="sm" style={{ marginLeft: "10px", color: "#fff" }} /> : null}
                        </button>                        
                      </div>
                    </form>
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

Company.propTypes = {
  t: PropTypes.func.isRequired,
};


//load reducers
const mapStateToProps = state => {
  return {
    authReducer: state.authReducer,
    apolloClient: state.apolloClient,
    notification: state.notification
  }
}

//Load actions
const mapDispatchToProps = dispatch => {
  return {
    companyLogIn: (client, request) => { dispatch(actions.companyLogIn(client, request)) },
    getCompanyProjectList: (client, request) => { dispatch(actions.getCompanyProjectList(client, request)) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('common')(Company)); // export component
