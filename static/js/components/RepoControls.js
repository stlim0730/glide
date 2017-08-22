// 
// RepoControls component
// 
class RepoControls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      commit: null
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
      repository: this.props.repository,
      branch: this.props.branch,
      commit: this.props.commit
    });
  }

  render () {
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
              className="btn btn-sm btn-success disabled">
              Commit &amp; Push
            </button>&nbsp;
            <button
              type="button"
              className="btn btn-sm btn-danger disabled">
              Reset
            </button>&nbsp;
          </div>
        </div>
      );
    }
  }
}

export default RepoControls
