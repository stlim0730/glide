import Alert from 'react-s-alert';

// 
// PullRequestPane component
// 
class PullRequestPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      commit: null,
      pullReqTitle: '',
      pullReqBody: ''
    };

    this.reset = this.reset.bind(this);
    this.pushLoadingMsg = this.pushLoadingMsg.bind(this);
    this.popLoadingMsg = this.popLoadingMsg.bind(this);
    this.handlePRTitleChange = this.handlePRTitleChange.bind(this);
    this.handlePRBodyChange = this.handlePRBodyChange.bind(this);
    this.handlePRClick = this.handlePRClick.bind(this);
  }

  reset() {
    this.setState({
      pullReqTitle: '',
      pullReqBody: ''
    });
    this.prTitleInput.value = '';
    this.prBodyTextarea.value = '';
  }

  pushLoadingMsg(msg) {
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

  popLoadingMsg(msgKey) {
    let app = this.props.app;
    let loadingMessages = app.state.loadingMessages;
    delete loadingMessages[msgKey]
    app.setState({
      loadingMessages: loadingMessages
    });
  }

  handlePRTitleChange(e) {
    let msg = e.target.value.trim();
    this.setState({
      pullReqTitle: msg
    });
  }

  handlePRBodyChange(e) {
    let msg = e.target.value.trim();
    this.setState({
      pullReqBody: msg
    });
  }

  handlePRClick() {
    // console.debug(this.state.pullReqTitle, this.state.pullReqBody);
    
    // POST branch name to create
    let url = '/api/project/pr';
    let repository = this.state.repository.full_name;
    let title = this.state.pullReqTitle;
    let body = this.state.pullReqBody;
    let head = this.state.branch.name;
    let base = 'master';
    let app = this.props.app;
    let self = this;
    let loadingMsgHandle = this.pushLoadingMsg('Making a pull request');

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        repository: repository,
        head: head,
        base: base,
        pullReqTitle: title,
        pullReqBody: body
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        // console.debug(response);
        if('error' in response) {
          
        }
        else {
          if(response.message == 'A pull request already exists.') {
            self.setState({
              pullReqTitle: '',
              pullReqBody: ''
            }, function() {
              self.popLoadingMsg(loadingMsgHandle);
              $('a.nav-link[data-command=status]').click();
              let msg = 'Pull request for branch <strong>' + head + '</strong> already exists. All your commits on this branch are covered!';
              Alert.info(msg);
            });
          }
          else {
            self.setState({
              pullReqTitle: '',
              pullReqBody: ''
            }, function() {
              app.setState({
                initialCommit: self.state.commit
              }, function() {
                self.popLoadingMsg(loadingMsgHandle);
                $('a.nav-link[data-command=status]').click();
                let msg = 'Pull request for branch <strong>' + head + '</strong> has been successfully made!';
                Alert.success(msg);
                self.reset();
                // TODO: Where to lead the user?
              });
            });
          }
        }
      }
    });
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      commit: this.props.commit,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      commit: nextProps.commit,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree
    });
  }

  render() {
    return (
      <div className="container">

        <div className="row">
          <div className="col">
            <div className="h3" style={{paddingTop: 30}}>
              Make a Request for Review and Merge of the Branch
              <button
                type="button" className="btn btn-lg btn-link" data-placement="bottom"
                title="" data-container="body" data-toggle="popover"
                data-original-title=""
                data-content="TBD">
                <i className="info circle icon"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row">

          <div className="col-lg-5 col-md-5">

            <p className="h4">
              <span className="text-muted">
                The repository owner will decide on the merge of this branch into master branch, after discussion.
              </span>
            </p>
            <p className="h4">
              <span className="text-muted">
                Write a short message that describes what your pull request will do to the shared repository.
              </span>
            </p>

            <div className="form-group">
              <label className="col-form-label col-form-label-lg">Title</label>
              <input
                ref={(c) => this.prTitleInput = c}
                className="form-control form-control-lg" type="text"
                onChange={this.handlePRTitleChange}
                placeholder="What does your branch do (required)?" />
              <label className="col-form-label col-form-label-lg">Body</label>
              <textarea
                ref={(c) => this.prBodyTextarea = c}
                onChange={this.handlePRBodyChange}
                placeholder="Could you elaborate the title (optional)?"
                className="form-control col-lg-12 col-md-12 no-resize" rows="3">
              </textarea>
              <button
                type="button" onClick={this.handlePRClick}
                disabled={this.state.pullReqTitle == ''}
                style={{ marginTop: 16 }}
                className="btn btn-success btn-lg btn-block">
                Make a Pull Request
              </button>
            </div>

          </div>

          <div className="col-lg-7 col-md-7 helper-text">
            <p className="lead">
              <strong className="text-info">Pull request</strong> is notyfying the repository owner that your branch is done, so it's ready to be merged into master branch.
            </p>
            <p className="lead">
              <strong className="text-info">Merge</strong> is a process where your work is incorporated into master branch through code review and discussion with the collaborators. Once your branch is merged into master branch, this means your project became a new version. After merge process, your local branch may be deleted.
            </p>
          </div>

        </div>

        <Alert
          stack={{limit: 1, spacing: 2}}
          timeout={3000} html={true}
          effect='stackslide' position='top' />
      </div>
    );
  }
}

export default PullRequestPane;
