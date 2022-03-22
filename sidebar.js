import React, { PureComponent } from 'react';
import Scrollbar from 'react-smooth-scrollbar';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { Collapse } from 'reactstrap';
import ListRoutesAdmin from '../../../Common/SuperAdminMenu';
import ListClientRoutes from '../../../Common/clientMenu';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { withTranslation } from 'react-i18next';
import { Icon } from '@material-ui/core';
import * as actions from '../../../Store/actions/index';
//import ChangeAppLanguage from "../Layout/ChangeAppLanguage";
import { IconButton } from '@material-ui/core';
import { Route, Switch, withRouter } from "react-router-dom";
import * as changeLanguage1 from '../Layout/ChangeAppLanguageFront';


class Sidebar extends PureComponent {

  static propTypes = {
    i18n: PropTypes.shape({ changeLanguage: PropTypes.func }).isRequired,
    t: PropTypes.func.isRequired
  };

  constructor() {
    super();
    this.state = {
      collapse: null,
      isclosed: false,
      hideMenuForClosedProject: [
        "/client/newCampaign",
        "/client/newProbing",
        "/client/excelSettings",
        "/client/excelUpload"
      ],
      totalCampaign: 0,
    };
  }

  componentDidMount() {

    /* get campaign list */
    if (this.props.authReducer.userData.projectid && this.props.authReducer.userData.company_name) {
      let isadmin = this.props.authReducer.userData.email == this.props.authReducer.userData.owner ? true : false;
      let request = {
        companyname: this.props.authReducer.userData.company_name,
        projectid: this.props.authReducer.userData.projectid,
        other_company: this.props.authReducer.userData.other_company,
        isadmin: isadmin,
      };
      this.props.getCampaignList(this.props.apolloClient.campaign, request);
    }

  }


  componentWillReceiveProps(props) {
    if (props.authReducer.companyList && props.authReducer.companyList.length > 0) {
      let activeProject = props.authReducer.companyList.filter((val) => val.projectid === this.props.authReducer.userData.projectid)
      if (activeProject.length > 0) {
        this.setState({
          isclosed: activeProject[0].isclosed ? activeProject[0].isclosed : false
        })
      }
    }


    if (props.campaignReducer.campaignDetails) {

      /* set campaingcampaign list*/
      if (props.campaignReducer.campaignList) {
        let campaignListArray = props.campaignReducer.campaignList;
        let totalCampaign = campaignListArray.length;
        this.setState({ totalCampaign: totalCampaign });
      }
    }

  }
  //toggle sub menu
  toggle = (index) => {
    const { collapse } = this.state;
    if (collapse == index) {
      index = null;
    }
    this.setState({ collapse: index });
  };

  setUrl = () => {
    if (window.location.pathname === "/client/probingList") {
      this.props.setCurrentUrl(true);
    }

    if (window.location.pathname === "/client/newProbing") {
      this.props.setCurrentUrl(true);
    }
  }

