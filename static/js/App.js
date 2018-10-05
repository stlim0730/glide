// 
// Load CSS
// 
import bootstrap_style from '../css/bootstrap/bootstrap.css';
import icon_style from '../css/icon/icon.min.css';
import s_alert_style from '../css/s-alert/s-alert-default-customized.css';
import s_alert_stackslide_effect_style from '../css/s-alert/s-alert-effect-stackslide-customized.css';
import custom_style from '../css/style.css';
import glide_logo_style from '../css/glide-icon.css';

//
// Load Javascript libraries
//   Some JS plugins have been loaded by ProvidePlugin settings from config
//
import './lib/bootstrap/bootstrap.min.js';

// 
// Load custom components
// 
import NavBar from './components/NavBar.js';
import Modal from './components/Modal.js';
// import CreateBranchModalContent from './components/CreateBranchModalContent.js';
// import GitStatusModalContent from './components/GitStatusModalContent.js';
// import GitCommitPushModalContent from './components/GitCommitPushModalContent.js';
// import GitPullRequestModalContent from './components/GitPullRequestModalContent.js';
// import GitResetModalContent from './components/GitResetModalContent.js';
import CreateFileModalContent from './components/CreateFileModalContent.js';
import FileManipulationModalContent from './components/FileManipulationModalContent.js';
import RepositoryPane from './components/RepositoryPane.js';
import BranchPane from './components/BranchPane.js';
import WorkspacePane from './components/WorkspacePane.js';
import CommitPushPane from './components/CommitPushPane.js';
import PullRequestPane from './components/PullRequestPane.js';
import LoadingPane from './components/LoadingPane.js';

// 
// App component
// 
class App extends React.Component {

  constructor(props) {
    super(props);

    // Can't use this.setState() before it's mounted.
    this.state = {
      constants: {
        APP_PHASE_CLEAN_SLATE: 100,
        APP_PHASE_REPOSITORY_SELECTION: 200,
        APP_PHASE_BRANCH_SELECTION: 300,
        APP_PHASE_COMMIT_OPEN: 400,
        APP_PHASE_COMMIT_AND_PUSH: 500,
        APP_PHASE_PULL_REQUEST: 600
      },

      phase: 100,
      repositories: [],
      repository: null,
      branches: [],
      branch: null,
      commits: [],
      commit: null,
      initialCommit: null,
      tree: null,
      recursiveTree: null,
      fileManipulation: null,
      fileToManipulate: null,
      fileManipulationTarget: null,
      filesOpened: [],
      fileActive: null,
      editorExpanded: null,
      addedFiles: [],
      changedFiles: [],
      removedFiles: [],
      editorChangesSaved: null,
      rendererUpdated: null,
      loadingMessages: {}
    };
  }

  render() {
    console.debug('App', this.state);

    let navbar = (
      <NavBar
        app={this}
        phase={this.state.phase}
        repository={this.state.repository}
        branch={this.state.branch}
        commit={this.state.commit}
        changedFiles={this.state.changedFiles}
        addedFiles={this.state.addedFiles} />
    );

    let modals = (
      <div>
        <Modal id="create-file-modal"
          modalContent={
            <CreateFileModalContent
              app={this}
              repository={this.state.repository}
              branch={this.state.branch}
              tree={this.state.tree}
              recursiveTree={this.state.recursiveTree} />
          }
          large={false} />
        <Modal id="file-manipulation-modal"
          modalContent={
            <FileManipulationModalContent
              app={this}
              repository={this.state.repository}
              branch={this.state.branch}
              tree={this.state.tree}
              recursiveTree={this.state.recursiveTree}
              fileManipulation={this.state.fileManipulation}
              fileToManipulate={this.state.fileToManipulate}
              fileManipulationTarget={this.state.fileManipulationTarget} />
          }
          large={false} />
      </div>
    );

    switch(this.state.phase) {
      case this.state.constants.APP_PHASE_CLEAN_SLATE:

        return (
          <div>
            {navbar}
            {modals}
            <LoadingPane
              messages={this.state.loadingMessages} />
          </div>
        );

      case this.state.constants.APP_PHASE_REPOSITORY_SELECTION:

        return (
          <div>
            {navbar}
            {modals}
            <RepositoryPane app={this} />
            <LoadingPane
              messages={this.state.loadingMessages} />
          </div>
        );

      case this.state.constants.APP_PHASE_BRANCH_SELECTION:

        return (
          <div>
            {navbar}
            {modals}
            <BranchPane
              app={this}
              repository={this.state.repository}
              branches={this.state.branches}
              branch={this.state.branch} />
            <LoadingPane
              messages={this.state.loadingMessages} />
          </div>
        );

      case this.state.constants.APP_PHASE_COMMIT_OPEN:
        
        return (
          <div style={{height: '95vh'}}>
            {navbar}
            {modals}
            <WorkspacePane
              app={this}
              repository={this.state.repository}
              branches={this.state.branches}
              branch={this.state.branch}
              commits={this.state.commits}
              commit={this.state.commit}
              tree={this.state.tree}
              recursiveTree={this.state.recursiveTree}
              addedFiles={this.state.addedFiles}
              changedFiles={this.state.changedFiles}
              removedFiles={this.state.removedFiles}
              editorChangesSaved={this.state.editorChangesSaved}
              rendererUpdated={this.state.rendererUpdated}
              fileActive={this.state.fileActive}
              filesOpened={this.state.filesOpened}
              editorExpanded={this.state.editorExpanded} />
            <LoadingPane
              messages={this.state.loadingMessages} />
          </div>
        );

      case this.state.constants.APP_PHASE_COMMIT_AND_PUSH:
        return (
          <div>
            {navbar}
            {modals}
            <CommitPushPane
              app={this}
              repository={this.state.repository}
              branches={this.state.branches}
              branch={this.state.branch}
              commit={this.state.commit}
              tree={this.state.tree}
              recursiveTree={this.state.recursiveTree} />
            <LoadingPane
              messages={this.state.loadingMessages} />
          </div>
        );

      case this.state.constants.APP_PHASE_PULL_REQUEST:
        return (
          <div>
            {navbar}
            {modals}
            <PullRequestPane
              app={this}
              repository={this.state.repository}
              branches={this.state.branches}
              branch={this.state.branch}
              commit={this.state.commit} />
            <LoadingPane
              messages={this.state.loadingMessages} />
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
$('[data-toggle="popover"]').popover();
