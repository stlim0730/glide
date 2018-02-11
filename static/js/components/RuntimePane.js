import RendererPane from './RendererPane.js';
import StatusPane from './StatusPane.js';
// import DebuggerPane from './DebuggerPane.js';
// import GitPane from './GitPane.js';

// 
// RuntimePane component
// 
class RuntimePane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      // branches: [],
      branch: null,
      // commits: [],
      // commit: null,
      // tree: null,
      // recursiveTree: null,
      changedFiles: [],
      addedFiles: [],
      fileActive: null
    };

    this.handleProceedClick = this.handleProceedClick.bind(this);
  }

  handleProceedClick(e) {
    // console.log($('#commit-push-breadcrumb'));
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      // branches: this.props.branches,
      branch: this.props.branch,
      // commits: this.props.commits,
      // commit: this.props.commit,
      // tree: this.props.tree,
      // recursiveTree: this.props.recursiveTree,
      changedFiles: this.props.changedFiles,
      addedFiles: this.props.addedFiles,
      fileActive: this.props.fileActive
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      // branches: nextProps.branches,
      branch: nextProps.branch,
      // commits: nextProps.commits,
      // commit: nextProps.commit,
      // tree: nextProps.tree,
      // recursiveTree: nextProps.recursiveTree,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles,
      fileActive: nextProps.fileActive
    });
  }

  render() {
    return (
      <div
        className="col-lg-5 col-md-5 no-padding"
        style={{height: '95vh'}}>
        
        <RendererPane
          app={this.props.app}
          repository={this.state.repository}
          branch={this.state.branch}
          fileActive={this.state.fileActive} />

        <StatusPane
          app={this.props.app}
          repository={this.state.repository}
          branch={this.state.branch}
          changedFiles={this.state.changedFiles}
          addedFiles={this.state.addedFiles} />

        {
          // <button
          //   type="button"
          //   disabled={!commitable}
          //   onClick={this.handleProceedClick.bind(this)}
          //   className="btn btn-success btn-lg btn-block">
          //   Proceed to Commit & Push
          // </button>
        }

        {
          // <GitPane
          //   app={this.props.app}
          //   repository={this.state.repository}
          //   branches={this.state.branches}
          //   branch={this.state.branch}
          //   commits={this.state.commits}
          //   commit={this.state.commit}
          //   tree={this.state.tree}
          //   recursiveTree={this.state.recursiveTree}
          //   changedFiles={this.state.changedFiles}
          //   addedFiles={this.state.addedFiles} />
        }
          
      </div>
    );
  }
}

export default RuntimePane
