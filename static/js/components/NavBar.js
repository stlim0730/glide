import NavMenuList from './NavMenuList.js';

// 
// NavBar component
// 
class NavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      commit: null,
      menu: [
        {
          // slug: 'projects',
          label: 'Repository',
          disabled: false,
          children: [
            // {
            //   slug: 'browseProjects',
            //   label: 'Browse Projects...',
            //   targetModal: '#browse-projects-modal',
            //   disabled: false
            // },
            // {
            //   slug: 'createProject',
            //   label: 'Create New...',
            //   targetModal: '#create-project-modal',
            //   disabled: false
            // },
            // {
            //   label: 'Clone Repository...',
            //   targetModal: '#clone-repository-modal',
            //   disabled: false
            // },
            {
              // slug: 'closeRepository',
              label: 'Close',
              disabled: true
            }
          ]
        },
        {
          // slug: 'templates',
          label: 'Templates',
          disabled: false,
          children: [
            {
              slug: 'browseTemplates',
              label: 'Browse Templates...',
              disabled: false
            }
          ]
        }
      ]
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
      repository: nextProps.repository,
      branch: nextProps.branch,
      commit: nextProps.commit
    });
  }

  render () {
    let menu = this.state.menu.map(function(item, index){
      return (
        <NavMenuList
          key={index} label={item.label}
          disabled={item.disabled} children={item.children} />
      );
    });

    let gitToolBar;

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          
          <a className="navbar-brand" href="../">GLIDE</a>
          <button className="navbar-toggler"
            type="button" data-toggle="collapse"
            data-target="#nav-menus">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="nav-menus">
            
            <ul className="navbar-nav mr-auto">

              {
                this.props.app.state.repository &&
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                    Repository: {this.props.app.state.repository.name} <span className="caret"></span>
                  </a>
  
                  <div className="dropdown-menu">
                    <a className="dropdown-item" href="#">
                      Close
                    </a>
                  </div>
                </li>
              }

              {
                this.props.app.state.branch &&
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                    Branch: {this.props.app.state.branch.name} <span className="caret"></span>
                  </a>
  
                  <div className="dropdown-menu">
                    <a className="dropdown-item" href="#">
                      Close
                    </a>
                  </div>
                </li>
              }

            </ul>

            {
              // this.state.commit &&
              // <GitToolBar />
            }

            <form className="form-inline my-2 my-lg-0">
              <input
                className="form-control mr-sm-2"
                type="search"
                placeholder="Search" />
              <button
                className="btn btn-secondary my-2 my-sm-0"
                type="submit">
                Search
              </button>
            </form>

          </div>

        </div>
      </nav>
    );
  }
}

export default NavBar;
