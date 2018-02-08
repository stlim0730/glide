import Alert from 'react-s-alert';

// 
// CommitPushPane component
// 
class CommitPushPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      commitMessage: ''
    };

    this.handleCloneClick = this.handleCloneClick.bind(this);
  }

  handleCloneClick() {
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
    //     // console.info(response);
    //     if('error' in response) {
    //       // TODO
    //     }
    //     else {
    //       self._reset();
    //       let repository = JSON.parse(response.repository);
    //       let app = self.props.app;
    //       app.setState({
    //         // phase: app.state.constants.APP_PHASE_REPOSITORY_OPEN,
    //         phase: app.state.constants.APP_PHASE_BRANCH_SELECTION,
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

  componentDidMount() {
    this.setState({
      // activePhase: this.props.activePhase,
      // disabled: this.props.disabled//this.props.phase > this.state.activePhase ? true : false
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      // activePhase: nextProps.activePhase,
      // disabled: nextProps.disabled//nextProps.phase > nextProps.activePhase ? true : false
    });
  }

  render() {
    return (
      <div className="container">

        <div className="row">
          <div className="col offset-lg-1 offset-md-1">
            <div className="h3" style={{paddingTop: 30}}>
              Commit Changes and Push the Branch
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

          <div className="col-lg-5 col-md-5 offset-lg-1 offset-md-1">

            <p className="h4">
              <span className="text-muted">Changes Will Be Confirmed and Saved</span>
            </p>

            <div className="form-group">
              <label className="col-form-label col-form-label-lg">Commit Message</label>
              <input
                className="form-control form-control-lg" type="text"
                // onChange={this.handleCommitMessageChange}
                placeholder="What does this commit do to your repository?" />
            </div>

            <button
              type="button" onClick={this.handleCommitClick}
              disabled={this.state.commitMessage == ''}
              className="btn btn-success btn-lg btn-block">
              Commit & Push
            </button>

          </div>

          <div className="col-lg-5 col-md-5 offset-lg-1 offset-md-1">
            <p className="lead">
              <em>Commit</em> makes a checkpoint where the content is saved along with a message that describes what changes have been made.
            </p>
            <p className="lead">
              <em>Commit</em> message is a short description of the commit you're making.
              This helps you and collaboraors understand what changes are made on the repository later on.
            </p>
            <p className="lead">
              <em>Push</em> means your branch is uploaded to remote repository from which you cloned the repository to begin with.
            </p>
          </div>

        </div>

        <Alert
          stack={{limit: 3, spacing: 50}}
          timeout={4000} html={true}
          effect='stackslide' position='top' />
      </div>
    );
  }
}

export default CommitPushPane;
