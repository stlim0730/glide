// 
// GitResetModalContent component
// 
class GitResetModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      commit: null,
      changedFiles: [],
      addedFiles: []
    };

    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm() {
    let app = this.props.app;
    
    let changedFiles = this.state.changedFiles;
    _.forEach(changedFiles, function(file) {
      file.newContent ? delete file.newContent : null;
    });

    this.setState({
      changedFiles: [],
      addedFiles: []
    }, function() {
      app.setState({
        changedFiles: [],
        addedFiles: [],
        filesOpened: [],
        fileActive: null
      });
    });
  }

  componentDidMount() {
    this.setState({
      commit: this.props.commit,
      changedFiles: this.props.changedFiles,
      addedFiles: this.props.addedFiles
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      commit: nextProps.commit,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles
    });
  }

  render() {
    // console.info('reset', this.state.commit);
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button"
            className="close"
            data-dismiss="modal">
            &times;
          </button>
          <h4 className="modal-title">
            Reset the Repository as the Latest Commit
          </h4>
        </div>
        
        <div className="modal-body">
          <p>Your workspace reverts to the latest commit you've loaded.</p>
          <label>The Latest Commit</label>:
          <div className="well well-sm">
            "{this.state.commit && this.state.commit.commit.message}" by {this.state.commit && this.state.commit.commit.committer.name} ({this.state.commit && this.state.commit.sha.substring(0, 7)})
          </div>
          <p>You will <strong>lose all the changes</strong> you've made. Are you sure?</p>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal">Cancel</button>
          <button
            type="button" ref={(c) => this.confirmButton = c}
            className="btn btn-danger" data-dismiss="modal"
            onClick={this.handleConfirm}>Confirm</button>
        </div>
      </div>
    );
  }
}

export default GitResetModalContent;
