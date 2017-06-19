// 
// Load CSS
// 
import bootstrap_style from '../css/bootstrap/bootstrap.css';
import custom_style from '../css/style.css';

//
// Load Javascript libraries
//   Some JS plugins have been loaded by ProvidePlugin settings from config
//
import './lib/bootstrap/bootstrap.min.js';

// 
// Load components
// 
import NavBar from './components/NavBar.js';
import Modal from './components/Modal.js';
import CreateProjectModalContent from './components/CreateProjectModalContent.js';
import BrowseProjectsModalContent from './components/BrowseProjectsModalContent.js';
import ProjectToolBar from './components/ProjectToolBar.js';
import FileSideBar from './components/FileSideBar.js';
import EditorPane from './components/EditorPane.js';
import RuntimePane from './components/RuntimePane.js';

// 
// App component
// 
class App extends React.Component {

  constructor(props) {
    super(props);

    // Can't use this.setState() before it's mounted.
    this.state = {
      constants: {
        APP_PHASE_CLEAN_SLATE: 'clean_slate',
        APP_PHASE_PROJECT_OPEN: 'project_open',
        APP_PHASE_BRANCH_OPEN: 'branch_open',
        APP_PHASE_COMMIT_OPEN: 'commit_open',
        APP_PHASE_LOADING: 'loading'
      },

      phase: 'clean_slate',
      projects: [],
      project: null,
      branches: [],
      branch: null,
      commits: [],
      commit: null,
      filesOpened: [],
      fileActive: null
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.project != this.state.project) {
      this.setState({
        filesOpened: [],
        fileActive: null
      });
    }
    else if(prevState.fileActive != this.state.fileActive) {
      
    }
  }

  render() {
    console.info('App', this.state);

    let modals = (
      <div>
        <Modal id="create-project-modal" modalContent={<CreateProjectModalContent themeCols={3} app={this} />} large={true} />
        <Modal id="browse-projects-modal" modalContent={<BrowseProjectsModalContent app={this} projects={this.state.projects}/>} large={true} />
      </div>
    );

    switch(this.state.phase) {
      case this.state.constants.APP_PHASE_CLEAN_SLATE:

        return (
          <div className="row full-height">
            <NavBar />
            {modals}
          </div>
          // <StartPanel />
        );

      case this.state.constants.APP_PHASE_PROJECT_OPEN:
      case this.state.constants.APP_PHASE_BRANCH_OPEN:
        return (
          <div className="row full-height">
            <NavBar />
            {modals}
            <ProjectToolBar
              app={this}
              project={this.state.project}
              branches={this.state.branches}
              branch={this.state.branch}
              commits={this.state.commits}
              commit={this.state.commit} />
          </div>
        );

      case this.state.constants.APP_PHASE_COMMIT_OPEN:
        return (
          <div className="row full-height">
            <NavBar />
            {modals}
            <ProjectToolBar
              app={this}
              project={this.state.project}
              branches={this.state.branches}
              branch={this.state.branch}
              commits={this.state.commits}
              commit={this.state.commit} />
            <FileSideBar app={this} project={this.state.project} branch={this.state.branch} />
            <EditorPane app={this} fileActive={this.state.fileActive} filesOpened={this.state.filesOpened} />
            <RuntimePane app={this} />
          </div>
        );

      case this.state.constants.APP_PHASE_LOADING:
        return (
          <div>
            <NavBar />
            {modals}
          </div>
        );
      
      default:
        return (
          <div>WHERE ARE YOU GOING?</div>
        );
    }
  }
}

ReactDOM.render(<App />, $('#content')[0]);
