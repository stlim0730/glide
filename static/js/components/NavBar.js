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
            {
              label: 'Clone Repository...',
              targetModal: '#clone-repository-modal',
              disabled: false
            },
            {
              slug: 'closeRepository',
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

  render () {
    let menu = this.state.menu.map(function(menuItem, index){
      return <NavMenuList key={'menuItem_' + index} label={menuItem.label} disabled={menuItem.disabled} children={menuItem.children} />;
    });

    return (
      <div className="navbar navbar-inverse navbar-fixed-top">
        <form>
          <div className="container">
            <div className="navbar-header">
              <a href="../" className="navbar-brand">Glide</a>
              <button className="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
            </div>
  
            <div className="navbar-collapse collapse" id="navbar-main">
              <ul className="nav navbar-nav">

                { menu }
                
              </ul>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default NavBar
