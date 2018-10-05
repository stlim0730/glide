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
      commits: [],
      commit: null,
      tree: null,
      recursiveTree: null,
      addedFiles: [],
      changedFiles: [],
      removedFiles: [],
      fileActive: null,
      filesOpened: []
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
      commits: this.props.commits,
      commit: this.props.commit,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree,
      addedFiles: this.props.addedFiles,
      changedFiles: this.props.changedFiles,
      removedFiles: this.props.removedFiles,
      fileActive: this.props.fileActive,
      filesOpened: this.props.filesOpened
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branches: nextProps.branches,
      branch: nextProps.branch,
      commits: nextProps.commits,
      commit: nextProps.commit,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      addedFiles: nextProps.addedFiles,
      changedFiles: nextProps.changedFiles,
      removedFiles: nextProps.removedFiles,
      fileActive: nextProps.fileActive,
      filesOpened: nextProps.filesOpened
    });
  }

  render () {
    return (
      <div className="container-fluid" style={{height: '95vh'}}>

        <div className="row" style={{height: '95vh'}}>
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
            fileActive={this.state.fileActive}
            editorExpanded={this.props.editorExpanded} />
          <RuntimePane
            app={this.props.app}
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
            editorChangesSaved={this.props.editorChangesSaved}
            rendererUpdated={this.props.rendererUpdated}
            fileActive={this.state.fileActive}
            editorExpanded={this.props.editorExpanded} />
        </div>

      </div>
    );
  }
}

export default WorkspacePane;
