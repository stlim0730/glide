// 
// CommitDropdown component
// 
class CommitDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      commits: [],
      commit: null
    };

    this._ajaxCommits = this._ajaxCommits.bind(this);
    this.handleCommitClick = this.handleCommitClick.bind(this);
  }

  _ajaxCommits(repository, branch) {
    // GET commits on the branch
    let url = '/api/project/commits/' + repository.full_name + '/' + branch.name;
    let self = this;
    let app = this.props.app;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        if('error' in response) {
          // TODO
        }
        else {
          let commits = JSON.parse(response.commits);
          self.setState({
            commits: commits
          }, function() {
            app.setState({
              commits: commits
            });
          });
        }
      }
    });
  }

  componentDidMount() {
    // This component mounts invisible
    //   earlier than when it plays a role
    // So, this callback stays empty
  }

  componentWillReceiveProps(nextProps) {
    let prevBranch = this.state.branch;
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      // Don't update commits:
      //   get commits via ajax
      commit: nextProps.commit
    }, function() {
      if(!_.isEqual(prevBranch, nextProps.branch)) {
        this._ajaxCommits(this.state.repository, this.state.branch);
      }
    });
  }

  handleCommitClick(commit, e) {
    let app = this.props.app;
    this.setState({
      commit: commit
    }, app.setState({
      commit: commit,
      phase: app.state.constants.APP_PHASE_COMMIT_OPEN
    }));
  }

  render () {
    if(this.state.commits.length == 0) {
      return null;
    }
    else {
      return (
        <div className="btn-group" style={{marginTop: -5, marginLeft: 10}}>
          <a href="#" className="btn btn-default btn-xs">
            {
              this.state.commit ? this.state.commit.commit.message : 'Select a commit'
            }
          </a>
          <a href="#" className="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown"><span className="caret"></span></a>
          <ul className="dropdown-menu">
            {
              this.state.commits.map(function(item, index) {
                return (
                  <li key={item.sha}>
                    <a href="#" onClick={this.handleCommitClick.bind(this, item)}>
                      "{item.commit.message}" by {item.commit.committer.name} ({item.sha.substring(0, 7)})
                    </a>
                  </li>
                );
              }.bind(this))
            }
          </ul>
        </div>
      );
    }
  }
}

export default CommitDropdown
