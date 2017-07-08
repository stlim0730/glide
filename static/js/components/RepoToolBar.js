import BranchDropdown from './BranchDropdown.js';
import CommitDropdown from './CommitDropdown.js';

// 
// RepoToolBar component
// 
class RepoToolBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // project: this.props.project,
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
    // GET project branches
    let url = '/api/project/branches/' + this.state.repository.full_name;
    let self = this;
    let app = self.props.app;

    $.ajax({
      url: url,
      method: 'GET',
      // headers: { 'X-CSRFToken': window.glide.csrfToken },
      success: function(response) {
        // console.info('RepoToolBar AJAX', response);
        let branches = JSON.parse(response.branches);
        if('error' in response) {
          // TODO
        }
        else {
          self.setState({
            branches: branches
          }, function() {
            app.setState({
              branches: branches
            });
          });
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      // project: nextProps.project,
      repository: nextProps.repository,
      // Don't update branches: it comes from the server, not from App component
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
    console.info('RepoToolBar', this.state);
    return (
      <div className="overflow-hidden">
        <label className="h5">
          &emsp;{this.state.repository.name}&emsp;
        </label>
        <BranchDropdown
          app={this.props.app}
          branches={this.state.branches}
          branch={this.state.branch} />
        <CommitDropdown
          app={this.props.app}
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
