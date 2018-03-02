import Files from 'react-files';
import FileUploadThumbnail from './FileUploadThumbnail.js';
import Alert from 'react-s-alert';

// 
// CreateFileModalContent component
// 
class CreateFileModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      fileOrFolder: null,
      fileName: '',
      tree: null,
      recursiveTree: null,
      fileCreationMode: null,
      filesToUpload: [],
      filesFailedToUpload: [],
      tempFileInput: null
    };

    this._reset = this._reset.bind(this);
    this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
    this.handleFileCreationModeChange = this.handleFileCreationModeChange.bind(this);
    this.handleFileOrFolderChange = this.handleFileOrFolderChange.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleUploadFilesChange = this.handleUploadFilesChange.bind(this);
    this.handleUploadFilesError = this.handleUploadFilesError.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  _reset() {
    let self = this;

    this.setState({
      fileOrFolder: null,
      fileName: '',
      fileCreationMode: null,
      filesToUpload: [],
      filesFailedToUpload: []
    }, function() {
      self.fileNameInput.value = '';
      $('.file-creation-tabs').removeClass('active');
      $('.file-creation-panes').removeClass('active show in');
      document.getElementById('fileFormToReset').reset();
    });
  }

  // static slugify(str) {
  //   return str.toLowerCase()
  //     .replace(/\s+/g, '-') // Replace spaces with -
  //     .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  //     .replace(/\-\-+/g, '-') // Replace multiple - with single -
  //     .replace(/^-+/, '') // Trim - from start of text
  //     .replace(/-+$/, '') // Trim - from end of text
  //     .trim();
  // }

  static validateFileName(fileName) {
    // Validate the file name
    // TODO: Allow unicode word characters
    let fileNameRegex = /^([\w\s\.-]+)$/i;
    if(fileNameRegex.test(fileName)) {
      return true;
    }
    else {
      return false;
    }
  }

  _addFileToRecursiveTree(recursiveTree, newFile, folders) {
    if(folders.length == 1) {
      // This is the location where we add the file
      // Duplicate Check:
      //   This component does duplicate check on the UI before the add operation
      //   So, just push it
      //   (c.f., EditorPane)
      recursiveTree.nodes.push(newFile);
    }
    else {
      // We should go deeper
      let folderName = folders.shift();
      let targetFolder = _.find(recursiveTree.nodes, {name: folderName, type: 'tree'});
      if(targetFolder) {
        // The target path exists
        this._addFileToRecursiveTree(targetFolder, newFile, folders);
      }
      else {
        // Create a subfolder
        let subdirs = '/' + folders.join('/');
        let path  = '/' + newFile.path.replace(subdirs, '');
        // Create a folder
        let newFolder = {
          name: folderName,
          nodes: [],
          path: path,
          type: 'tree',
          mode: '040000'
        };

        recursiveTree.nodes.push(newFolder);
        this._addFileToRecursiveTree(newFolder, newFile, folders);
      }
    }
  }

  handleFileCreationModeChange(e) {
    this.setState({
      fileCreationMode: $(e.target).data('mode')
    });
  }

  handleFileOrFolderChange(e) {
    this.setState({
      fileOrFolder: e.target.value
    });
  }

  handleFileNameChange(e) {
    let fileName = e.target.value.trim();

    if(CreateFileModalContent.validateFileName(fileName)) {
      this.setState({
        fileName: fileName
      });
    }
    else {
      this.setState({
        fileName: ''
      });
    }
  }

  handleKeyUp(e) {
    let keyCode = e.keyCode;
    if(keyCode == 13) {
      this.submitButton.click();
    }
  }

  handleUploadFilesChange(files) {
    let self = this;
    this.setState({
      filesToUpload: files
    }, function() {
      console.log(self.state.filesToUpload.length, self.state.filesToUpload);
    });
  }

  handleUploadFilesError(error, file) {
    // console.log('file error', error, file);
    let filesFailedToUpload = this.state.filesFailedToUpload;
    filesFailedToUpload.push(file);
    this.setState({
      filesFailedToUpload: filesFailedToUpload
    });

    // Note: error.code
    //   1. Invalid file type
    //   2. File too large
    //   3. File too small
    //   4. Maximum file count reached
  }

  static b64DecodeUnicode(base64) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  handleSubmit() {
    let self = this;
    let tree = this.state.tree;
    let recursiveTree = this.state.recursiveTree;
    let fileName = this.state.fileName;

    // Must remove leading '/'
    let path = this.pathInput.value.trim();
    path = (path.startsWith('/') ? path.substring(1) : path);
    
    // Duplicate check
    let exists = false;
    if(self.state.fileCreationMode=='upload') {
      _.forEach(self.state.filesToUpload, function(fileToUpload) {
        exists = exists || _.find(tree.tree, function(file) {
          return _.lowerCase(file.path) === _.lowerCase(path + fileToUpload.name);
        });
      });
    }
    else {
      exists = _.find(tree.tree, function(file) {
        return _.lowerCase(file.path) === _.lowerCase(path + fileName);
      });
    }

    if(exists) {
      console.error('GLIDE: The same file name already exists!');
      this._reset();
      let msg = 'The same file name already exists!';
      Alert.error(msg);
      return;
    }

    // Upload the data
    let data = {
      repository: this.state.repository.full_name,
      branch: this.state.branch.name,
      path: path
    };
    
    let contentType = 'application/json; charset=utf-8';
    let processData = true;

    switch(this.state.fileCreationMode) {
      case 'file':
        data.fileOrFolder = this.state.fileOrFolder;
        data.fileName = fileName;
        data = JSON.stringify(data);
        break;
      case 'upload':
        let formData = new FormData();
        processData = false;
        contentType = false;
        _.forEach(this.state.filesToUpload, function(f) {
          formData.append('files', f, f.name);
          // formData.append(f.name + '-type', f.type);
        });
        formData.append('repository', data.repository);
        formData.append('branch', data.branch);
        formData.append('path', data.path);
        data = formData;
        break;
    }

    // POST new file to GLIDE server
    let app = this.props.app;
    let url = this.state.fileCreationMode == 'upload' ?
      '/api/project/file/upload' :
      '/api/project/file/new';

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      processData: processData,
      contentType: contentType,
      data: data,
      success: function(response) {
        // console.debug(response);
        if('error' in response) {
          // TODO
        }
        else {

          // Create the new file objects created on the server
          let createdFiles = response.createdFiles;
          let addedFiles = app.state.addedFiles;

          _.forEach(createdFiles, function(createdFile) {
            // To match encoding / decoding scheme to blobs through GitHub API
            if(self.state.fileCreationMode != 'file' || self.state.fileOrFolder != 'folder') {
              // When the created object is a file, not a folder

              let raw = createdFile.originalContent;//response.blob.content;
              let newDecoder = CreateFileModalContent.b64DecodeUnicode(raw);
              
              createdFile.originalContent = atob(raw);

              console.debug('raw', raw);
              console.debug('newDecoder', newDecoder);
              console.debug('atob', createdFile.originalContents);

              // Update addedFiles
              //   Just remove potentially existing duplicate
              //   and just push the new file.
              _.remove(addedFiles, function(file) {
                return file.path == createdFile.path;
              });
              addedFiles.push(createdFile);
            }
            
            // Push the file into tree
            //   Duplicate check not required: UI has addressed it
            //   (c.f., EditorPane)
            tree.tree.push(createdFile);

            // Push the file into recursiveTree
            let folders = createdFile.path.split('/');
            self._addFileToRecursiveTree(recursiveTree, createdFile, folders);
          });

          self.setState({
            recursiveTree: recursiveTree,
            tree: tree
          }, function() {
            app.setState({
              recursiveTree: recursiveTree,
              tree: tree,
              addedFiles: addedFiles
            }, function() {
              self._reset();
            });
          });
        }
      }
    });

    //
    // Note:
    //   Blob is automatically created on GitHub
    //   when the branch is pushed and tree has blob content.
    // 
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree
    });
  }

  render() {
    return (
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            Create a New File or Folder
          </h5>
          <button
            type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        
        <div className="modal-body">
          
          <fieldset>
            <div className="form-group">
              <label className="control-label">
                Path
              </label>
              <div className="">
                <input
                  type="text"
                  ref={(c) => this.pathInput = c}
                  className="form-control pathInput"
                  maxLength="255"
                  disabled />
              </div>
            </div>
          </fieldset>

          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a
                data-mode="file"
                title=""
                href="#file-creation-file" onClick={this.handleFileCreationModeChange}
                data-toggle="tab" className="nav-link file-creation-tabs">
                File or Folder
              </a>
            </li>
            <li className="nav-item">
              <a
                data-mode="upload"
                title=""
                href="#file-creation-upload" onClick={this.handleFileCreationModeChange}
                data-toggle="tab" className="nav-link file-creation-tabs">
                Upload
              </a>
            </li>
          </ul>

          <div className="tab-content">

            <div id="file-creation-file"
              className="form-group file-creation-panes tab-pane fade padding-20 no-margin">
              <fieldset>
                <label>
                  <input
                    type="radio" value="file"
                    checked={this.state.fileOrFolder=='file'}
                    onChange={this.handleFileOrFolderChange} />&nbsp;File
                </label>
                &emsp;
                <label>
                  <input
                    type="radio" value="folder"
                    checked={this.state.fileOrFolder=='folder'}
                    onChange={this.handleFileOrFolderChange} />&nbsp;Folder
                </label>
                <br />
                <label className="control-label">
                  {this.state.fileOrFolder == 'folder' ? 'Folder' : 'File'} Name
                </label>
                <div>
                  <input
                    type="text" disabled={!this.state.fileOrFolder}
                    onChange={this.handleFileNameChange}
                    onKeyUp={this.handleKeyUp}
                    ref={(c) => this.fileNameInput = c}
                    className="form-control" maxLength="255" />
                </div>
              </fieldset>
            </div>

            <div id="file-creation-upload"
              className="form-group file-creation-panes tab-pane fade padding-20 no-margin">
              <div className="card border-light mb-3" style={{marginBottom: 0}}>
                <div className="card-body pointer files">
                  <form id="fileFormToReset">
                    <Files
                      ref={(c) => this.filesComponent = c}
                      className='files-dropzone'
                      onChange={this.handleUploadFilesChange}
                      onError={this.handleUploadFilesError}
                      accepts={
                        [
                          'audio/*',
                          'font/*',
                          'image/*',
                          'text/*',
                          'video/*',
                          'application/json',
                          'application/yaml',
                          'application/javascript'
                        ]
                      }
                      multiple={false} maxFileSize={1024 * 1024 * 5}
                      minFileSize={0} clickable={true}>
                      <h4 className="card-title text-center">
                        Drag & drop files<br />
                        or click to browse
                      </h4>
                      {
                        this.state.filesToUpload.length == 0 &&
                        <p className="card-text text-muted text-center">
                          A file should be smaller than <strong>5MB</strong>.<br />
                          You may upload <strong>1</strong> file per upload.
                        </p>
                      }
                      <ul className="list-group">
                      {
                        this.state.filesToUpload.length > 0 &&
                        this.state.filesToUpload.map(function(file, index) {
                          return (
                            <FileUploadThumbnail
                              key={index} file={file}
                              CreateFileModalContent={this} />
                          );
                        }.bind(this))
                      }
                      </ul>
                      {
                        this.state.filesFailedToUpload.length > 0 &&
                        <p className="card-text text-muted text-center">
                          <br />
                          This file can't be uploaded.<br />
                        </p>
                      }
                      <ul className="list-group">
                      {
                        this.state.filesFailedToUpload.map(function(file, index) {
                          return (
                            <FileUploadThumbnail
                              key={index} file={file} error={true}
                              CreateFileModalContent={this} />
                          );
                        }.bind(this))
                      }
                      </ul>
                    </Files>
                  </form>
                </div>
              </div>
            </div>

          </div>

        </div>
        
        <div className="modal-footer">
          <button
            type="button" className="btn btn-secondary"
            data-dismiss="modal" onClick={this._reset}>
            Close
          </button>
          <button
            type="button" ref={(c) => this.submitButton = c}
            className="btn btn-primary" onClick={this.handleSubmit}
            data-dismiss="modal" disabled={
              !this.state.fileCreationMode ||
              (
                this.state.fileCreationMode == 'file' &&
                !this.state.fileOrFolder
              ) ||
              (
                this.state.fileCreationMode == 'upload' &&
                this.state.filesToUpload.length == 0
              ) ||
              (
                this.state.fileCreationMode != 'upload' &&
                !CreateFileModalContent.validateFileName(this.state.fileName)
              )
            }>
            Submit
          </button>
        </div>

        <Alert
          stack={{limit: 1, spacing: 2}}
          timeout={3000} html={true}
          effect='stackslide' position='top' />
      </div>
    );
  }
}

export default CreateFileModalContent;
