import BranchDropdown from './BranchDropdown.js';
import CommitDropdown from './CommitDropdown.js';
import RepoControls from './RepoControls.js';

// 
// RepoToolBar component
// 
class RepoToolBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: this.props.repository,
      branches: [],
      branch: null,
      commits: [],
      commit: null,
      changedFiles: [],
      addedFiles: []
    };

    // this.handleMouseEnter = this.handleMouseEnter.bind(this);
    // this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let nextBranch = nextProps.branch;
    let nextCommits = nextProps.commits;
    let nextCommit = nextProps.commit;

    if(this.state.repository != nextProps.repository) {
      nextBranch = null;
      nextCommits = [];
      nextCommit = null;
    }

    if(this.state.branch != nextProps.branch) {
      nextCommits = [];
      nextCommit = null;
    }

    this.setState({
      repository: nextProps.repository,
      branches: nextProps.branches,
      branch: nextBranch,
      commits: nextCommits,
      commit: nextCommit,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles
    });
  }

  // handleMouseEnter(e) {
    // this.refs.configIcon.className = "glyphicon glyphicon-cog";
    // let commands = e.target.getElementsByClassName('project-level-commands');
    // $(e.target).children('small').removeClass('hidden');
  // }

  // handleMouseLeave(e) {
    // this.refs.configIcon.className = "glyphicon glyphicon-cog hidden";
    // $(e.target).children('small').addClass('hidden');
  // }

  render () {
    return (
      <div className="overflow-hidden" style={{marginBottom: 10}}>
        <div className="inline-block" style={{marginLeft: 15, marginRight: 30}}>
          <label className="control-label">
            Repository
          </label><br />
          <div className="btn-group" style={{marginTop: -5}}>
            <span className="h3 text-muted">{this.state.repository.owner.login}/</span><span className="h3">{this.state.repository.name}</span>
          </div>
        </div>
        {
          // <BranchDropdown
          //   app={this.props.app}
          //   repository={this.state.repository}
          //   branches={this.state.branches}
          //   branch={this.state.branch}
          //   commits={this.state.commits}
          //   commit={this.state.commit} />
        }
        {
          // <CommitDropdown
          //   app={this.props.app}
          //   repository={this.state.repository}
          //   branch={this.state.branch}
          //   commits={this.state.commits}
          //   commit={this.state.commit} />
        }
        <RepoControls
          app={this.props.app}
          repository={this.state.repository}
          branch={this.state.branch}
          commits={this.state.commits}
          commit={this.state.commit}
          changedFiles={this.state.changedFiles}
          addedFiles={this.state.addedFiles} />
      </div>
    );
  }
}

export default RepoToolBar;
