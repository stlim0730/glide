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
import CreateBranchModalContent from './components/CreateBranchModalContent.js';
import GitStatusModalContent from './components/GitStatusModalContent.js';
import GitCommitPushModalContent from './components/GitCommitPushModalContent.js';
import GitPullRequestModalContent from './components/GitPullRequestModalContent.js';
import GitResetModalContent from './components/GitResetModalContent.js';
import CreateFileModalContent from './components/CreateFileModalContent.js';
import RepositoryPane from './components/RepositoryPane.js';
import BranchPane from './components/BranchPane.js';
import WorkspacePane from './components/WorkspacePane.js';
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
        APP_PHASE_CLEAN_SLATE: 10,
        APP_PHASE_REPOSITORY_SELECTION: 20,
        APP_PHASE_BRANCH_SELECTION: 30,
        APP_PHASE_REPOSITORY_OPEN: 40,
        APP_PHASE_BRANCH_OPEN: 50,
        APP_PHASE_COMMIT_OPEN: 60,
        APP_PHASE_COMMIT_AND_PUSH: 70,
        APP_PHASE_PULL_REQUEST: 80
      },

      phase: 10,
      repositories: [],
      repository: null,
      branches: [],
      branch: null,
      commits: [],
      commit: null,
      initialCommit: null,
      tree: null,
      recursiveTree: null,
      scaffolds: [],
      scaffold: null,
      filesOpened: [],
      fileActive: null,
      changedFiles: [],
      addedFiles: [],
      loadingMessages: {}
    };
  }

  // componentDidUpdate(prevProps, prevState) {
    // if(prevState.repository != this.state.repository) {
    //   // When a new repository is opened,
    //   //   the substructures should reset
    //   // TODO: Check if the changedFiles is empty
    //   // TODO: Check if the addedFiles is empty
    //   this.setState({
    //     branches: [],
    //     branch: null,
    //     commits: [],
    //     commit: null,
    //     filesOpened: [],
    //     fileActive: null,
    //     changedFiles: [],
    //     addedFiles: [],
    //     liveYaml: null,
    //     liveHtml: null,
    //     liveBugs: []
    //   });
    // }
    // else if(prevState.branch != this.state.branch) {
    //   // When shifted to another branch,
    //   //   the substructures should reset
    //   // TODO: Check if the changedFiles is empty
    //   // TODO: Check if the addedFiles is empty
    //   this.setState({
    //     commits: [],
    //     commit: null,
    //     filesOpened: [],
    //     fileActive: null,
    //     changedFiles: [],
    //     addedFiles: [],
    //     liveYaml: null,
    //     liveHtml: null,
    //     liveBugs: []
    //   });
    // }
    // else if(this.state.commit && !this.state.commit.pushed && prevState.commit != this.state.commit) {
    //   // When checked out another commit,
    //   //   the substructures should reset
    //   // Commit & Push that forces to switch to the new commit
    //   //   shouldn't fall in this conditional block
    //   // TODO: Check if the changedFiles is empty
    //   // TODO: Check if the addedFiles is empty
    //   this.setState({
    //     filesOpened: [],
    //     fileActive: null,
    //     changedFiles: [],
    //     addedFiles: [],
    //     liveYaml: null,
    //     liveHtml: null,
    //     liveBugs: []
    //   });
    // }
  // }

  render() {
    console.debug('App', this.state);

    let navbar = (
      <NavBar
        app={this}
        phase={this.state.phase}
        repository={this.state.repository}
        branch={this.state.branch} />
    );

    let modals = (
      <div>
        {
          // <Modal id="create-branch-modal"
          //   modalContent={
          //     <CreateBranchModalContent
          //       app={this}
          //       commit={this.state.commit} />
          //   }
          //   large={false} />
        }
        <Modal id="create-file-modal"
          modalContent={
            <CreateFileModalContent
              app={this}
              repository={this.state.repository}
              branch={this.state.branch}
              tree={this.state.tree}
              recursiveTree={this.state.recursiveTree}
              scaffolds={this.state.scaffolds}
              scaffold={this.state.scaffold} />
          }
          large={false} />
        <Modal id="git-status-modal"
          modalContent={
            <GitStatusModalContent
              app={this}
              branch={this.state.branch}
              changedFiles={this.state.changedFiles}
              addedFiles={this.state.addedFiles} />
          }
          large={false} />
        <Modal id="git-commit-push-modal"
          modalContent={
            <GitCommitPushModalContent
              app={this}
              repository={this.state.repository}
              branch={this.state.branch}
              commits={this.state.commits}
              commit={this.state.commit}
              tree={this.state.tree}
              recursiveTree={this.state.recursiveTree}
              changedFiles={this.state.changedFiles}
              addedFiles={this.state.addedFiles} />
          }
          large={false} />
        <Modal id="git-pull-request-modal"
          modalContent={
            <GitPullRequestModalContent
              app={this}
              repository={this.state.repository}
              branch={this.state.branch}
              commit={this.state.commit} />
          }
          large={false} />
        <Modal id="git-reset-modal"
          modalContent={
            <GitResetModalContent
              app={this}
              commit={this.state.commit}
              changedFiles={this.state.changedFiles}
              addedFiles={this.state.addedFiles} />
          }
          large={false} />
        {/*<Modal id="create-project-modal" modalContent={<CreateProjectModalContent themeCols={3} app={this} />} large={true} />*/}
        {/*<Modal id="browse-projects-modal" modalContent={<BrowseProjectsModalContent app={this} projects={this.state.projects}/>} large={true} />*/}
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

      // case this.state.constants.APP_PHASE_REPOSITORY_OPEN:
      // case this.state.constants.APP_PHASE_BRANCH_OPEN:
      //   return (
      //     <div className="row full-height">
      //       <NavBar app={this} repository={this.state.repository} branch={this.state.branch} />
      //       {modals}
      //       <RepoToolBar
      //         app={this}
      //         repository={this.state.repository}
      //         branches={this.state.branches}
      //         branch={this.state.branch}
      //         commits={this.state.commits}
      //         commit={this.state.commit} />
      //     </div>
      //   );

      case this.state.constants.APP_PHASE_COMMIT_OPEN:
        
        return (
          <div className="full-height">
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
              changedFiles={this.state.changedFiles}
              addedFiles={this.state.addedFiles}
              fileActive={this.state.fileActive}
              filesOpened={this.state.filesOpened} />
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
