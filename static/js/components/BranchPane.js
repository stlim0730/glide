// 
// BranchPane component
// 
class BranchPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branches: [],
      branch: null,
      branchDesc: null,
      branchSelMode: null,
      newBranchName: '',
      branchNameErrMsg: ''
    };

    this._reset = this._reset.bind(this);
    this._ajaxBranches = this._ajaxBranches.bind(this);
    this._validateBranchName = this._validateBranchName.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
    this.handleRadioClick = this.handleRadioClick.bind(this);
    this.handleBranchClick = this.handleBranchClick.bind(this);
    this.handleBranchNameKeyUp = this.handleBranchNameKeyUp.bind(this);
    this.handleCheckoutClick = this.handleCheckoutClick.bind(this);
  }

  _reset() {
    this.setState({
      repository: null,
      branches: [],
      branch: null,
      branchDesc: null,
      branchSelMode: null,
      newBranchName: '',
      branchNameErrMsg: ''
    });
  }

  _validateBranchName(branchName) {
    // https://stackoverflow.com/questions/3651860/which-characters-are-illegal-within-a-branch-name
    // A branch name cannot:
    //   Have a path component that begins with "."
    //   Have a double dot ".."
    //   End with a "/"
    //   End with ".lock"
    //   Contain an ASCII control character, "~", "^", ":" or SP
    //   Contain a "\" (backslash)
    //   Contain whitespace
    let regexesNotAllowedMsg = [
      'A branch name can\'t have "./".',
      'A branch name can\'t have a double dot "..".',
      'A branch name can\'t end with a "/".',
      'A branch name can\'t end with ".lock".',
      'A branch name can\'t have "~".',
      'A branch name can\'t have "^".',
      'A branch name can\'t have ":".',
      'A branch name can\'t have a "\\" (backslash).',
      'A branch name can\'t have a whitespace.'
    ];

    let regexesNotAllowed = [
      /\.\//,
      /\.\./,
      /\/$/,
      /\.lock$/,
      /~/,
      /\^/,
      /:/,
      /\\/,
      /\s/
    ];
    for(let i=0; i<regexesNotAllowed.length; i++) {
      let regex = regexesNotAllowed[i];
      if(regex.test(branchName)) {
        // TODO: Show alert
        return regexesNotAllowedMsg[i];
      }
    }
    return true;
  }

  _ajaxBranches() {
    // GET project branches
    let url = '/api/project/branches/' + this.state.repository.full_name;
    let app = this.props.app;
    let self = this;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        if('error' in response) {
          // TODO
        }
        else {
          let branches = response.branches;
          self.setState({
            branches: branches
          }, function() {
            // app.setState({
            //   branches: branches
            // });
          });
        }
      }
    });
  }

  _openCommit(branch) {
    // GET commits on the branch
    let url = '/api/project/commits/'
      + this.state.repository.full_name
      + '/' + branch.name;
    let app = this.props.app;
    let self = this;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        if('error' in response) {
          // TODO
        }
        else {
          // Set the current branches, branch, commits, and commit
          //   as specified
          let commits = response.commits;
          let latestCommit = commits[0];
          let branches = self.state.branches;
          let isExisting = _.find(branches, function(b) {
            return b.name == branch.name;
          });
          if(!isExisting) {
            branches.push(branch);
          }

          app.setState({
            phase: app.state.constants.APP_PHASE_COMMIT_OPEN,
            branches: branches,
            branch: branch,
            commits: commits,
            commit: latestCommit
          }, function() {
            // console.info(app.state, commits, latestCommit);
            // app.setState({
            //   phase: app.state.constants.APP_PHASE_COMMIT_OPEN
            // });
          });
        }
      }
    });
  }

  handleRefreshClick() {
    let self = this;

    this.setState({
      branches: [],
      branch: null
    }, function() {
      self._ajaxBranches();
    });
  }

  handleLabelFocus(branchSelMode) {
    $('input[value='+branchSelMode+']').click();
  }

  handleRadioClick(branchSelMode) {
    if(branchSelMode=='newBranch') {
      this.setState({
        branch: null,
        branchDesc: null,
        branchSelMode: branchSelMode
      });
    }
    else if(branchSelMode=='existingBranch') {
      this.setState({
        branchSelMode: branchSelMode
      });
    }
  }

  handleBranchNameKeyUp(e) {
    let branchName = e.target.value.trim();
    let validOrErrMsg = this._validateBranchName(branchName);
    
    if(validOrErrMsg==true) {
      this.setState({
        newBranchName: branchName,
        branchNameErrMsg: ''
      });
    }
    else {
      this.setState({
        newBranchName: '',
        branchNameErrMsg: validOrErrMsg
      });
    }
  }

  handleBranchClick(branch) {
    // let branchDesc;
    let repoFullName = this.state.repository.full_name;
    let owner = repoFullName.split('/')[0];
    let repo = repoFullName.split('/')[1];
    let url = '/api/project/branch/' + owner + '/' + repo + '/' + branch.name;
    let self = this;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        // console.info(response);
        if('error' in response) {
          // TODO
        }
        else {
          let branch = response.branch;
          let committer = branch.commit.committer.login!='web-flow'
            ? branch.commit.committer : branch.commit.author;
          let committerUrl = 'https://github.com/' + committer.login;
          let date = branch.commit.commit.committer.date || branch.commit.commit.author.date;
          let branchDesc = {
            committer: committer.login,
            committerUrl: committerUrl,
            date: date
          };

          self.setState({
            branch: branch,
            branchDesc: branchDesc
          });
        }
      }
    });
  }

  handleCheckoutClick() {
    if(this.state.branchSelMode == 'existingBranch') {
      // Get ready to open commit with the selected branch
      this._openCommit(this.state.branch);
    }
    else if(this.state.branchSelMode == 'newBranch') {
      // Create a new branch
      //   and get ready to open commit
      //   with the newly created branch

      // POST branch name to create
      let url = '/api/project/branch';
      let repoFullName = this.state.repository.full_name;
      let owner = repoFullName.split('/')[0];
      let repo = repoFullName.split('/')[1];
      let masterBranch = _.find(this.state.branches, function(branch) {
        return branch.name === 'master';
      });
      let shaBranchFrom = masterBranch.commit.sha;
      let self = this;

      $.ajax({
        url: url,
        method: 'POST',
        headers: { 'X-CSRFToken': window.glide.csrfToken },
        dataType: 'json',
        data: JSON.stringify({
          newBranchName: self.state.newBranchName,
          shaBranchFrom: shaBranchFrom,
          owner: owner,
          repo: repo
        }),
        contentType: 'application/json; charset=utf-8',
        success: function(response) {
          // console.info(response);
          if('error' in response) {
            // TODO: Duplicated branch name is used
          }
          else {
            // A new branch is created on GitHub
            let newBranchName = response.createRefRes.ref.replace('refs/heads/', '');
            // Match the url format
            let url = response.createRefRes.object.url.replace(
              owner + '/' + repo + '/git/commits',
              owner + '/' + repo + '/commits')
            let newBranch = {
              name: newBranchName,
              commit: {
                sha: response.createRefRes.object.sha,
                url: url
              }
            };
                        
            self._openCommit(newBranch);
          }
        }
      });
    }
  }

  componentDidMount() {
    let self = this;

    this.setState({
      repository: this.props.repository,
      branches: [],
      branch: null
    }, function() {
      self._ajaxBranches();
    });
  }

  componentWillReceiveProps(nextProps) {
    //
  }

  render () {
    return (
      <div className="full-height">
        <div className="row">
          <div className="col-lg-3 col-md-3 col-lg-offset-3 col-md-offset-3">

            <label>Checkout a Branch or Create New</label>
            <button
              type="button" className="btn btn-sm btn-link"
              data-container="body" data-toggle="popover"
              data-placement="bottom" data-original-title="" title=""
              data-content="TBD">
              <span className="glyphicon glyphicon-info-sign"></span>
            </button>

            <div className="radio">
              <label onFocus={this.handleLabelFocus.bind(this, 'existingBranch')}>
                <input
                  type="radio" onClick={this.handleRadioClick.bind(this, 'existingBranch')}
                  name="branchSelMode" value="existingBranch"
                   />
                Existing Branches

                <button
                  type="button" className="btn btn-sm btn-link"
                  onClick={this.handleRefreshClick}>
                  <span className="glyphicon glyphicon-refresh"></span> Refresh
                </button>

                <div className="max-height-90 auto-scroll list-group">
                  {
                    this.state.branches.map(function(item, index) {
                      return (
                        <button
                          key={index} type="button"
                          className={this.state.branch && this.state.branch.name==item.name ? "list-group-item active" : "list-group-item"}
                          onClick={this.handleBranchClick.bind(this, item)}>
                          <h4 className="list-group-item-heading">{item.name}</h4>
                        </button>
                      );
                    }.bind(this))
                  }
                </div>
              </label>
            </div>

            <div className="radio">
              <label onFocus={this.handleLabelFocus.bind(this, 'newBranch')}>
                <input
                  type="radio" onClick={this.handleRadioClick.bind(this, 'newBranch')}
                  name="branchSelMode" value="newBranch" />
                Create a New Branch
                <div className="form-group">
                  <input
                    type="text" className="form-control"
                    placeholder="Be concise and descriptive"
                    onKeyUp={this.handleBranchNameKeyUp} />
                  <p className="text-danger">
                    {this.state.branchNameErrMsg}
                  </p>
                </div>
              </label>
            </div>

          </div>

          <div className="col-lg-3 col-md-3">
            {
              this.state.branchDesc &&
              <div>
                <br /><br /><br />
                <p>
                  <label>Latest committer</label>&emsp;
                  <a
                    target="_blank"
                    href={this.state.branchDesc.committerUrl}>
                    {this.state.branchDesc.committer}
                  </a>
                  <br />
                </p>
                <p>
                  <label>Committed at</label>&emsp;
                  {new Date(this.state.branchDesc.date).toLocaleTimeString()}&nbsp;
                  on {new Date(this.state.branchDesc.date).toLocaleDateString()}
                </p>
              </div>
            }
          </div>

        </div>

        <div className="row">
          <div className="col-lg-6 col-md-6 col-lg-offset-3 col-md-offset-3">
            <button
              onClick={this.handleCheckoutClick.bind(this)}
              className="btn btn-primary btn-block"
              disabled={
                (this.state.branchSelMode=='existingBranch'
                  && !this.state.branch)
                || (this.state.branchSelMode=='newBranch'
                  && !this.state.newBranchName)
              }>
              {
                this.state.branchSelMode=='newBranch' ? 'Create Branch' : 'Checkout Branch'
              }
            </button>
          </div>
        </div>

      </div>
    );
  }
}

export default BranchPane;
