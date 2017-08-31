import GitDiffPane from './GitDiffPane.js';

// 
// GitStatusModalContent component
// 
class GitStatusModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      branch: null,
      changedFiles: [],
      addedFiles: [],
      diffFile: null
    };

    // this._reset = this._reset.bind(this);
    // this.handleChangedFileClick = this.handleChangedFileClick.bind(this);
  }

  // _reset() {
  //   // 
  // }

  // handleChangedFileClick(file) {
    // TODO: Currently not using diff tool on Glide
    // this.setState({
    //   diffFile: file
    // });
  // }

  componentDidMount() {
    // 
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      branch: nextProps.branch,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles,
      diffFile: null
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
          <h4 className="modal-title">Status of Your Workspace</h4>
        </div>
        
        <div className="modal-body row">
          <div className={this.state.diffFile ? "col-lg-4 col-md-4" : "col-lg-12 col-md-12"}>
            
            <label>
              On branch {this.state.branch && this.state.branch.name}
            </label>
            {
              this.state.changedFiles.length == 0 &&
              this.state.addedFiles.length == 0 &&
              this.state.branch &&
              <p>Your branch is up-to-date with 'origin/{this.state.branch.name}'.</p>
            }
            {
              this.state.changedFiles.length > 0 &&
              <div>
                <label>Changed Files:</label>
                <div>
                  {
                    this.state.changedFiles.map(function(item, index) {
                      return (
                        <p
                          key={item.path}
                          className={item.type == "tree" ? "text-primary" : "file-node-file"}
                          // onClick={this.handleChangedFileClick.bind(this, item)}>
                          >
                          &emsp;{item.path}
                        </p>
                      );
                    }.bind(this))
                  }
                </div>
              </div>
            }
            {
              this.state.addedFiles.length > 0 &&
              <div>
                <label>Added Files:</label>
                <div>
                  {
                    this.state.addedFiles.map(function(item, index) {
                      return (
                        <p
                          key={item.path}
                          className={item.type == "tree" ? "text-primary" : "file-node-file"}
                          // onClick={this.handleChangedFileClick.bind(this, item)}>
                          >
                          &emsp;{item.path}
                        </p>
                      );
                    }.bind(this))
                  }
                </div>
              </div>
            }
          </div>

          <GitDiffPane
            diffFile={this.state.diffFile}
            gitStatusModalContent={this} />

        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal">Close</button>
        </div>
      </div>
    );
  }
}

export default GitStatusModalContent;
