import BranchDropdown from './BranchDropdown.js';
import CommitDropdown from './CommitDropdown.js';

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
      commit: null
    };

    // this.handleMouseEnter = this.handleMouseEnter.bind(this);
    // this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  componentDidMount() {
    
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branches: nextProps.branches,
      branch: nextProps.branch,
      commits: nextProps.commits,
      commit: nextProps.commit
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
      <div className="overflow-hidden">
        <label className="h5">
          &emsp;{this.state.repository.name}&emsp;
        </label>
        <BranchDropdown
          app={this.props.app}
          repository={this.state.repository}
          branches={this.state.branches}
          branch={this.state.branch}
          commits={this.state.commits}
          commit={this.state.commit} />
        <CommitDropdown
          app={this.props.app}
          repository={this.state.repository}
          branch={this.state.branch}
          commits={this.state.commits}
          commit={this.state.commit} />
      </div>
    );
  }
}

export default RepoToolBar

// <small className="hidden">
//   <span className="glyphicon glyphicon-cog" aria-hidden="true"></span> Configure project...&emsp;
//   <span className="glyphicon glyphicon-new-window" aria-hidden="true"></span> Open in a new window
// </small>
