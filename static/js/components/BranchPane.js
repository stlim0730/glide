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
    };

    this._reset = this._reset.bind(this);
    this._ajaxBranches = this._ajaxBranches.bind(this);
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
      newBranchName: ''
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
          let branches = JSON.parse(response.branches);
          self.setState({
            branches: branches
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
    this.setState({
      newBranchName: branchName
    });
  }

  handleBranchClick(branch) {

    let branchDesc;
    

    this.setState({
      branch: branch,
      branchDesc: branchDesc
    }, function() {
      // TODO
    });
    // // GET repository url to clone from
    // let owner = repository.owner.login;
    // let repo = repository.name;
    // let url = '/api/project/readme/' + owner + '/' + repo;
    // let self = this;

    // $.ajax({
    //   url: url,
    //   method: 'GET',
    //   success: function(response) {
    //     if('error' in response) {
    //       if(response.error == 'HTTPError') {
    //         self.setState({
    //           repository: repository,
    //           liveHtml: 'Can\'t find README.md in this repository.'
    //         });
    //       }
    //       else if(response.error == 'decoding') {
    //         self.setState({
    //           repository: repository,
    //           liveHtml: 'Can\'t decode README.md.'
    //         });
    //       }
    //     }
    //     else {
    //       let readme = response.readme;
    //       self.setState({
    //         repository: repository,
    //         liveHtml: readme
    //       });
    //     }
    //   }
    // });
  }

  handleCheckoutClick() {
    // // POST repository url to clone from
    // let url = '/api/project/clone';
    // // let suffix = this.state.repoUrl.replace(prefix, '');
    // let owner = this.state.repository.owner.login;//suffix.split('/')[0];
    // let repo = this.state.repository.name;//suffix.split('/')[1].replace('.git', '');
    // let repoUrl = this.state.repository.html_url;
    // let self = this;
    // $.ajax({
    //   url: url,
    //   method: 'POST',
    //   headers: { 'X-CSRFToken': window.glide.csrfToken },
    //   dataType: 'json',
    //   data: JSON.stringify({
    //     repoUrl: repoUrl,
    //     owner: owner,
    //     repo: repo
    //   }),
    //   contentType: 'application/json; charset=utf-8',
    //   success: function(response) {
    //     console.info(response);
    //     if('error' in response) {
    //       //
    //     }
    //     else {
    //       self._reset();
    //       let repository = JSON.parse(response.repository);
    //       let app = self.props.app;
    //       app.setState({
    //         // phase: app.state.constants.APP_PHASE_REPOSITORY_OPEN,
    //         // phase: app.state.constants.APP_PHASE_BRANCH_SCAFFOLDING,
    //         repository: repository,
    //         branches: [],
    //         branch: null,
    //         commits: [],
    //         commit: null
    //       });
    //     }
    //   }
    // });
  }

  componentWillReceiveProps(nextProps) {
    let self = this;

    this.setState({
      repository: nextProps.repository,
      branches: [],
      branch: null
    }, function() {
      self._ajaxBranches();
    });
  }

  render () {
    return (
      <div className="full-height">
        <div className="row">
          <div className="col-lg-4 col-md-4 col-lg-offset-3 col-md-offset-3">

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
                Existing Branch

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
                </div>
              </label>
            </div>

          </div>

          <div className="col-lg-2 col-md-2">
            {
              this.state.branchDesc &&
              <div>
                &nbsp;
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
