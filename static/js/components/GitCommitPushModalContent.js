// 
// GitCommitPushModalContent component
// 
class GitCommitPushModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      commits: [],
      commit: null,
      tree: null,
      recursiveTree: null,
      changedFiles: [],
      addedFiles: [],
      commitMessage: ''
    };

    this._reset = this._reset.bind(this);
    this._updateTreeContent = this._updateTreeContent.bind(this);
    // this._ajaxCommits = this._ajaxCommits.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  _reset() {
    this.setState({
      commitMessage: ''
    });

    this.commitMessageInput.value = '';
  }

  _updateTreeContent(tree, recursiveTree) {
    for(let i in recursiveTree.nodes) {
      let file = recursiveTree.nodes[i];

      if(file.type == 'tree') {
        // Go deeper
        this._updateTreeContent(tree, file);
      }
      else {
        if(file.newContent) {
          // Modified file
          // Update this file in tree
          let treeFile = _.find(tree.tree, function(f) {
            return f.path == file.path;
          });

          treeFile.content = file.newContent;
          delete treeFile.sha;
        }
        else {
          // Do nothing
        }
      }
    }
  }

  // _ajaxCommits(repository, branch) {
  //   // GET commits on the branch
  //   let url = '/api/project/commits/' + repository.full_name + '/' + branch.name;
  //   let self = this;
  //   let app = this.props.app;

  //   $.ajax({
  //     url: url,
  //     method: 'GET',
  //     success: function(response) {
  //       if('error' in response) {
  //         // TODO
  //       }
  //       else {
  //         let commits = JSON.parse(response.commits);
  //         return commits;
  //       }
  //     }
  //   });
  // }

  handleKeyUp(e) {
    let message = e.target.value.trim();

    if(message.length > 0) {
      this.setState({
        commitMessage: message
      });
    }
    else {
      this.setState({
        commitMessage: ''
      });
    }

    let keyCode = e.keyCode;
    if(keyCode == 13) {
      this.submitButton.click();
    }
  }

  handleSubmit() {
    // POST tree to make a create tree request
    let tree = this.state.tree;
    let recursiveTree = this.state.recursiveTree;

    this._updateTreeContent(tree, recursiveTree);
    // console.info(tree);

    // TODO: Clean up the tree to submit as GitHub API wants
    // {
    //   "tree": [
    //     {
    //       "path": "file.rb",
    //       "mode": "100644",
    //       "type": "blob",
    //       "content": "..."
    //     }
    //   ]
    // }

    // let keys = ['path', 'mode', 'type', 'content', 'sha'];

    tree.tree = _.remove(tree.tree, function(file) {
      return /*file.type != 'tree' &&*/ file.sha != null || file.content != null;
    });

    // for(let i in tree.tree) {
    //   let file = tree.tree[i];
    //   for(let key in file) {
    //     if(!_.includes(keys, key)) {
    //       delete file[key];
    //     }
    //   }
    // }

    // console.info(tree);

    let repository = this.state.repository;
    let owner = repository.owner.login;
    let repo = repository.name;
    let branch = this.state.branch.name;
    let commit = this.state.commit.sha;
    let message = this.state.commitMessage;
    let url = '/api/project/commit/' + owner + '/' + repo;
    let self = this;

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        tree: tree.tree,
        branch: branch,
        commit: commit,
        message: message
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        console.info(response);
        if('error' in response) {
          //
        }
        else {
          self._reset();
          // Update app state
          // Clean up staged areas

          // GET commits on the branch
          let url = '/api/project/commits/' + repository.full_name + '/' + branch;
          let app = self.props.app;

          $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
              if('error' in response) {
                // TODO
              }
              else {
                let commits = response.commits;
                let newCommit = commits[0];
                newCommit.pushed = true;
                app.setState({
                  phase: app.state.constants.APP_PHASE_COMMIT_OPEN,
                  commit: newCommit,
                  commits: commits,
                  changedFiles: [],
                  addedFiles: []
                  // TODO
                });
              }
            }
          });
        }
      }
    });
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      commits: this.props.commits,
      commit: this.props.commit,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree,
      changedFiles: this.props.changedFiles,
      addedFiles: this.props.addedFiles,
      commitMessage: ''
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      commits: nextProps.commits,
      commit: nextProps.commit,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles,
      commitMessage: ''
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
          <h4 className="modal-title">
            Commit Your Changes and Push Your Branch to GitHub
          </h4>
        </div>
        
        <div className="modal-body">
          <fieldset>
            <div className="row">
              <div className="form-group">
                <label className="col-md-3 control-label text-right">
                  Commit Message
                </label>
                <div className="col-md-7">
                  <input
                    ref={(c) => this.commitMessageInput = c}
                    type="text"
                    className="form-control"
                    onKeyUp={this.handleKeyUp}
                    maxLength="255" />
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal">Close</button>
          <button
            type="button"
            ref={(c) => this.submitButton = c}
            className="btn btn-primary"
            data-dismiss="modal"
            disabled={(this.state.changedFiles.length==0 && this.state.addedFiles.length==0) || this.state.commitMessage==''}
            onClick={this.handleSubmit}>Submit</button>
        </div>
      </div>
    );
  }
}

export default GitCommitPushModalContent;
