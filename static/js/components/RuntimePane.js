import RendererPane from './RendererPane.js';
// import DebuggerPane from './DebuggerPane.js';
import GitPane from './GitPane.js';

// 
// RuntimePane component
// 
class RuntimePane extends React.Component {
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
      isHexoPrj: null,
      changedFiles: [],
      addedFiles: [],
      fileActive: null
    };
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
      isHexoPrj: this.props.isHexoPrj,
      changedFiles: this.props.changedFiles,
      addedFiles: this.props.addedFiles,
      fileActive: this.props.fileActive
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
      isHexoPrj: nextProps.isHexoPrj,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles,
      fileActive: nextProps.fileActive
    });
  }

  render () {
    return (
      <div className="col-lg-5 col-md-5 no-padding full-height">
        
        <RendererPane
          // app={this.props.app}
          fileActive={this.state.fileActive}
          isHexoPrj={this.state.isHexoPrj}
          repository={this.state.repository}
          branch={this.state.branch} />
        <GitPane
          app={this.props.app}
          repository={this.state.repository}
          branches={this.state.branches}
          branch={this.state.branch}
          commits={this.state.commits}
          commit={this.state.commit}
          tree={this.state.tree}
          recursiveTree={this.state.recursiveTree}
          changedFiles={this.state.changedFiles}
          addedFiles={this.state.addedFiles} />
          
      </div>
    );
  }
}

export default RuntimePane
