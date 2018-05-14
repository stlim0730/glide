import Alert from 'react-s-alert';
import FileUtil from '../util/FileUtil.js';

// 
// CommitPushPane component
// 
class CommitPushPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      branches: [],
      commit: null,
      tree: null,
      recursiveTree: null,
      commitMessage: ''
    };

    this.reset = this.reset.bind(this);
    this.pushLoadingMsg = this.pushLoadingMsg.bind(this);
    this.popLoadingMsg = this.popLoadingMsg.bind(this);
    this.handleCommitMessageChange = this.handleCommitMessageChange.bind(this);
    this.updateFileContentInTree = this.updateFileContentInTree.bind(this);
    this.handleCommitClick = this.handleCommitClick.bind(this);
    this.openCommit = this.openCommit.bind(this);
    this.hardClone = this.hardClone.bind(this);
    this.handleGoBackClick = this.handleGoBackClick.bind(this);
    this.handleProceedClick = this.handleProceedClick.bind(this);
  }

  reset() {
    this.setState({
      commitMessage: ''
    });
    this.commitMessageInput.value = '';
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

  handleCommitMessageChange(e) {
    let msg = e.target.value.trim();
    this.setState({
      commitMessage: msg
    });
  }

  updateFileContentInTree(tree, recursiveTree) {
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
        this.updateFileContentInTree(tree, file);
      }
      else {
        // File: update file.content in tree
        let treeFile = _.find(tree.tree, function(f) {
          return (('/' + f.path) == file.path) || (f.path == file.path);
        });

        // GitHub API doc says
        //   Use either tree.content or tree.sha
        //   We go with content for text files if the file has been touched
        //   We go with sha for binary files if the file is newly uploaded;
        //     because GLIDE currently doesn't support image editing

        // Use the latest version of content
        treeFile.content = file.newContent ? file.newContent : file.originalContent;

        // For text file that was opened on GLIDE
        if(treeFile.content && FileUtil.isText(treeFile)) {
          // Use content that could have been potentially updated
          delete treeFile.sha;
        }
        else {
          // Just use the sha;
          //   this file has never been opened on GLIDE
          //   or this file's blob has been created on GitHub
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

  handleCommitClick() {
    // POST tree to make a create tree request
    let tree = this.state.tree;
    let recursiveTree = this.state.recursiveTree;

    this.updateFileContentInTree(tree, recursiveTree);

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
    //   We go with content for text files sha for binary files
    // let essentialKeys = ['path', 'mode', 'type', 'content', 'sha'];
    // for(let i in tree.tree) {
    //   let file = tree.tree[i];
    //   for(let key in file) {
    //     if(!_.includes(essentialKeys, key)) {
    //       delete file[key];
    //     }
    //   }
    // }

    _.forEach(tree.tree, function(file) {
      // Remove potential leading / from treeFile.path
      if(file.path.startsWith('/')) {
        file.path = file.path.substring(1);
      }
    });

    // TODO: One suspicious thing: empty subfolders sometimes cause troubles?

    // Remove tree type files with null value of sha
    //   These are subfolders created by the user
    _.remove(tree.tree, function(file) {
      return file.type == 'tree' && file.sha == null;
    });

    // console.debug('tree optimized before commit & push', tree);
    
    let repository = this.state.repository;
    let branch = this.state.branch;
    let commit = this.state.commit;
    let message = this.state.commitMessage;
    let url = '/api/project/commit';
    let self = this;
    let app = this.props.app;
    let loadingMsgHandle = this.pushLoadingMsg('Commiting changes and pushing the branch to the remote repository');

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
        // console.debug(response);
        if('error' in response) {
          //
        }
        else {
          self.setState({
            commitMessage: ''
          }, function() {
            app.setState({
              changedFiles: [],
              addedFiles: [],
              removedFiles: []
            }, function() {
              self.openCommit(branch);
              self.popLoadingMsg(loadingMsgHandle);
            });
          });
        }
      }
    });
  }

  openCommit(branch) {
    // GET commits on the branch
    let url = '/api/project/commits/'
      + this.state.repository.full_name
      + '/' + branch.name;
    let app = this.props.app;
    let self = this;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        if('error' in response) {
          // TODO
        }
        else {
          // Set the current branches, branch, commits, and commit
          //   as specified
          let commits = response.commits;
          let latestCommit = commits[0];
          let branches = self.state.branches;
          let isExisting = _.find(branches, function(b) {
            return b.name == branch.name;
          });
          if(!isExisting) {
            branches.push(branch);
          }

          app.setState({
            branches: branches,
            branch: branch,
            commits: commits,
            commit: latestCommit,
            filesOpened: [],
            fileActive: null
          }, function() {
            self.hardClone(
              self.state.repository,
              branch
            );
          });
        }
      }
    });
  }

  hardClone(repository, branch) {
    // POST request for Hexo initialization
    let url = '/api/project/hardclone';
    let self = this;
    let loadingMsgHandle = this.pushLoadingMsg('Updating your workspace after commit & push');

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        cloneUrl: repository.clone_url,
        repository: repository.full_name,
        branch: branch.name
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        // console.debug(response);
        if('error' in response) {
          // TODO
        }
        else {
          self.popLoadingMsg(loadingMsgHandle);
          $('a.nav-link[data-command=log]').click();
          let msg = 'Your changes have been successfully commited & pushed!';
          Alert.success(msg);
          self.reset();
        }
      }
    });
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      branches: this.props.branches,
      commit: this.props.commit,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      branches: nextProps.branches,
      commit: nextProps.commit,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree
    });
  }

  handleGoBackClick(e) {
    let app = this.props.app;
    app.setState({
      phase: app.state.constants.APP_PHASE_COMMIT_OPEN
    });
  }

  handleProceedClick(e) {
    let app = this.props.app;
    app.setState({
      phase: app.state.constants.APP_PHASE_PULL_REQUEST
    });
  }

  render() {
    let app = this.props.app;
    let commitable = app.state.changedFiles.length > 0 || app.state.addedFiles.length > 0;
    let pullRequestable = app.state.initialCommit && this.state.commit &&
      app.state.initialCommit.sha != this.state.commit.sha && !commitable;

    return (
      <div className="container">

        <div className="row">
          <div className="col">
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

          <div className="col-lg-5 col-md-5">

            <p className="h4">
              <span className="text-muted">Changes will be confirmed and saved</span>
            </p>

            <div className="form-group">
              <label className="col-form-label col-form-label-lg">Commit Message</label>
              <input
                ref={(c) => this.commitMessageInput = c}
                disabled={!commitable}  
                className="form-control form-control-lg" type="text"
                onChange={this.handleCommitMessageChange}
                placeholder="What does this commit do to your repository?" />
            </div>

            <button
              type="button" onClick={this.handleCommitClick}
              disabled={this.state.commitMessage == ''}
              className="btn btn-success btn-lg btn-block">
              Commit & Push
            </button>

            {
              pullRequestable &&
              <div style={{marginTop: 16}}>
                <p className="lead">
                  Now, you may go back to <strong className="text-primary">Code & Test</strong> step and continue to work on your code.
                </p>
                <button
                  type="button" onClick={this.handleGoBackClick}
                  className="btn btn-secondary btn-lg btn-block">
                  Go Back to Code & Test
                </button>
                <p><br /></p>
                <p className="lead">
                  If you're done with your branch, go to <strong className="text-primary">Make Pull Request</strong> step to notify the repository owner.
                </p>
                <button
                  type="button" onClick={this.handleProceedClick}
                  disabled={!pullRequestable}
                  className="btn btn-success btn-lg btn-block">
                  Proceed to Pull Request
                </button>
              </div>
            }

          </div>

          {
            commitable &&
            <div className="col-lg-7 col-md-7">
              <div className="helper-text">
                <p className="lead">
                  <strong className="text-info">Commit</strong> is a checkpoint where the content is saved along with a message that describes what changes have been made.
                </p>
                <p className="lead">
                  <strong className="text-info">Commit message</strong> is a short description of the commit you're making.
                  This helps you and the collaboraors understand what changes are made on your branch later on.
                </p>
                <p className="lead">
                  <strong className="text-info">Push</strong> means your branch is uploaded to remote repository from which you cloned the repository to begin with.
                </p>
                <p className="lead">
                  <strong className="text-info">Commit</strong> and <strong className="text-info">push</strong> are separate operations, but GLIDE pushes every single commit just because you will lose unpushed commits when you close the web browser.
                </p>
              </div>
            </div>
          }

          {
            !commitable &&
            app.state.commits &&
            <div className="col-lg-7 col-md-7" style={{maxHeight: '65vh', overflow: 'scroll'}}>
              <label className="col-form-label col-form-label-lg">Commit Log</label>
              <div className="list-group">
                {
                  app.state.commits.map(function(item, index) {
                    return (
                      <div key={index} className="list-group">
                        <div className={"list-group-item list-group-item-action flex-column align-items-start" + (index == 0 ? " active" : "")}>
                          <h5 className="mb-1">{item.commit.message}</h5>
                          <div className="d-flex w-100 justify-content-between">
                            <small>by <strong>{item.commit.author.name}</strong></small>
                            <small>
                              at {new Date(item.commit.author.date).toLocaleTimeString()}&nbsp;
                              on {new Date(item.commit.author.date).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    );
                  }.bind(this))
                }
              </div>
            </div>
          }

        </div>

        <Alert
          stack={{limit: 1, spacing: 2}}
          timeout={3000} html={true}
          effect='stackslide' position='top' />
      </div>
    );
  }
}

export default CommitPushPane;
