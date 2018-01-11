import FileSideBar from './FileSideBar.js';
import EditorPane from './EditorPane.js';
import RuntimePane from './RuntimePane.js';

// 
// WorkspacePane component
// 
class WorkspacePane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branches: [],
      branch: null,
      commit: null,
      tree: null,
      recursiveTree: null,
      changedFiles: [],
      addedFiles: [],
      fileActive: null,
      filesOpened: [],
      liveYaml: null,
      liveHtml: null,
      liveBugs: []
    };

    this._reset = this._reset.bind(this);
    this.handlePreviousClick = this.handlePreviousClick.bind(this);
  }

  _reset() {
    // this.setState({
      // 
    // });
  }

  handlePreviousClick() {
    // TODO: Alert that the user might lose all the changes unpushed
    this._reset();
    let app = this.props.app;
    app.setState({
      phase: app.state.constants.APP_PHASE_BRANCH_SELECTION
    });
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branches: this.props.branches,
      branch: this.props.branch,
      commit: this.props.commit,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree,
      changedFiles: this.props.changedFiles,
      addedFiles: this.props.addedFiles,
      fileActive: this.props.fileActive,
      filesOpened: this.props.filesOpened,
      liveYaml: this.props.liveYaml,
      liveHtml: this.props.liveHtml,
      liveBugs: this.props.liveBugs
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branches: nextProps.branches,
      branch: nextProps.branch,
      commit: nextProps.commit,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles,
      fileActive: nextProps.fileActive,
      filesOpened: nextProps.filesOpened,
      liveYaml: nextProps.liveYaml,
      liveHtml: nextProps.liveHtml,
      liveBugs: nextProps.liveBugs
    });
  }

  render () {
    return (
      <div className="container-fluid full-height">

        <div className="row full-height">
          <FileSideBar
            app={this.props.app}
            repository={this.state.repository}
            branch={this.state.branch}
            commit={this.state.commit}
            filesOpened={this.state.filesOpened}
            fileActive={this.state.fileActive} />
          <EditorPane
            app={this.props.app}
            repository={this.state.repository}
            branch={this.state.branch}
            tree={this.state.tree}
            recursiveTree={this.state.recursiveTree}
            changedFiles={this.state.changedFiles}
            addedFiles={this.state.addedFiles}
            filesOpened={this.state.filesOpened}
            fileActive={this.state.fileActive} />
          <RuntimePane
            app={this.props.app}
            repository={this.state.repository}
            branches={this.state.branches}
            branch={this.state.branch}
            commit={this.state.commit}
            tree={this.state.tree}
            recursiveTree={this.state.recursiveTree}
            changedFiles={this.state.changedFiles}
            addedFiles={this.state.addedFiles}
            liveYaml={this.state.liveYaml}
            liveHtml={this.state.liveHtml}
            liveBugs={this.state.liveBugs} />
        </div>

      </div>
    );
  }
}

export default WorkspacePane;
