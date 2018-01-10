// 
// GitPane component
// 
class GitPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      commit: null,
      tree: null,
      recursiveTree: null,
      changedFiles: [],
      addedFiles: [],
      commitMessage: ''
    };

    this.handleStagedFileClick = this.handleStagedFileClick.bind(this);
    this.handleCommitMessageChange = this.handleCommitMessageChange.bind(this);
    this.handleCommitClick = this.handleCommitClick.bind(this);
  }

  _updateFileContentInTree(tree, recursiveTree) {
    // 
    // This recursive function copies the new file content
    //   from recursiveTree to tree
    // Commit operation works with tree. recursiveTree is UI friendly version of tree.
    // 

    for(let i in recursiveTree.nodes) {
      let file = recursiveTree.nodes[i];

      let existsInTree = _.find(tree.tree, function(treeFile) {
        return (('/' + treeFile.path) == file.path) || (treeFile.path == file.path);
      });

      if(!existsInTree) {
        console.log('file path only found in recursiveTree', file);
      }

      if(file.type == 'tree') {
        // Folder: go deeper
        this._updateFileContentInTree(tree, file);
      }
      else {
        // File: update file.content in tree
        let treeFile = _.find(tree.tree, function(f) {
          return (('/' + f.path) == file.path) || (f.path == file.path);
        });

        // Remove potential leading / from treeFile.path
        // treeFile.path = treeFile.path.startsWith('/') ? treeFile.path.substring(1) : treeFile.path;

        // GitHub API doc says
        //   Use either tree.content or tree.sha
        //   We go with content if the file has been touched
        treeFile.content = file.newContent ? file.newContent : file.originalContent;
        if(treeFile.content) {
          delete treeFile.sha;
        }
        else {
          delete treeFile.content;
        }

        // if(file.newContent) {
        //   // Modified file
        //   // Update this file in tree
        //   let treeFile = _.find(tree.tree, function(f) {
        //     return f.path == file.path;
        //   });

        //   treeFile.content = file.newContent;
        //   delete treeFile.sha;
        // }
        // else {
        //   // Do nothing
        // }
      }
    }
  }

  handleStagedFileClick(file, e) {
    console.log(file);
    // TODO: Diff the file
  }

  handleCommitMessageChange(e) {
    let msg = e.target.value.trim();
    this.setState({
      commitMessage: msg
    });
  }

  handleCommitClick(e) {
    // console.log('tree to commit', this.state.tree, this.state.recursiveTree);

    // POST tree to make a create tree request
    let tree = this.state.tree;
    let recursiveTree = this.state.recursiveTree;

    this._updateFileContentInTree(tree, recursiveTree);

    // TODO??? Comment out for now: it looks working fine without this process
    // Clean up the tree to submit as GitHub API wants
    // "tree": [
    //   {
    //     "path": "file.rb",
    //     "mode": "100644",
    //     "type": "blob",
    //     "content": "..."
    //   }
    // ]
    // GitHub API doc says
    //   Use either tree.content or tree.sha
    //   We go with content
    // let essentialKeys = ['path', 'mode', 'type', 'content', 'sha'];
    // for(let i in tree.tree) {
    //   let file = tree.tree[i];
    //   for(let key in file) {
    //     if(!_.includes(essentialKeys, key)) {
    //       delete file[key];
    //     }
    //   }
    // }

    // Remove potential leading / from treeFile.path
    _.forEach(tree.tree, function(file) {
      if(file.path.startsWith('/')) {
        file.path = file.path.substring(1);
      }
    });

    // TODO: One suspicious thing: empty subfolders cause some trouble sometimes?

    // Remove tree type files with null value of sha
    //   These are subfolders created by the user
    _.remove(tree.tree, function(file) {
      return file.type == 'tree' && file.sha == null;
    });

    // console.info('tree path bugs', treePathBugs);
    // console.info('r tree path bugs', rTreePathBugs);
    // console.info('shaNulls', shaNulls);
    // console.info('contentNulls', contentNulls);
    console.info('tree optimized before commit & push', tree);
    
    let repository = this.state.repository;
    let branch = this.state.branch;
    let commit = this.state.commit;
    let message = this.state.commitMessage;
    let url = '/api/project/commit';
    let self = this;

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        repository: repository.full_name,
        branch: branch.name,
        commit: commit.sha,
        tree: tree.tree,
        message: message
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        console.info(response);
        if('error' in response) {
          //
        }
        else {
          // self._reset();
          // Update app state
          // Clean up staged areas

          // GET commits on the branch
          // let url = '/api/project/commits/' + repository.full_name + '/' + branch;
          // let app = self.props.app;

          // $.ajax({
          //   url: url,
          //   method: 'GET',
          //   success: function(response) {
          //     if('error' in response) {
          //       // TODO
          //     }
          //     else {
          //       let commits = response.commits;
          //       let newCommit = commits[0];
          //       newCommit.pushed = true;
          //       app.setState({
          //         phase: app.state.constants.APP_PHASE_COMMIT_OPEN,
          //         commit: newCommit,
          //         commits: commits,
          //         changedFiles: [],
          //         addedFiles: []
          //         // TODO
          //       });
          //     }
          //   }
          // });
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
      recursiveTree: this.props.recursiveTree,
      changedFiles: this.props.changedFiles,
      addedFiles: this.props.addedFiles
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      commit: nextProps.commit,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles
    });
  }

  render () {
    let commitable = this.state.changedFiles.length > 0 || this.state.addedFiles.length > 0;

    return (
      <div className="card no-padding height-40">
        <h6 className="card-header">Git Operations</h6>
        <div className="card-body auto-scroll full-height">
          
          <ul className="nav nav-pills">
            <li className="nav-item">
              <a
                data-command="status" data-toggle="tab"
                href="#git-command-status"
                className="nav-link active">
                Status
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="diff" data-toggle="tab"
                href="#git-command-diff"
                className="nav-link disabled">
                Diff
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="commit_push" data-toggle="tab"
                href="#git-command-commit_push"
                className={commitable ? "nav-link" : "nav-link disabled"}>
                Commit & Push
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="pull_request" data-toggle="tab"
                href="#git-command-pull_request"
                className="nav-link">
                Pull Request
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="log" data-toggle="tab"
                href="#git-command-log"
                className="nav-link">
                Log
              </a>
            </li>
            <li className="nav-item">
              <a
                data-command="reset" data-toggle="tab"
                href="#git-command-reset"
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
                    On command line, <code>git status</code> command displays the state of the working directory and the staging area on the branch.
                  </p>
                  <p>
                    GLIDE works a little differently. It automatically staged all the changes you've made. This is because GLIDE is a web app where the changes that aren't added and committed will be lost when you close the web browser, rather than persist in your local storage.
                  </p>
                </div>

              </div>
            }

            <div
              className="card-body tab-pane fade"
              id="git-command-diff">
              Diff
            </div>

            {
              commitable &&
              <div
                className="card-body tab-pane fade"
                id="git-command-commit_push">
                <h5 className="card-title">
                  Changes Will Be Confirmed and Saved
                </h5>

                <h6>
                  in the&nbsp;
                  <a
                    href={this.state.repository.html_url + '/tree/' + this.state.branch.name}
                    target="_blank">Remote Repository
                  </a>
                </h6>

                <div className="form-group">
                  <h6 className="col-form-label">
                    Commit Message
                  </h6>
                  <p className="text-muted">
                    Commit message is a short description of the commit you're making. This helps you and collaboraors understand what changes are made on the repository later on.
                  </p>
                  <input
                    type="text" className="form-control"
                    onChange={this.handleCommitMessageChange}
                    placeholder="What does this commit do to your repository?" />
                  <button type="button" style={{marginTop: 10}}
                    onClick={this.handleCommitClick}
                    disabled={!commitable || this.state.commitMessage == ''}
                    className="btn btn-outline-primary btn-block">
                    Commit & Push
                  </button>
                </div>

                <hr style={{marginTop: 30}} />

                <div className="text-muted" style={{marginTop: 30}}>
                  <p>
                    On command line, <code>git commit</code> command makes a checkpoint where the content on the branch of the repository is saved along with a message from you that describes what changes have been made.
                  </p>
                  <p>
                    <code>git push</code> command uploads the content on the current branch to the remote repository from which you cloned the repository to begin with.
                  </p>
                  <p>
                    <code>git commit</code> and <code>git push</code> are independent commands, but GLIDE pushes every single commit not to lose any of them.
                  </p>
                </div>

              </div>
            }

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