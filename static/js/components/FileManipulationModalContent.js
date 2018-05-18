import Alert from 'react-s-alert';
// import Files from 'react-files';
import FileNode from './FileNode.js';
import Serializers from '../util/Serializers.js';
import FileUtil from '../util/FileUtil.js';


// 
// FileManipulationModalContent component
// 
class FileManipulationModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      tree: null,
      recursiveTree: null,
      fileManipulation: null,
      fileToManipulate: null,
      newFileName: ''
    };

    this.reset = this.reset.bind(this);
    this.updateRecursiveTree = this.updateRecursiveTree.bind(this);
    // this.handleFileCreationModeChange = this.handleFileCreationModeChange.bind(this);
    // this.handleFileOrFolderChange = this.handleFileOrFolderChange.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    // this.handleKeyUp = this.handleKeyUp.bind(this);
    // this.handleUploadFilesChange = this.handleUploadFilesChange.bind(this);
    // this.handleUploadFilesError = this.handleUploadFilesError.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    // this.createBinaryBlob = this.createBinaryBlob.bind(this);
  }

  reset() {
    let self = this;

    this.setState({
      fileManipulation: null,
      fileToManipulate: null,
      newFileName: ''
    });
  }

  updateRecursiveTree(recursiveTree, manipulation, fileToManipulate, folders) {
    if(folders.length == 1) {
      switch(manipulation) {
        case 'Rename':
          let targetFile = _.find(recursiveTree.nodes, function(f) {
            return f.path === fileToManipulate.path;
          });
          let fileNameRegex = new RegExp(targetFile.name + '$');
          targetFile.path = targetFile.path.replace(fileNameRegex, this.state.newFileName);
          targetFile.name = this.state.newFileName;
          break;
        case 'Delete':
          let targetPath = fileToManipulate.path
          let removed = _.remove(recursiveTree.nodes, function(f) {
            return f.path === targetPath || f.path.startsWith(targetPath + '/');
          });
          break;
        case 'Copy':
          break;
      }
    }
    else {
      // We should go deeper
      let folderName = folders.shift();
      let targetFolder = _.find(recursiveTree.nodes, {name: folderName, type: 'tree'});
      // The target path always exists; no need to check
      this.updateRecursiveTree(targetFolder, manipulation, fileToManipulate, folders);
    }
  }

  handleFileNameChange(e) {
    let tree = this.state.tree;
    let fileName = e.target.value.trim();
    let fileToManipulate = this.state.fileToManipulate;
    let fileNameRegex = new RegExp(fileToManipulate.name + '$');
    let path = fileToManipulate.path.replace(fileNameRegex, '');
    let duplicate = _.find(tree.tree, function (f) {
      return f.path === path + fileName;
    });

    if(FileUtil.validateFileName(fileName)
      && this.oldFileNameInput.value != fileName
      && !duplicate) {
      this.setState({
        newFileName: fileName
      });
    }
    else {
      this.setState({
        newFileName: ''
      });
    }
  }

  handleKeyUp(e) {
    let keyCode = e.keyCode;
    if(keyCode == 13) {
      this.confirmButton.click();
    }
  }

  handleConfirm(e) {
    let app = this.props.app;
    let tree = this.state.tree;
    let recursiveTree = this.state.recursiveTree;
    let addedFiles = app.state.addedFiles;
    let changedFiles = app.state.changedFiles;
    let removedFiles = app.state.removedFiles;
    let fileToManipulate = this.state.fileToManipulate;
    let oldFileDummy = JSON.parse(JSON.stringify(fileToManipulate));

    // TODO: Get ready for Ajax call
    let manipulation = this.state.fileManipulation;
    let source = null;
    let targetPath = '';
    switch(manipulation) {
      case 'Rename':
        source = fileToManipulate;
        let fileNameRegex = new RegExp(source.name + '$');
        targetPath = source.path.replace(fileNameRegex, this.state.newFileName);
        break;
      case 'Delete':
        targetPath = this.state.fileToManipulate.path;
        break;
      case 'Copy':
        break;
    }

    // Ajax call for server side file manipulation
    let url = '/api/project/file/manipulate';
    let self = this;
    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        'manipulation': this.state.fileManipulation.toLowerCase(),
        'source': source,
        'targetPath': targetPath,
        'repository': this.state.repository.full_name,
        'branch': this.state.branch.name
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        // console.debug(response);
        if('error' in response) {
          // TODO
        }
        else {
          let folders;
          switch(manipulation) {
            case 'Rename':
              // Update tree
              let targetFile = _.find(tree.tree, function(f) {
                return f.path === source.path;
              });
              if(FileUtil.isBinary(targetFile)) {
                // For binary files: atob decodes
                targetFile.originalContent = atob(response.content);
              }
              else {
                // For text files
                targetFile.originalContent = Serializers.b64DecodeUnicode(response.content);
              }
              targetFile.path = targetPath;
              targetFile.name = self.state.newFileName;
              // Update recursiveTree
              folders = fileToManipulate.path.split('/');
              self.updateRecursiveTree(recursiveTree, self.state.fileManipulation, fileToManipulate, folders);
              // Update Git status
              if(!_.find(removedFiles, function(f) { 
                return f.path === oldFileDummy.path; })) {
                removedFiles.push(oldFileDummy);
              }
              _.remove(changedFiles, function(f) {
                return f.path === oldFileDummy.path;
              });
              if(!_.find(addedFiles, function(f) { 
                return f.path === targetFile.path; })) {
                addedFiles.push(targetFile);
              }
              // Update app state
              self.setState({
                newFileName: ''
              }, function() {
                app.setState({
                  tree: tree,
                  recursiveTree: recursiveTree,
                  fileToManipulate: null,
                  addedFiles: addedFiles,
                  changedFiles: changedFiles,
                  removedFiles: removedFiles
                }, function() {
                  self.reset();
                  // console.log(self.state.tree, self.state.recursiveTree);
                });
              });
              break;
            case 'Delete':
              // Update tree
              _.remove(tree.tree, function(f) {
                return f.path === targetPath || f.path.startsWith(targetPath + '/');
              });
              // Update recursiveTree
              folders = fileToManipulate.path.split('/');
              self.updateRecursiveTree(recursiveTree, self.state.fileManipulation, fileToManipulate, folders);
              // TODO: Git status
              if(!_.find(removedFiles, function(f) { 
                return f.path === oldFileDummy.path; })) {
                removedFiles.push(oldFileDummy);
              }
              _.remove(changedFiles, function(f) {
                return f.path === oldFileDummy.path;
              });
              _.remove(addedFiles, function(f) {
                return f.path === oldFileDummy.path;
              });
              // Update app state
              app.setState({
                tree: tree,
                recursiveTree: recursiveTree,
                fileToManipulate: null,
                addedFiles: addedFiles,
                changedFiles: changedFiles,
                removedFiles: removedFiles
              }, function() {
                self.reset();
                // console.log(self.state.tree, self.state.recursiveTree);
              });
              break;
            case 'Copy':
              break;
          }
        }
      }
    });
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree,
      fileManipulation: this.props.fileManipulation,
      fileToManipulate: this.props.fileToManipulate
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      fileManipulation: nextProps.fileManipulation,
      fileToManipulate: nextProps.fileToManipulate
    });
  }

  render() {
    return (
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {this.state.fileManipulation} the selected file
          </h5>
          <button
            type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        
        <div className="modal-body">
          

          {
            this.state.fileManipulation == 'Rename' &&
            <fieldset>
              <div className="form-group">
                <label className="control-label">
                  Old Name
                </label>
                <div>
                  <input
                    type="text" maxLength="255" disabled
                    ref={(c) => this.oldFileNameInput = c}
                    className="form-control" value={this.state.fileToManipulate ? this.state.fileToManipulate.name : ''} />
                </div>
                <label className="control-label">
                  New Name
                </label>
                <div>
                  <input
                    type="text" maxLength="255"
                    ref={(c) => this.newFileNameInput = c}
                    className="form-control" onChange={this.handleFileNameChange} />
                </div>
              </div>
            </fieldset>
          }

          {
            this.state.fileManipulation == 'Delete' &&
            <fieldset>
              <div className="form-group">
                Are you sure you want to delete {this.state.fileToManipulate ? this.state.fileToManipulate.path : ''}?
              </div>
            </fieldset>
          }

          {
            this.state.fileManipulation == 'Copy' &&
            <fieldset>
              <div className="form-group">
                <label className="control-label">
                  Source
                </label>
                <div>
                  <input
                    type="text" maxLength="255" disabled
                    ref={(c) => this.sourcePathInput = c}
                    className="form-control" value={this.state.fileToManipulate ? this.state.fileToManipulate.path : ''} />
                </div>
                <label className="control-label">
                  Target
                </label>
                <div>
                  <input
                    type="text" maxLength="255" disabled
                    ref={(c) => this.targetPathInput = c}
                    className="form-control" />
                </div>
                {
                  this.state.recursiveTree &&
                  <div style={{maxHeight: '60vh', overflow: 'auto'}}>
                    <FileNode
                      app={this.props.app}
                      repository={this.state.repository}
                      tree={this.state.tree}
                      folderOnly={true}
                      fileControlUi={false}
                      currentPath=''
                      nodes={this.state.recursiveTree.nodes} />
                  </div>
                }
              </div>
            </fieldset>
          }

        </div>
        
        <div className="modal-footer">
          <button
            type="button" className="btn btn-secondary"
            data-dismiss="modal" onClick={this._reset}>
            Close
          </button>
          <button
            type="button" ref={(c) => this.confirmButton = c}
            className="btn btn-primary" onClick={this.handleConfirm}
            data-dismiss="modal" disabled={
              (
                this.state.fileManipulation == 'Rename' &&
                !FileUtil.validateFileName(this.state.newFileName)
              )
            }>
            Confirm
          </button>
        </div>

        {
          // <Alert
          //   stack={{limit: 1, spacing: 2}}
          //   timeout={3000} html={true}
          //   effect='stackslide' position='top' />
        }
      </div>
    );
  }
}

export default FileManipulationModalContent;
