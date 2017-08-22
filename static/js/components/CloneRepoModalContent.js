// 
// CloneRepoModalContent component
// 
class CloneRepoModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repoUrl: ''
    };

    this.handleUrlChange = this.handleUrlChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._reset = this._reset.bind(this);
    this._validateGitUrl = this._validateGitUrl.bind(this);
  } 

  _validateGitUrl(url) {
    let repoUrlRegex = /https:\/\/github.com\/\S+\/\S+\.git/;
    return repoUrlRegex.test(url);
  }

  _reset() {
    this.setState({
      repoUrl: ''
    });

    this.urlInput.value = '';
  }

  componentDidMount() {
    // 
  }

  handleUrlChange(e) {
    let url = e.target.value.trim();

    if(this._validateGitUrl(url)) {
      this.setState({
        repoUrl: url
      });
    }
    else {
      this.setState({
        repoUrl: ''
      });
    }
  }

  handleSubmit(e) {
    // POST repository url to clone from
    let url = '/api/project/clone';
    let prefix = 'https://github.com/';
    let suffix = this.state.repoUrl.replace(prefix, '');
    let owner = suffix.split('/')[0];
    let repo = suffix.split('/')[1].replace('.git', '');
    let self = this;
    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        repoUrl: self.state.repoUrl,
        owner: owner,
        repo: repo
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        console.info(response);
        if('error' in response) {
          //
        }
        else {
          self._reset();
          let repository = JSON.parse(response.repository);
          let app = self.props.app;
          app.setState({
            phase: app.state.constants.APP_PHASE_REPOSITORY_OPEN,
            repository: repository,
            branches: [],
            branch: null,
            commits: [],
            commit: null
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
          <h4 className="modal-title">Clone a Glide Project</h4>
        </div>
        
        <div className="modal-body">
          <div className="row">
            <form className="form-horizontal">
              <fieldset>
                <div className="form-group">
                  <label className="col-md-2 col-md-offset-1 control-label">
                    Git URL
                  </label>
                  <div className="col-md-7">
                    <input
                      type="text" ref={(c) => this.urlInput = c}
                      onChange={this.handleUrlChange}
                      className="form-control" maxLength="100"
                      placeholder="https://github.com/" />
                  </div>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal"
            onClick={this._reset}>
            Close
          </button>
          <button
            className="btn btn-primary" onClick={this.handleSubmit}
            data-dismiss="modal" ref={(c) => this.submitButton = c}
            disabled={this.state.repoUrl==''}
            type="submit">
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default CloneRepoModalContent;
