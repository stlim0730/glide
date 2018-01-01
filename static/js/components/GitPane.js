// 
// GitPane component
// 
class GitPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // activePill: null,
      branch: null,
      changedFiles: [],
      addedFiles: []
    };

    this.handlePillClick = this.handlePillClick.bind(this);
    this.handleStagedFileClick = this.handleStagedFileClick.bind(this);
  }

  handlePillClick(e) {
    // let command = $(e.target).data('command');
    // this.setState({
    //   activePill: command
    // });
  }

  handleStagedFileClick(file, e) {
    console.log(file);
  }

  componentDidMount() {
    this.setState({
      branch: this.props.branch,
      changedFiles: this.props.changedFiles,
      addedFiles: this.props.addedFiles
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      branch: nextProps.branch,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles
    });
  }

  render () {
    return (
      <div className="card no-padding height-40">
        <h6 className="card-header">Git</h6>
        <div className="card-body auto-scroll full-height">
          
          <ul className="nav nav-pills">
            <li className="nav-item">
              <a
                data-command="status" data-toggle="tab"
                href="#git-command-status" onClick={this.handlePillClick}
                className="nav-link active">
                Status
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="diff" data-toggle="tab"
                href="#git-command-diff" onClick={this.handlePillClick}
                className="nav-link disabled">
                Diff
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="commit_push" data-toggle="tab"
                href="#git-command-commit_push" onClick={this.handlePillClick}
                className="nav-link">
                Commit & Push
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="pull_request" data-toggle="tab"
                href="#git-command-pull_request" onClick={this.handlePillClick}
                className="nav-link">
                Pull Request
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="log" data-toggle="tab"
                href="#git-command-log" onClick={this.handlePillClick}
                className="nav-link">
                Log
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="reset" data-toggle="tab"
                href="#git-command-reset" onClick={this.handlePillClick}
                className="nav-link disabled">
                Reset
              </a>
            </li>
          </ul>

          <div className="tab-content">
            
            {
              this.state.branch && 
              <div
                className="card-body tab-pane fade active show in"
                id="git-command-status">
                <h5 className="card-title">
                  Status of Your Workspace
                </h5>

                <h6>
                  On branch <strong>{this.state.branch.name}</strong>
                </h6>

                {
                  this.state.changedFiles.length == 0 &&
                  this.state.addedFiles.length == 0 &&
                  <p>
                    Your branch is up-to-date with 'origin/<strong>{this.state.branch.name}</strong>'.
                  </p>
                }

                {
                  this.state.addedFiles.length > 0 &&
                  <div>
                    <h6>Added Files ({this.state.addedFiles.length}):</h6>
                    {
                      this.state.addedFiles.map(function(item, index) {
                        return (
                          <button
                            key={item.path} type="button" style={{marginLeft:30}}
                            className={item.type == "tree" ? "btn btn-link block file-node-folder" : "btn btn-link block file-node-file"}
                            onClick={this.handleStagedFileClick.bind(this, item)}>
                            <i className="text file outline icon"></i> {item.path}
                          </button>
                        );
                      }.bind(this))
                    }
                  </div>
                }

                {
                  this.state.changedFiles.length > 0 &&
                  <div>
                    <h6>Changed Files ({this.state.changedFiles.length}):</h6>
                    {
                      this.state.changedFiles.map(function(item, index) {
                        return (
                          <button
                            key={item.path} type="button" style={{marginLeft:30}}
                            className={item.type == "tree" ? "btn btn-link block file-node-folder" : "btn btn-link block file-node-file"}
                            onClick={this.handleStagedFileClick.bind(this, item)}>
                            <i className="text file outline icon"></i> {item.path}
                          </button>
                        );
                      }.bind(this))
                    }
                  </div>
                }

                <hr style={{marginTop: 30}} />

                <div className="text-muted" style={{marginTop: 30}}>
                  <p>
                    On command line, <code>git status</code> command displays the state of the working directory and the staging area.
                  </p>
                  <p>
                    However, GLIDE automatically stages all the changes you make because the changes that aren't added and committed will be lost, rather than persist in your local storage.
                  </p>
                </div>

              </div>
            }

            <div
              className="card-body tab-pane fade"
              id="git-command-diff">
              Diff
            </div>

            <div
              className="card-body tab-pane fade"
              id="git-command-commit_push">
              Commit & Push
            </div>

            <div
              className="card-body tab-pane fade"
              id="git-command-pull_request">
              Pull Request
            </div>

            <div
              className="card-body tab-pane fade"
              id="git-command-log">
              Log
            </div>

            <div
              className="card-body tab-pane fade"
              id="git-command-reset">
              Reset
            </div>

          </div>

        </div>
      </div>
    );
  }
}

export default GitPane;
