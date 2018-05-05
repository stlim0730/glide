import Alert from 'react-s-alert';
// import Files from 'react-files';
// import Serializers from '../util/Serializers.js';
import FileUtil from '../util/FileUtil.js';
// import FileUploadThumbnail from './FileUploadThumbnail.js';

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

    // this._reset = this._reset.bind(this);
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

  // _reset() {
  //   let self = this;

  //   this.setState({
  //     fileOrFolder: null,
  //     fileName: '',
  //     fileCreationMode: null,
  //     filesToUpload: [],
  //     filesFailedToUpload: []
  //   }, function() {
  //     self.fileNameInput.value = '';
  //     $('.file-creation-tabs').removeClass('active');
  //     $('.file-creation-panes').removeClass('active show in');
  //     document.getElementById('fileFormToReset').reset();
  //   });
  // }

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
    let fileName = e.target.value.trim();

    if(FileUtil.validateFileName(fileName)) {
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

    switch(this.state.fileManipulation) {
      case 'Rename':
        // Update tree
        let targetFile = _.find(tree.tree, function(f) {
          return f.path === fileToManipulate.path;
        });
        let fileNameRegex = new RegExp(targetFile.name + '$');
        targetFile.path = targetFile.path.replace(fileNameRegex, this.state.newFileName);
        targetFile.name = this.state.newFileName;
        // Update recursiveTree
        let folders = fileToManipulate.path.split('/');
        this.updateRecursiveTree(recursiveTree, this.state.fileManipulation, fileToManipulate, folders);
        if(!_.find(removedFiles, function(f) { 
          return f.path === oldFileDummy.path; })) {
          removedFiles.push(oldFileDummy);
        }
        if(!_.find(addedFiles, function(f) { 
          return f.path === targetFile.path; })) {
          addedFiles.push(targetFile);
        }
        // TODO: Original file remains when committed and pushed
        app.setState({
          tree: tree,
          recursiveTree: recursiveTree,
          addedFiles: addedFiles,
          changedFiles: changedFiles,
          removedFiles: removedFiles
        }, function() {
          // console.log(removedFiles, app.state.removedFiles);
        });
        break;
      case 'Delete':
        break;
      case 'Copy':
        break;
    }
  }

  // handleSubmit() {
  //   let self = this;
  //   let tree = this.state.tree;
  //   let recursiveTree = this.state.recursiveTree;
  //   let fileName = this.state.fileName;

  //   // Must remove leading '/'
  //   let path = this.pathInput.value.trim();
  //   path = (path.startsWith('/') ? path.substring(1) : path);
    
  //   // Duplicate check
  //   let exists = false;
  //   if(self.state.fileCreationMode=='upload') {
  //     _.forEach(self.state.filesToUpload, function(fileToUpload) {
  //       exists = exists || _.find(tree.tree, function(file) {
  //         return _.lowerCase(file.path) === _.lowerCase(path + fileToUpload.name);
  //       });
  //     });
  //   }
  //   else {
  //     exists = _.find(tree.tree, function(file) {
  //       return _.lowerCase(file.path) === _.lowerCase(path + fileName);
  //     });
  //   }

  //   if(exists) {
  //     console.error('GLIDE: The same file name already exists!');
  //     this._reset();
  //     let msg = 'The same file name already exists!';
  //     Alert.error(msg);
  //     return;
  //   }

  //   // Upload the data
  //   let data = {
  //     repository: this.state.repository.full_name,
  //     branch: this.state.branch.name,
  //     path: path
  //   };
    
  //   let contentType = 'application/json; charset=utf-8';
  //   let processData = true;

  //   switch(this.state.fileCreationMode) {
  //     case 'file':
  //       data.fileOrFolder = this.state.fileOrFolder;
  //       data.fileName = fileName;
  //       data = JSON.stringify(data);
  //       break;
  //     case 'upload':
  //       let formData = new FormData();
  //       processData = false;
  //       contentType = false;
  //       _.forEach(this.state.filesToUpload, function(f) {
  //         formData.append('files', f, f.name);
  //         // formData.append(f.name + '-type', f.type);
  //       });
  //       formData.append('repository', data.repository);
  //       formData.append('branch', data.branch);
  //       formData.append('path', data.path);
  //       data = formData;
  //       break;
  //   }

  //   // POST new file to GLIDE server
  //   let app = this.props.app;
  //   let url = this.state.fileCreationMode == 'upload' ?
  //     '/api/project/file/upload' :
  //     '/api/project/file/new';

  //   $.ajax({
  //     url: url,
  //     method: 'POST',
  //     headers: { 'X-CSRFToken': window.glide.csrfToken },
  //     dataType: 'json',
  //     processData: processData,
  //     contentType: contentType,
  //     data: data,
  //     success: function(response) {
  //       // console.debug(response);
  //       if('error' in response) {
  //         // TODO
  //       }
  //       else {

  //         // Create the new file objects created on the server
  //         let createdFiles = response.createdFiles;
  //         let addedFiles = app.state.addedFiles;

  //         _.forEach(createdFiles, function(createdFile) {
  //           // To match encoding / decoding scheme to blobs through GitHub API
  //           if(self.state.fileCreationMode != 'file' || self.state.fileOrFolder != 'folder') {
  //             // When the created object is a file, not a folder
  //             if(FileUtil.isBinary(createdFile)) {
  //               // For binary files: atob decodes
  //               createdFile.originalContent = atob(createdFile.originalContent);
  //             }
  //             else {
  //               // For text files
  //               createdFile.originalContent = Serializers.b64DecodeUnicode(createdFile.originalContent);
  //             }

  //             // Update addedFiles
  //             //   Just remove potentially existing duplicate
  //             //   and just push the new file.
  //             _.remove(addedFiles, function(file) {
  //               return file.path == createdFile.path;
  //             });
  //             addedFiles.push(createdFile);
  //           }
            
  //           // Push the file into tree
  //           //   Duplicate check not required: UI has addressed it
  //           //   (c.f., EditorPane)
  //           tree.tree.push(createdFile);

  //           // Push the file into recursiveTree
  //           let folders = createdFile.path.split('/');
  //           self.updateRecursiveTree(recursiveTree, createdFile, folders);
  //         });

  //         self.setState({
  //           recursiveTree: recursiveTree,
  //           tree: tree
  //         }, function() {
  //           app.setState({
  //             recursiveTree: recursiveTree,
  //             tree: tree,
  //             addedFiles: addedFiles
  //           }, function() {
  //             self.createBinaryBlob(addedFiles);
  //             self._reset();
  //           });
  //         });
  //       }
  //     }
  //   });

  //   //
  //   // Note:
  //   //   Blob is automatically created on GitHub
  //   //   when the branch is pushed and tree has blob content.
  //   // 
  // }

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
                    className="form-control" value={this.state.fileToManipulate.name} />
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
                this.state.fileCreationMode != 'Rename' &&
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
