// 
// BranchDropdown component
// 
class BranchDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branches: [],
      branch: null,
      commits: [],
      commit: null
    };

    this._ajaxBranches = this._ajaxBranches.bind(this);
    this.handleBranchClick = this.handleBranchClick.bind(this);
  }

  _ajaxBranches(repository) {
    // GET project branches
    let url = '/api/project/branches/' + repository.full_name;
    let self = this;
    let app = self.props.app;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        if('error' in response) {
          // TODO
        }
        else {
          let branches = JSON.parse(response.branches);
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

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      // Don't update branches:
      //   get branches via ajax
      branch: this.props.branch,
      commits: this.props.commits,
      commit: this.props.commit
    }, function() {
      this._ajaxBranches(this.state.repository);
    });
  }

  componentWillReceiveProps(nextProps) {
    // This happens in selecting a commit
    //   or creating a new branch.
    let prevBranch = this.state.branch;

    this.setState({
      repository: nextProps.repository,
      // Don't update branches:
      //   get branches via ajax
      branch: nextProps.branch,
      commits: nextProps.commits,
      commit: nextProps.commit
    }, function() {
      if(!_.isEqual(prevBranch, nextProps.branch)) {
        // A new branch is created
        this._ajaxBranches(this.state.repository);
      }
    });
  }

  handleBranchClick(branch, e) {
    let app = this.props.app;
    this.setState({
      branch: branch
    }, function() {
      app.setState({
        branch: branch,
        phase: app.state.constants.APP_PHASE_BRANCH_OPEN
      });
    });
  }

  render () {
    let latestCommit = false;
    let commit = this.state.commit;
    let commits = this.state.commits;
    if(this.state.commit != null && this.state.commits.length > 0) {
      latestCommit = _.isEqual(commit, commits[0]);
    }

    return (
      <div className="inline-block" style={{marginRight: 30}}>
        <label className="control-label">Branch</label><br />
        <div className="btn-group">
          <a href="#" className="btn btn-default btn-sm">
            {
              this.state.branch ? this.state.branch.name : 'Select a branch'
            }
          </a>
          <a href="#" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown"><span className="caret"></span></a>
          <ul className="dropdown-menu">
            {
              this.state.branches.map(function(item, index) {
                return (
                  <li key={item.name}>
                    <a href="#" onClick={this.handleBranchClick.bind(this, item)}>{item.name}</a>
                  </li>
                );
              }.bind(this))
            }
            { latestCommit ? <li className="divider"></li> : null }
            { latestCommit ? <li><a href="#" data-toggle="modal" data-target="#create-branch-modal">Create a New Branch</a></li> : null }
          </ul>
        </div>
      </div>
    );
  }
}

export default BranchDropdown
