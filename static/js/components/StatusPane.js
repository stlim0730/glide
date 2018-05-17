// 
// StatusPane component
// 
class StatusPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      addedFiles: [],
      changedFiles: [],
      removedFiles: []
    };

    this.handleProceedClick = this.handleProceedClick.bind(this);
  }

  handleProceedClick(e) {
    let app = this.props.app;
    app.setState({
      phase: app.state.constants.APP_PHASE_COMMIT_AND_PUSH
    });
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      addedFiles: this.props.addedFiles,
      changedFiles: this.props.changedFiles,
      removedFiles: this.props.removedFiles
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      addedFiles: nextProps.addedFiles,
      changedFiles: nextProps.changedFiles,
      removedFiles: nextProps.removedFiles
    });
  }

  render() {
    let commitable = this.state.changedFiles.length > 0
      || this.state.addedFiles.length > 0
      || this.state.removedFiles.length > 0;

    return (
      <div className="card" style={{height: '45vh'}}>
        <div className="card-header">
          <h6 className="inline-block" style={{marginBottom: 0}}>Status</h6>
          <span style={{float: 'right'}}>
            {this.state.repository && this.state.repository.name} / {this.state.branch && this.state.branch.name}
          </span>
        </div>

        <ul className="list-group">
          
          <button
            type="button"
            data-toggle="collapse" data-target="#status-added-files"
            className="list-group-item d-flex justify-content-between align-items-center">
            <span><i className="blue plus icon"></i> Added Files</span>
            <span className="badge badge-primary badge-pill">
              {this.state.addedFiles.length}
            </span>
          </button>
          <div
            style={{maxHeight: '15vh', overflow: 'scroll'}}
            id="status-added-files" className="collapse">
            {
              this.state.addedFiles.map(function(item, index) {
                return (
                  <button
                    key={item.path} type="button" style={{marginLeft:30}}
                    className="btn btn-link block file-node-file">
                    <i className="text file outline icon"></i> {item.path}
                  </button>
                );
              }.bind(this))
            }
          </div>

          <button
            type="button"
            data-toggle="collapse" data-target="#status-edited-files"
            className="list-group-item d-flex justify-content-between align-items-center">
            <span><i className="orange edit icon"></i> Edited Files</span>
            <span className="badge badge-warning badge-pill">
              {this.state.changedFiles.length}
            </span>
          </button>
          <div
            style={{maxHeight: '15vh', overflow: 'scroll'}}
            id="status-edited-files" className="collapse">
            {
              this.state.changedFiles.map(function(item, index) {
                return (
                  <button
                    key={item.path} type="button" style={{marginLeft:30}}
                    className="btn btn-link inline-block file-node-file">
                    <i className="text file outline icon"></i> {item.path}
                  </button>
                );
              }.bind(this))
            }
          </div>

          <button
            type="button"
            data-toggle="collapse" data-target="#status-removed-files"
            className="list-group-item d-flex justify-content-between align-items-center">
            <span><i className="red erase icon"></i> Removed Files</span>
            <span className="badge badge-danger badge-pill">
              {this.state.removedFiles.length}
            </span>
          </button>
          <div
            style={{maxHeight: '15vh', overflow: 'scroll'}}
            id="status-removed-files" className="collapse">
            {
              this.state.removedFiles.map(function(item, index) {
                return (
                  <button
                    key={item.path} type="button" style={{marginLeft:30, textDecoration: 'line-through'}}
                    className="btn btn-link block file-node-file">
                    <i className="text file outline icon"></i> {item.path}
                  </button>
                );
              }.bind(this))
            }
          </div>
        </ul>

        <div
          style={{height: '5vh', width: '100%', position: 'absolute',
          bottom: 15, paddingLeft: 15, paddingRight: 15}}>
          <button
            type="button"
            disabled={!commitable}
            onClick={this.handleProceedClick}
            className="btn btn-success btn-lg btn-block">
            Proceed to Commit & Push
          </button>
        </div>

        {
          // this.state.branch && 
          // <div
          //   className="card-body tab-pane fade active show in"
          //   id="git-command-status">

          //   <h6>
          //     On branch <strong>{this.state.branch.name}</strong>
          //   </h6>

          //   {
          //     this.state.changedFiles.length == 0 &&
          //     this.state.addedFiles.length == 0 &&
          //     <p>
          //       Your branch is up-to-date with 'origin/<strong>{this.state.branch.name}</strong>'.
          //     </p>
          //   }

          //   {
          //     this.state.addedFiles.length > 0 &&
          //     <div>
          //       <h6>Added Files ({this.state.addedFiles.length}):</h6>
          //       {
          //         this.state.addedFiles.map(function(item, index) {
          //           return (
          //             <button
          //               key={item.path} type="button" style={{marginLeft:30}}
          //               className={item.type == "tree" ? "btn btn-link block file-node-folder" : "btn btn-link block file-node-file"}
          //               onClick={this.handleStagedFileClick.bind(this, item)}>
          //               <i className="text file outline icon"></i> {item.path}
          //             </button>
          //           );
          //         }.bind(this))
          //       }
          //     </div>
          //   }

          //   {
          //     this.state.changedFiles.length > 0 &&
          //     <div>
          //       <h6>Changed Files ({this.state.changedFiles.length}):</h6>
          //       {
          //         this.state.changedFiles.map(function(item, index) {
          //           return (
          //             <button
          //               key={item.path} type="button" style={{marginLeft:30}}
          //               className={item.type == "tree" ? "btn btn-link block file-node-folder" : "btn btn-link block file-node-file"}
          //               onClick={this.handleStagedFileClick.bind(this, item)}>
          //               <i className="text file outline icon"></i> {item.path}
          //             </button>
          //           );
          //         }.bind(this))
          //       }
          //     </div>
          //   }

          // </div>
        }
      </div>
    );
  }
}

export default StatusPane;
