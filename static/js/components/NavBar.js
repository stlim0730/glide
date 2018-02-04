import breadcrumb_style from '../../css/breadcrumb.css';
import NavBreadCrumbListItem from './NavBreadCrumbListItem.js';
// import NavMenuList from './NavMenuList.js';

// 
// NavBar component
// 
class NavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      phase: null,
      repository: null,
      branch: null
    };
  }
  
  componentDidMount() {
    let app = this.props.app;
    if(app.state.phase == app.state.constants.APP_PHASE_CLEAN_SLATE) {
      app.setState({
        phase: app.state.constants.APP_PHASE_REPOSITORY_SELECTION
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      phase: nextProps.phase,
      repository: nextProps.repository,
      branch: nextProps.branch
    });
  }

  render () {
    let logoutUrl = this.state.repository && this.state.branch && window.glide.username ?
        '/user/logout/' + this.state.repository.full_name + '/' + this.state.branch.name :
        '/user/logout';
    let app = this.props.app;

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary"
        style={{paddingTop:0, paddingBottom:0}}>
        <div className="container">
          
          <a className="navbar-brand" href="../"
            style={{fontFamily: 'Jura', letterSpacing: 3, fontWeight: 'bold'}}>
            <i className="icon-glide"></i> <strong>GLIDE</strong>
          </a>

          <button className="navbar-toggler"
            type="button" data-toggle="collapse"
            data-target="#nav-menus">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className='breadcrumbs'>
            <div className='inner'>
              <ul className='cf'>
                <NavBreadCrumbListItem
                  phase={app.state.constants.APP_PHASE_REPOSITORY_SELECTION}
                  activePhase={this.state.phase}
                  label='Clone' />
                <NavBreadCrumbListItem
                  phase={app.state.constants.APP_PHASE_BRANCH_SELECTION}
                  activePhase={this.state.phase}
                  label='Branch' />
                <NavBreadCrumbListItem
                  phase={app.state.constants.APP_PHASE_COMMIT_OPEN}
                  activePhase={this.state.phase}
                  label='Code & Test' />
                <NavBreadCrumbListItem
                  phase={app.state.constants.APP_PHASE_COMMIT_AND_PUSH}
                  activePhase={this.state.phase}
                  label='Commit & Push' />
                <NavBreadCrumbListItem
                  phase={app.state.constants.APP_PHASE_PULL_REQUEST}
                  activePhase={this.state.phase}
                  label='Make Pull Request' />
              </ul>
            </div>
          </div>

          <div className="collapse navbar-collapse" id="nav-menus">
            
            {
              // <ul className="navbar-nav mr-auto">
            
              //   {
              //     this.props.app.state.repository &&
              //     <li className="nav-item dropdown">
              //       <a className="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown">
              //         Repository: {this.props.app.state.repository.name} <span className="caret"></span>
              //       </a>
    
              //       <div className="dropdown-menu">
              //         <a className="dropdown-item" href="#">
              //           Close
              //         </a>
              //       </div>
              //     </li>
              //   }
  
              //   {
              //     this.props.app.state.branch &&
              //     <li className="nav-item dropdown">
              //       <a className="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown">
              //         Branch: {this.props.app.state.branch.name} <span className="caret"></span>
              //       </a>
    
              //       <div className="dropdown-menu">
              //         <a className="dropdown-item" href="#">
              //           Close
              //         </a>
              //       </div>
              //     </li>
              //   }
  
              // </ul>
            }

            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="#">About<span className="sr-only"></span></a>
              </li>
              <li className="nav-item">
                {
                  window.glide.username &&
                  window.glide.csrfToken &&
                  window.glide.accessToken &&
                  <a className="nav-link toggle-github" href={logoutUrl}>
                    <i className="sign out icon"></i>Sign Out
                    <span className="sr-only"></span>
                  </a>
                }
              </li>
            </ul>

          </div>

        </div>
      </nav>
    );
  }
}

export default NavBar;
