// 
// GitPullRequestModalContent component
// 
class GitPullRequestModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      commit: null,
      pullReqTitle: '',
      pullReqBody: ''
    };

    this._reset = this._reset.bind(this);
    this.handleTitleKeyUp = this.handleTitleKeyUp.bind(this);
    this.handleBodyKeyUp = this.handleBodyKeyUp.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  _reset() {
    this.setState({
      pullReqTitle: '',
      pullReqBody: ''
    });

    this.pullReqTitleInput.value = '';
    this.pullReqBodyInput.value = '';
  }

  handleTitleKeyUp(e) {
    let title = e.target.value.trim();

    if(title.length > 0) {
      this.setState({
        pullReqTitle: title
      });
    }
    else {
      this.setState({
        pullReqTitle: ''
      });
    }

    let keyCode = e.keyCode;
    if(keyCode == 13) {
      this.submitButton.click();
    }
  }

  handleBodyKeyUp(e) {
    let body = e.target.value.trim();

    this.setState({
      pullReqBody: body
    });

    let keyCode = e.keyCode;
    if(keyCode == 13) {
      this.submitButton.click();
    }
  }

  handleSubmit() {
    // POST branch name to create
    let repoFullName = this.props.app.state.repository.full_name;
    let owner = repoFullName.split('/')[0];
    let repo = repoFullName.split('/')[1];
    let url = '/api/project/pull/' + owner + '/' + repo;

    let title = this.state.pullReqTitle;
    let body = this.state.pullReqBody;
    let head = this.state.branch.name;
    let base = 'master';
    let self = this;

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        title: title,
        head: head,
        base: base,
        pullReqBody: body
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        console.info(response);
        if('error' in response) {
          // TODO: Duplicated branch name is used
        }
        else {
          self._reset();
          let app = self.props.app;
          let commit = self.state.commit;
          delete commit.pushed;
          app.setState({
            commit: commit
          });

          // A new pull request has been made on GitHub
          // let newBranchName = response.createRefRes.ref.replace('refs/heads/', '');
          // let url = response.createRefRes.object.url.replace(owner + '/' + repo + '/git/commits', owner + '/' + repo + '/commits')
          // let app = self.props.app;
          // let newBranch = {
          //   name: newBranchName,
          //   commit: {
          //     sha: response.createRefRes.object.sha,
          //     url: url
          //   }
          // };
          // app.setState({
          //   branch: newBranch,
          //   phase: app.state.constants.APP_PHASE_BRANCH_OPEN
          // });
        }
      }
    });
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      commit: this.props.commit,
      pullReqTitle: this.props.pullReqTitle,
      pullReqBody: this.props.pullReqBody
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      commit: nextProps.commit,
      pullReqTitle: nextProps.pullReqTitle,
      pullReqBody: nextProps.pullReqBody
    });
  }

  render() {
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button"
            className="close"
            data-dismiss="modal">
            &times;
          </button>
          <h4 className="modal-title">
            Make a Pull Request
          </h4>
        </div>
        
        <div className="modal-body">
          <fieldset>
            <div className="row">
              <div className="form-group">
                <label className="col-md-3 control-label text-right">
                  Title
                </label>
                <div className="col-md-7">
                  <input
                    ref={(c) => this.pullReqTitleInput = c}
                    type="text"
                    className="form-control"
                    onKeyUp={this.handleTitleKeyUp}
                    maxLength="255" />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="form-group">
                <label className="col-md-3 control-label text-right">
                  Description
                </label>
                <div className="col-md-7">
                  <input
                    ref={(c) => this.pullReqBodyInput = c}
                    type="text"
                    className="form-control"
                    onKeyUp={this.handleBodyKeyUp}
                    maxLength="255"
                    placeholder="Optional" />
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="modal-footer">
          <button
            type="button" className="btn btn-default"
            data-dismiss="modal" onClick={this._reset}>Close</button>
          <button
            type="button" ref={(c) => this.submitButton = c}
            className="btn btn-primary" data-dismiss="modal"
            disabled={this.state.pullReqTitle==''}
            onClick={this.handleSubmit}>Submit</button>
        </div>
      </div>
    );
  }
}

export default GitPullRequestModalContent;
