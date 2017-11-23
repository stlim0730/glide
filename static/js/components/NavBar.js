import NavMenuList from './NavMenuList.js';

// 
// NavBar component
// 
class NavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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

  render () {
    let menu = this.state.menu.map(function(menuItem, index){
      return <NavMenuList key={'menuItem_' + index} label={menuItem.label} disabled={menuItem.disabled} children={menuItem.children} />;
    });

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
              {menu}
            </ul>

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
