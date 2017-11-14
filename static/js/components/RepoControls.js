// 
// RepoControls component
// 
class RepoControls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      commit: null,
      changedFiles: [],
      addedFiles: []
    };

    // this._ajaxCommits = this._ajaxCommits.bind(this);
  }

  componentDidMount() {
    // This component mounts invisible
    //   earlier than when it plays a role
    // So, this callback stays empty
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      commit: nextProps.commit,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles
    });
  }

  render () {
    // console.info(this.state.changedFiles, this.state.addedFiles);
    if(!this.state.commit) {
      return null;
    }
    else {
      return (
        <div className="inline-block">
          <label className="control-label">Repository Commands</label><br />
          <div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              data-toggle="modal"
              data-target="#git-status-modal">
              Status
            </button>&nbsp;
            <button
              type="button"
              className="btn btn-sm btn-success"
              data-toggle="modal"
              data-target="#git-commit-push-modal"
              disabled={this.state.changedFiles==[] && this.state.addedFiles==[]}>
              Commit &amp; Push
            </button>&nbsp;
            <button
              type="button"
              className="btn btn-sm btn-success"
              data-toggle="modal"
              data-target="#git-pull-request-modal"
              disabled={!this.state.commit.pushed}>
              Make a Pull Request
            </button>&nbsp;
            <button
              type="button"
              className="btn btn-sm btn-danger"
              data-toggle="modal"
              data-target="#git-reset-modal"
              disabled={this.state.commit.pushed || (this.state.changedFiles==[] && this.state.addedFiles==[])}>
              Reset
            </button>
          </div>
        </div>
      );
    }
  }
}

export default RepoControls
