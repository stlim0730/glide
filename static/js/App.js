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
// import CloneRepoModalContent from './components/CloneRepoModalContent.js';
import CreateBranchModalContent from './components/CreateBranchModalContent.js';
import GitStatusModalContent from './components/GitStatusModalContent.js';
import GitCommitPushModalContent from './components/GitCommitPushModalContent.js';
import GitPullRequestModalContent from './components/GitPullRequestModalContent.js';
import GitResetModalContent from './components/GitResetModalContent.js';
import CreateNewFileModalContent from './components/CreateNewFileModalContent.js';
// import CreateProjectModalContent from './components/CreateProjectModalContent.js';
// import BrowseProjectsModalContent from './components/BrowseProjectsModalContent.js';
import RepoListPane from './components/RepoListPane.js';
import RepoToolBar from './components/RepoToolBar.js';
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
        APP_PHASE_REPOSITORY_SELECTION: 'repository_selection',
        APP_PHASE_REPOSITORY_OPEN: 'repository_open',
        APP_PHASE_BRANCH_OPEN: 'branch_open',
        APP_PHASE_COMMIT_OPEN: 'commit_open',
        APP_PHASE_LOADING: 'loading'
      },

      phase: 'clean_slate',
      repositories: [],
      repository: null,
      branches: [],
      branch: null,
      commits: [],
      commit: null,
      tree: null,
      recursiveTree: null,
      filesOpened: [],
      fileActive: null,
      changedFiles: [],
      addedFiles: [],
      liveYaml: null,
      liveHtml: null,
      liveBugs: []
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.repository != this.state.repository) {
      // When a new repository is opened,
      //   the substructures should reset
      // TODO: Check if the changedFiles is empty
      // TODO: Check if the addedFiles is empty
      this.setState({
        branches: [],
        branch: null,
        commits: [],
        commit: null,
        filesOpened: [],
        fileActive: null,
        changedFiles: [],
        addedFiles: [],
        liveYaml: null,
        liveHtml: null,
        liveBugs: []
      });
    }
    else if(prevState.branch != this.state.branch) {
      // When shifted to another branch,
      //   the substructures should reset
      // TODO: Check if the changedFiles is empty
      // TODO: Check if the addedFiles is empty
      this.setState({
        commits: [],
        commit: null,
        filesOpened: [],
        fileActive: null,
        changedFiles: [],
        addedFiles: [],
        liveYaml: null,
        liveHtml: null,
        liveBugs: []
      });
    }
    else if(this.state.commit && !this.state.commit.pushed && prevState.commit != this.state.commit) {
      // When checked out another commit,
      //   the substructures should reset
      // Commit & Push that forces to switch to the new commit
      //   shouldn't fall in this conditional block
      // TODO: Check if the changedFiles is empty
      // TODO: Check if the addedFiles is empty
      this.setState({
        filesOpened: [],
        fileActive: null,
        changedFiles: [],
        addedFiles: [],
        liveYaml: null,
        liveHtml: null,
        liveBugs: []
      });
    }
  }

  render() {
    console.info('App', this.state);

    let modals = (
      <div>
        {
          // <Modal id="clone-repository-modal"
          //   modalContent={
          //     <CloneRepoModalContent
          //       app={this} />
          //   }
          //   large={false} />
        }
        <Modal id="create-branch-modal"
          modalContent={
            <CreateBranchModalContent
              app={this}
              commit={this.state.commit} />
          }
          large={false} />
        <Modal id="create-new-file-modal"
          modalContent={
            <CreateNewFileModalContent
              app={this}
              repository={this.state.repository}
              tree={this.state.tree}
              recursiveTree={this.state.recursiveTree} />
          }
          large={true} />
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
          <div className="row full-height">
            <NavBar app={this} />
            {modals}
          </div>
        );

      case this.state.constants.APP_PHASE_REPOSITORY_SELECTION:

        return (
          <div className="row full-height">
            <NavBar app={this} />
            {modals}
            <RepoListPane app={this} />
          </div>
        );

      case this.state.constants.APP_PHASE_REPOSITORY_OPEN:
      case this.state.constants.APP_PHASE_BRANCH_OPEN:
        return (
          <div className="row full-height">
            <NavBar app={this} />
            {modals}
            <RepoToolBar
              app={this}
              repository={this.state.repository}
              branches={this.state.branches}
              branch={this.state.branch}
              commits={this.state.commits}
              commit={this.state.commit} />
          </div>
        );

      case this.state.constants.APP_PHASE_COMMIT_OPEN:
        return (
          <div className="row full-height">
            <NavBar app={this} />
            {modals}
            <RepoToolBar
              app={this}
              repository={this.state.repository}
              branches={this.state.branches}
              branch={this.state.branch}
              commits={this.state.commits}
              commit={this.state.commit}
              changedFiles={this.state.changedFiles}
              addedFiles={this.state.addedFiles} />
            <FileSideBar
              app={this}
              repository={this.state.repository}
              branch={this.state.branch}
              commit={this.state.commit}
              recursiveTree={this.state.recursiveTree} />
            <EditorPane
              app={this}
              tree={this.state.tree}
              fileActive={this.state.fileActive}
              filesOpened={this.state.filesOpened} />
            <RuntimePane
              app={this}
              liveYaml={this.state.liveYaml}
              liveHtml={this.state.liveHtml}
              liveBugs={this.state.liveBugs} />
          </div>
        );

      case this.state.constants.APP_PHASE_LOADING:
        return (
          <div>
            <NavBar app={this} />
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
$('[data-toggle="popover"]').popover();