  // this will render admin menu ( IN PROGRESS )
  renderMenu = () => {
    const { collapse } = this.state;
    const { t } = this.props;
    let projectId = this.props.authReducer.userData.projectid;

    let tarn1 = changeLanguage1.translateLanguage;
    // console.log("Userdata = ", this.props.authReducer.userData);
    if (this.props.authReducer.userData.staffuser) {
      return ListRoutesAdmin.map((row, index) => {
        let r = 0;
        // if menu have child menu
        if (row.hasChild) {

          {
            row.child.map((childRow, index) => {
              if (childRow.key == 'all' || this.props.authReducer.userData.accesspages[childRow.key].status) {
                r = 1;
              }
            })
          }

          if (r == 1) {
            return (
              <div key={index} className={classNames({
                'sidebar__category-wrap': true,
                'sidebar__category-wrap--open': collapse == index ? true : false,
              })}>
                <button className="sidebar__link sidebar__category" type="button" onClick={() => this.toggle(index)}>
                  <span className={`sidebar__link-icon lnr lnr-${'layers'}`} />
                  <p className="sidebar__link-title" style={{ left: "20px" }}>
                    <Icon className="menu-icon-size margin-right-menu">{row.icon}</Icon>
                    {tarn1(row.label)}
                  </p>
                  <span className="sidebar__category-icon lnr lnr-chevron-right" />
                </button>
                <Collapse isOpen={collapse == index} className="sidebar__submenu-wrap">
                  <ul className="sidebar__submenu">
                    <div>
                      {row.child.map((childRow, index) => {
                        if (childRow.key == 'all' || this.props.authReducer.userData.accesspages[childRow.key].status) {
                          return (
                            <NavLink
                              key={index}
                              to={childRow.to}
                              activeClassName="sidebar__link-active"
                            >
                              <li className="sidebar__link" >
                                <Icon className="menu-icon-size">{childRow.icon}</Icon>
                                <p className="sidebar__link-title sub-menu-title" onClick={() => this.setUrl()}>
                                  {tarn1(childRow.label)}
                                </p>
                              </li>
                            </NavLink>
                          )
                        }
                      })}
                    </div>
                  </ul>
                </Collapse>
              </div>
            )
          }
        } else {
          //if (row.key == 'all' || this.props.authReducer.userData.accesspages[row.key].status) {

          if (row.key == 'all' || (this.props.authReducer.userData.accesspages[row.key] != undefined && this.props.authReducer.userData.accesspages[row.key].status && (typeof row.label != 'undefined'))) {
            var url_string = this.props.history.location.pathname        
            return (
              <NavLink
                key={index}
                to={row.to}
                activeClassName={url_string === row.to ?"sidebar__link-active":""}
              >
                <li className="sidebar__link" onClick={() => this.toggle(null)}>
                  <Icon className="menu-icon-size">{row.icon}</Icon>
                  <p className="sidebar__link-title">
                    {/* <ChangeAppLanguage lable_key={row.label} /> */}
                    {tarn1(row.label)}
                  </p>
                </li>
              </NavLink>
            )
          }
          //}
        }
      });
    } else {

      if (!this.props.authReducer.userData.confirm_account) {
        return (
          <NavLink
            key={0}
            to={'/'}
            activeClassName="sidebar__link-active"
          >
            <li className="sidebar__link" onClick={() => this.toggle(null)}>
              <Icon className="menu-icon-size">store</Icon>
              <p className="sidebar__link-title">
                {t("clienmenu.signup")}
              </p>
            </li>
          </NavLink>
        )
      } else {
        return ListClientRoutes.filter(row => !row.isProject || (row.isProject && projectId)).map((row, index) => {
          let displayparent = false;
          // if menu have child menu
          if (row.hasChild) {
            row.child.map((childRow, index) => {
              if (childRow.key == 'all' || (this.props.authReducer.userData.useraccesspage && this.props.authReducer.userData.useraccesspage[childRow.key])) {
                displayparent = true
              }
            })

            if (displayparent) {
              return (
                <div key={index} className={classNames({
                  'sidebar__category-wrap': true,
                  'sidebar__category-wrap--open': collapse == index ? true : false,
                })}>
                  <button className="sidebar__link sidebar__category" type="button" onClick={() => this.toggle(index)}>
                    <span className={`sidebar__link-icon lnr lnr-${'layers'}`} />
                    <p className="sidebar__link-title" style={{ left: "20px" }}>
                      <Icon className="menu-icon-size margin-right-menu">{row.icon}</Icon>
                      {tarn1(row.label)}
                    </p>
                    <span className="sidebar__category-icon lnr lnr-chevron-right" />
                  </button>
                  <Collapse isOpen={collapse == index} className="sidebar__submenu-wrap">
                    <ul className="sidebar__submenu">
                      <div>
                        {row.child.map((childRow, index) => {
                          if (((childRow.isProject !== undefined) && projectId) || (childRow.isProject == undefined)) {
                            //if ((childRow.key == 'all' || (this.props.authReducer.userData.useraccesspage[childRow.key])) && (typeof childRow.label != 'undefined')) {
                            if (typeof childRow.label != 'undefined') {
                              if ((!this.state.isclosed) || (this.state.isclosed && !this.state.hideMenuForClosedProject.includes(childRow.to))) {
                                //if(childRow.key != "campaign_management"){
                                return (
                                  <NavLink
                                    key={index}
                                    to={childRow.to}
                                    activeClassName="sidebar__link-active"
                                  >
                                    <li className="sidebar__link">
                                      <Icon className="menu-icon-size">{childRow.icon}</Icon>
                                      <p className="sidebar__link-title sub-menu-title" onClick={() => this.setUrl()}>
                                        {/* <ChangeAppLanguage lable_key={childRow.label} /> */}
                                        {tarn1(childRow.label)}
                                      </p>
                                    </li>
                                  </NavLink>
                                )
                                //}
                              }
                            }
                          }
                        })}
                      </div>
                    </ul>
                  </Collapse>
                </div>
              )
            }
          } else {
            if ((row.key == 'all' || (this.props.authReducer.userData.useraccesspage && this.props.authReducer.userData.useraccesspage[row.key])) && (typeof row.label != 'undefined')) {
              return (
                <NavLink
                  key={index}
                  to={row.to}
                  activeClassName="sidebar__link-active"
                >
                  <li className="sidebar__link" onClick={() => this.toggle(null)}>
                    <Icon className="menu-icon-size">{row.icon}</Icon>
                    <p className="sidebar__link-title">
                      {tarn1(row.label)}
                    </p>
                  </li>
                </NavLink>
              )
            }
          }
        })
      }
    }
  }

  render() {
    return (
      // use this two class sidebar--show , sidebar--collapse
      <div className="sidebar" id="sidebar">
        <button className="sidebar__back" type="button" />
        <Scrollbar className="sidebar__scroll scroll">
          <div className="sidebar__wrapper sidebar__wrapper--desktop">
            <div className="sidebar__content">
              {!this.props.showMenu &&
                <IconButton aria-label="menu" onClick={this.props.toggleMenu}
                  style={{ padding: "6px", }} className="float-right mr-2 p-md-2">
                  <Icon >menu</Icon>
                </IconButton>
              }
              <ul className="sidebar__block">
                {this.renderMenu()}
              </ul>
            </div>
          </div>
          <div className="sidebar__wrapper sidebar__wrapper--mobile">

          </div>
        </Scrollbar>
      </div>
    );
  }
}


Sidebar.propTypes = {
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    authReducer: state.authReducer,
    apolloClient: state.apolloClient,
    commonReducer: state.commonReducer,
    campaignReducer: state.campaignReducer,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setCurrentUrl: (data) => { dispatch(actions.setCurrentUrl(data)) },
    getCampaignList: (client, request) => { dispatch(actions.getCampaignList(client, request)); },
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withTranslation('common')(Sidebar)));