// 
// CreateBranchModalContent component
// 
class CreateBranchModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newBranch: '',
      commit: null
    };

    this.handleBranchNameChange = this.handleBranchNameChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._reset = this._reset.bind(this);
    this._validateBranchName = this._validateBranchName.bind(this);
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
        return false
      }
    }
    return true;
  }

  _reset() {
    this.setState({
      newBranch: '',
      commit: null
    });

    this.branchNameInput.value = '';
  }

  componentDidMount() {
    this.setState({
      commit: this.props.commit
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      commit: nextProps.commit
    });
  }

  handleBranchNameChange(e) {
    let branchName = e.target.value.trim();

    if(this._validateBranchName(branchName)) {
      this.setState({
        newBranch: branchName
      });
    }
    else {
      this.setState({
        newBranch: ''
      });
    }
  }

  handleKeyUp(e) {
    let keyCode = e.keyCode;
    if(keyCode == 13) {
      this.submitButton.click();
    }
  }

  handleSubmit(e) {
    // POST branch name to create
    let url = '/api/project/branch';
    let repoFullName = this.props.app.state.repository.full_name;
    let owner = repoFullName.split('/')[0];
    let repo = repoFullName.split('/')[1];
    let self = this;

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        newBranch: self.state.newBranch,
        branchFrom: self.state.commit.sha,
        owner: owner,
        repo: repo
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        console.info(response);
        if('error' in response) {
          // TODO: Duplicated branch name is used
        }
        else {
          self._reset();

          // A new branch is created on GitHub
          let newBranchName = response.createRefRes.ref.replace('refs/heads/', '');
          let url = response.createRefRes.object.url.replace(owner + '/' + repo + '/git/commits', owner + '/' + repo + '/commits')
          let app = self.props.app;
          let newBranch = {
            name: newBranchName,
            commit: {
              sha: response.createRefRes.object.sha,
              url: url
            }
          };
          app.setState({
            branch: newBranch,
            phase: app.state.constants.APP_PHASE_BRANCH_OPEN
          });
        }
      }
    });
  }

  render() {
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
          <h4 className="modal-title">Create a New Branch</h4>
        </div>
        
        <div className="modal-body">
          <div className="row">
            <fieldset>
              <div className="form-group">
                <label className="col-md-3 control-label text-right">
                  Branch Name
                </label>
                <div className="col-md-7">
                  <input
                    type="text" ref={(c) => this.branchNameInput = c}
                    onChange={this.handleBranchNameChange}
                    className="form-control" maxLength="255"
                    placeholder="Be concise and descriptive"
                    onKeyUp={this.handleKeyUp} />
                </div>
              </div>
              {
                // <div className="form-group">
                //   <div className="col-md-7 col-md-offset-3">
                //     <span className="text-primary">
                //       A branch name <a target="_blank" href="https://stackoverflow.com/questions/3651860/which-characters-are-illegal-within-a-branch-name"><strong>cannot</strong></a>:
                //     </span>
                //     <ul>
                //       <li>Have a <span className="text-danger">path component</span> that begins with "."</li>
                //       <li>Have a double dot <span className="text-danger">".."</span></li>
                //       <li>End with a <span className="text-danger">"/"</span></li>
                //       <li>End with <span className="text-danger">".lock"</span></li>
                //       <li>Contain an <span className="text-danger">ASCII control characters</span>, "~", "^", or ":"</li>
                //       <li>Contain a <span className="text-danger">"\"</span> (backslash)</li>
                //       <li>Contain <span className="text-danger">whitespace</span></li>
                //     </ul>
                //   </div>
                // </div>
              }
            </fieldset>
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal"
            onClick={this._reset}>Close</button>
          <button
            className="btn btn-primary"
            ref={(c) => this.submitButton = c}
            onClick={this.handleSubmit}
            data-dismiss="modal"
            type="submit"
            disabled={this.state.newBranch==''}>
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default CreateBranchModalContent;
