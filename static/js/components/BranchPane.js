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
    this._openCommit = this._openCommit.bind(this);
    this._hardClone = this._hardClone.bind(this);
    this._validateBranchName = this._validateBranchName.bind(this);
    this._pushLoadingMsg = this._pushLoadingMsg.bind(this);
    this._popLoadingMsg = this._popLoadingMsg.bind(this);
    this.handlePreviousClick = this.handlePreviousClick.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
    this.handleLabelFocus = this.handleLabelFocus.bind(this);
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
    const regexesNotAllowedMsg = [
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

    const regexesNotAllowed = [
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

  _pushLoadingMsg(msg) {
    let app = this.props.app;
    let messageKey =  Date.now().toString();
    let message = {};
    message[messageKey] = msg;
    let loadingMessages = _.merge(app.state.loadingMessages, message);
    app.setState({
      loadingMessages: loadingMessages
    });

    return messageKey;
  }

  _popLoadingMsg(msgKey) {
    let app = this.props.app;
    let loadingMessages = app.state.loadingMessages;
    delete loadingMessages[msgKey]
    app.setState({
      loadingMessages: loadingMessages
    });
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
            commit: latestCommit,
            initialCommit: latestCommit
          }, function() {
            self._hardClone(
              this.state.repository,
              branch
            );
          });
        }
      }
    });
  }

  _hardClone(repository, branch) {
    // POST request for Hexo initialization
    let url = '/api/project/hardclone';
    let self = this;
    let loadingMsgHandle = this._pushLoadingMsg('Cloning your branch from the remote repository');

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        cloneUrl: repository.clone_url,
        repository: repository.full_name,
        branch: branch.name
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        // console.debug(response);
        if('error' in response) {
          //
        }
        else {
          self._popLoadingMsg(loadingMsgHandle);
        }
      }
    });
  }

  handlePreviousClick() {
    this._reset();
    let app = this.props.app;
    app.setState({
      phase: app.state.constants.APP_PHASE_REPOSITORY_SELECTION
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
        // console.debug(response);
        if('error' in response) {
          // TODO
        }
        else {
          let branch = response.branch;
          let committer = branch.commit.committer.login != 'web-flow' ?
            branch.commit.committer :
            branch.commit.author;
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
      // Branch only from the latest commit on master branch
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
          // console.debug(response);
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
      // branches: this.props.branches,
      // branch: this.props.branch
    }, function() {
      self._ajaxBranches();
    });
  }

  componentWillReceiveProps(nextProps) {
    // This lifecycle callback is not expected to be called
    console.debug('BranchPane WRP');
  }

  render() {
    let self = this;
    let duplicateBranchName = _.find(this.state.branches, function(branch) {
      return branch.name == self.state.newBranchName;
    });
    return (
      <div className="container">

        <div className="row">
          <div className="col">
            <div className="h3" style={{paddingTop: 30}}>
              Checkout a Branch
              <button
                type="button" className="btn btn-lg btn-link" data-placement="bottom"
                title="" data-container="body" data-toggle="popover"
                data-original-title="Branch?"
                data-content="TBD">
                <i className="info circle icon"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row">

          <div className="col-lg-5 col-md-5">

            {
              this.state.repository &&
              <h4>
                Branches in&nbsp;
                <a target="_blank" href={this.state.repository.html_url}>
                  {this.state.repository.name}
                </a>
              </h4>
            }

            <div className="radio">
              <label className="h4 text-muted"
                onFocus={this.handleLabelFocus.bind(this, 'existingBranch')}>
                <input
                  type="radio" onClick={this.handleRadioClick.bind(this, 'existingBranch')}
                  name="branchSelMode" value="existingBranch" />&nbsp;
                Existing Branches

                <button
                  type="button" className="btn btn-link"
                  onClick={this.handleRefreshClick.bind(this)}>
                  <i className="refresh icon"></i> Refresh
                </button>

                <div className="list-group auto-scroll margin-top-15" style={{maxHeight: '60vh'}}>
                  {
                    this.state.branches.map(function(item, index) {
                      let className = this.state.branch && this.state.branch.name==item.name
                        ? 'list-group-item active'
                        : 'list-group-item';
                      return (
                        <a
                          key={index} href="#" className={className}
                          onClick={this.handleBranchClick.bind(this, item)}>
                          <h5 className="list-group-item-heading">
                            {item.name}
                          </h5>
                        </a>
                      );
                    }.bind(this))
                  }
                </div>
              </label>
            </div>

            <div className="radio margin-top-20">
              <label className="h4 text-muted"
                onFocus={this.handleLabelFocus.bind(this, 'newBranch')}>
                <input
                  type="radio" onClick={this.handleRadioClick.bind(this, 'newBranch')}
                  name="branchSelMode" value="newBranch" />&nbsp;
                Create a New Branch
                <div className="form-group">
                  <input
                    type="text" size="26"
                    className="form-control form-control-lg margin-top-15"
                    placeholder="Be concise and descriptive"
                    onKeyUp={this.handleBranchNameKeyUp} />
                  <p className="text-danger margin-top-15">
                    {this.state.branchNameErrMsg}
                  </p>
                </div>
                {
                  this.state.branchSelMode=='newBranch' &&
                  this.state.newBranchName &&
                  <div className="margin-top-15">
                    <button type="button"
                      onClick={this.handleCheckoutClick.bind(this)}
                      disabled={duplicateBranchName}
                      className="btn btn-success btn-lg btn-block">
                      Create Branch
                    </button>
                    {
                      duplicateBranchName &&
                      <p className="text-danger">
                        The branch name already exists.<br />Try different name.
                      </p>
                    }
                  </div>
                }
              </label>
            </div>

          </div>

          <div className="col-lg-7 col-md-7 margin-top-50">
            {
              this.state.branch &&
              <div>
                <p className="h4">
                  <span className="text-muted">Latest committer</span>&emsp;
                  <a
                    target="_blank"
                    href={this.state.branchDesc.committerUrl}>
                    {this.state.branchDesc.committer}
                  </a>
                </p>
                <p className="h4">
                  <span className="text-muted">Committed At</span>&emsp;
                  <small>
                    {
                      new Date(this.state.branchDesc.date).toLocaleTimeString()
                    }
                    <span className="text-muted">&nbsp;On&nbsp;</span>
                    {
                      new Date(this.state.branchDesc.date).toLocaleDateString()
                    }
                  </small>
                </p>
              </div>
            }
            
            {
              this.state.branchSelMode=='existingBranch' &&
              this.state.branch &&
              <div className="margin-top-20">
                <button
                  type="button"
                  disabled={this.state.branch.name == 'master'}
                  onClick={this.handleCheckoutClick.bind(this)}
                  className="btn btn-success btn-lg btn-block">
                  Checkout Branch
                </button>

                {
                  this.state.branch.name == 'master' &&
                  <p className="text-danger">
                    GLIDE doesn't allow you to checkout <code>master</code> branch.
                  </p>
                }

                <a
                  target="_blank" href={this.state.branch._links.html}
                  className="btn btn-outline-success btn-sm btn-block">
                  <i className="external icon"></i>&nbsp;
                  Open Branch on GitHub
                </a>
              </div>
            }

            {
              !this.state.branch &&
              <div className="col helper-text" style={{paddingBottom: 16}}>
                <p className="lead">
                  <strong className="text-info">(Local) Branch</strong> represents a separate edition of a repository. Each collaborator will independently work on one's own branch. All the individual works on the branches are supposed to incorporated into master branch, once they're done.
                </p>
                <p className="lead">
                  <strong className="text-info">Master branch</strong> is the representative branch of a repository. You'll incrementally make progress in this project by incorporating your work on your branch into master branch.
                </p>
                <p className="lead">
                  <strong className="text-info">Checkout</strong> means choosing an existing branch to work on. You may need to create a new branch for your work.
                </p>
              </div>
            }

          </div>

        </div>

      </div>
    );
  }
}

export default BranchPane;
