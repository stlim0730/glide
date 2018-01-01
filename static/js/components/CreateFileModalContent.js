import Files from 'react-files';
import FileUploadThumbnail from './FileUploadThumbnail.js';

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
      scaffold: null,
      scaffolds: [],
      filesToUpload: [],
      filesFailedToUpload: [],
      tempFileInput: null
    };

    this._reset = this._reset.bind(this);
    this._slugify = this._slugify.bind(this);
    this._validateFileName = this._validateFileName.bind(this);
    // this._loadTemplateFiles = this._loadTemplateFiles.bind(this);
    // this._isTemplateFile = this._isTemplateFile.bind(this);
    // this._isDataFile = this._isDataFile.bind(this);
    this._fileNameOnly = this._fileNameOnly.bind(this);
    // this._loadThemeStructure = this._loadThemeStructure.bind(this);
    this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
    // this._loadTemplateContent = this._loadTemplateContent.bind(this);
    // this._countLayouts = this._countLayouts.bind(this);
    // this._renderThemeStructure = this._renderThemeStructure.bind(this);
    this.handleFileCreationModeChange = this.handleFileCreationModeChange.bind(this);
    this.handleFileOrFolderChange = this.handleFileOrFolderChange.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.handleScaffoldChange = this.handleScaffoldChange.bind(this);
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
      scaffold: null,
      scaffolds: [],
      filesToUpload: [],
      filesFailedToUpload: []
    }, function() {
      self.fileNameInput1.value = '';
      self.fileNameInput2.value = '';
      $('.file-creation-tabs').removeClass('active');
      $('.file-creation-panes').removeClass('active show in');
      document.getElementById('fileFormToReset').reset();
    });
  }

  _slugify(str) {
    return str.toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
      .trim();
  }

  _validateFileName(fileName) {
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

  // _isTemplateFile(file) {
  //   let templateExtensionsRegex = /\.(ejs|swig|htm|html)$/i;
  //   if(templateExtensionsRegex.test(file.name)) {
  //     return true;
  //   }
  //   else {
  //     return false;
  //   }
  // }

  // _isDataFile(fileName) {
  //   if(this.state.fileOrFolder != 'file') {
  //     return false;
  //   }

  //   let markdownRegex = /\.(md|markdown|mdown|mkdn|mkd)$/i;
  //   if(markdownRegex.test(fileName)) {
  //     return true;
  //   }
  //   else {
  //     return false;
  //   }
  // }

  _fileNameOnly(file) {
    let fileNameArr = file.name.split('.');
    fileNameArr.pop();
    return fileNameArr.join('.');
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

  // _loadTemplateFiles(tree) {
  //   if(!tree) return [];

  //   let templates = _.filter(tree.tree, function(file) {
  //     let templateFileRegex = /templates\/([a-z0-9\s\._-])+\.(html|htm)/i;
  //     return templateFileRegex.test(file.path);
  //   });

  //   return templates;
  // }

  // _loadThemeStructure(tree) {
  //   if(!tree) return [];

  //   let themes = _.filter(tree.tree, function(file) {
  //     let themeFolderRegex = /themes\/([a-z0-9\s\._-])+$/i;
  //     // Include theme folders
  //     return themeFolderRegex.test(file.path) && file.type=='tree';
  //   });

  //   let layouts = {};
  //   let self = this;
  //   _.forEach(themes, function(theme) {
  //     layouts[theme.name] = _.filter(tree.tree, function(file) {
  //       let layoutFileRegex = /themes\/([a-z0-9\s\._-])+\/layout\/([a-z0-9\s\._-])+$/i;
  //       // Include layout files per theme
  //       return layoutFileRegex.test(file.path)
  //         && file.type=='blob' && self._isTemplateFile(file);
  //     });
  //   });

  //   return layouts;
  // }

  // _loadTemplateContent(repository, templateFile, yamlFile) {
  //   let url = '/api/project/blob/' + repository.full_name + '/' + templateFile.sha;
  //   let app = this.props.app;

  //   $.ajax({
  //     url: url,
  //     method: 'GET',
  //     success: function(response) {
  //       // console.info('Template content loaded', response);
  //       if('error' in response) {
  //         // TODO
  //       }
  //       else {
  //         let content = atob(response.blob.content)
  //         templateFile.originalContent = content;
  //         // return content;

  //         // Request template variable parsing
  //         $.ajax({
  //           url: '/api/project/parse/template',
  //           method: 'POST',
  //           headers: { 'X-CSRFToken': window.glide.csrfToken },
  //           dataType: 'json',
  //           data: JSON.stringify({
  //             templateFileContent: content
  //           }),
  //           contentType: 'application/json; charset=utf-8',
  //           success: function(response) {
  //             // console.info('Keys in the template parsed', response);
  //             if('error' in response) {
  //               // TODO
  //             }
  //             else {
  //               _.forEach(response.keys, function(value, key) {
  //                 yamlFile.newContent += value + ': ';
  //                 yamlFile.newContent += '\n';
  //               });
  //             }
  //           }
  //         });
  //       }
  //     }
  //   });
  // }

  // _loadTemplateContent(repository, templateFile, yamlFile) {
  //   let url = '/api/project/blob/' + repository.full_name + '/' + templateFile.sha;
  //   let app = this.props.app;

  //   $.ajax({
  //     url: url,
  //     method: 'GET',
  //     success: function(response) {
  //       // console.info('Template content loaded', response);
  //       if('error' in response) {
  //         // TODO
  //       }
  //       else {
  //         let content = atob(response.blob.content)
  //         templateFile.originalContent = content;
  //         // return content;

  //         // Request template variable parsing
  //         $.ajax({
  //           url: '/api/project/parse/template',
  //           method: 'POST',
  //           headers: { 'X-CSRFToken': window.glide.csrfToken },
  //           dataType: 'json',
  //           data: JSON.stringify({
  //             templateFileContent: content
  //           }),
  //           contentType: 'application/json; charset=utf-8',
  //           success: function(response) {
  //             // console.info('Keys in the template parsed', response);
  //             if('error' in response) {
  //               // TODO
  //             }
  //             else {
  //               _.forEach(response.keys, function(value, key) {
  //                 yamlFile.newContent += value + ': ';
  //                 yamlFile.newContent += '\n';
  //               });
  //             }
  //           }
  //         });
  //       }
  //     }
  //   });
  // }

  // _countLayouts(themes) {
  //   let cnt = 0;
  //   for(let theme in themes) {
  //     let layouts = themes[theme];
  //     cnt += layouts.length;
  //   }
  //   return cnt;
  // }

  // _renderThemeStructure(themeName, layouts, index) {
  //   return (
  //     <div key={index}>
  //       <button
  //         className="btn btn-link file-node-folder block theme-structure disabled">
  //         <i className="folder icon"></i> {themeName}
  //       </button>
  //       <ul className="folder-level-indentation">
  //         {
  //           layouts.map(function(layout, index) {
  //             return (
  //               <button
  //                 type="button" key={index} onClick={this.handleLayoutClick}
  //                 className="btn btn-link file-node-file block theme-structure disabled">
  //                 <i className="file outline text icon"></i> {layout.name}
  //               </button>
  //             )
  //           })
  //         }
  //       </ul>
  //     </div>
  //   );
  // }

  handleFileCreationModeChange(e) {
    this.setState({
      fileCreationMode: $(e.target).data('mode')
    });
  }

  handleFileOrFolderChange(e) {
    this.setState({
      fileOrFolder: e.target.value,
      scaffold: null
    });
  }

  handleScaffoldChange(e) {
    let scaffold = e.target.value;
    if(scaffold == '') {
      scaffold = null;
    }
    this.setState({
      scaffold: scaffold
    });
  }

  handleFileNameChange(e) {
    let fileName = e.target.value.trim();

    if(this._validateFileName(fileName)) {
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

  // handleLayoutChange(file, e) {
  //   // Load template file content
  //   let url = '/api/project/cdn/' + this.state.repository.full_name;
  //   let self = this;

  //   $.ajax({
  //     url: url,
  //     method: 'POST',
  //     headers: { 'X-CSRFToken': window.glide.csrfToken },
  //     dataType: 'json',
  //     data: JSON.stringify({
  //       file: file,
  //       branch: null
  //     }),
  //     contentType: 'application/json; charset=utf-8',
  //     success: function(response) {
  //       console.info(response);
  //       if('error' in response) {
  //         // TODO
  //       }
  //       else {
  //         self.setState({
  //           template: file,
  //           liveHtmlSrc: response.cdnUrl
  //         });
  //       }
  //     }
  //   });
  // }

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

    // error.code:
    //   1. Invalid file type
    //   2. File too large
    //   3. File too small
    //   4. Maximum file count reached
  }

  handleSubmit() {
    let self = this;
    let tree = this.state.tree;
    let recursiveTree = this.state.recursiveTree;
    let fileName = this.state.fileName;
    // if(this.state.fileCreationMode == 'source') {
    //   fileName = this._slugify(fileName);
    // }

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
      console.error('GLIDE: File already exists!');
      this._reset();
      // TODO: Error message for duplicated file.
      return;
    }

    // Upload the data
    let data = {
      mode: this.state.fileCreationMode,
      repository: this.state.repository.full_name,
      branch: this.state.branch.name,
      path: path
    };
    
    let contentType = 'application/json; charset=utf-8';
    let processData = true;

    switch(this.state.fileCreationMode) {
      case 'source':
        data.scaffold = this.state.scaffold;
        data.file = fileName;
        data = JSON.stringify(data);
        break;
      case 'file':
        data.fileOrFolder = this.state.fileOrFolder;
        data.file = fileName;
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
      default:
        // Unexpected case
        console.error('Unknown file creation mode');
        return;
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
        console.log(response);
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
              
              createdFile.originalContent = atob(createdFile.originalContent);

              // Update addedFiles
              //   Just remove potentially existing duplicate
              //   and just push the new file.
              _.remove(addedFiles, function(file) {
                return _.lowerCase(file.path) === _.lowerCase(createdFile.path);
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
      recursiveTree: this.props.recursiveTree,
      scaffolds: this.props.scaffolds,
      scaffold: this.props.scaffold
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      scaffolds: nextProps.scaffolds,
      scaffold: nextProps.scaffold
    });
  }

  render() {
    let sourceDisabled = false;
    if(this.pathInput &&
      this.pathInput.value.startsWith('/source/')) {
      //
    }
    else {
      sourceDisabled = true;
    }

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
                data-mode="source"
                title="You may create a Hexo-generated web page by creating a source file under /source/ folder."
                href="#file-creation-source" onClick={this.handleFileCreationModeChange}
                data-toggle="tab" className={
                  sourceDisabled ? "nav-link disabled file-creation-tabs" : "nav-link file-creation-tabs"}>
                Web Page (Hexo Source)
              </a>
            </li>
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

            <div id="file-creation-source"
              className="form-group file-creation-panes tab-pane fade padding-20 no-margin">
              <fieldset>
                <label className="control-label">
                  Content Type (Hexo Scaffolds)
                </label>
                <br />
                {
                  this.state.scaffolds.map(function(item, index) {
                    return (
                      <div key={index} className="inline-block">
                        <label>
                          <input
                            type="radio" value={this._fileNameOnly(item)}
                            checked={this.state.scaffold==this._fileNameOnly(item)}
                            onChange={this.handleScaffoldChange} />
                            &nbsp;{this._fileNameOnly(item)}
                        </label>
                        &emsp;
                      </div>
                    );
                  }.bind(this))
                }
                <br />
                <label className="control-label">
                  Page Name
                </label>
                <div>
                  <input
                    type="text" ref={(c) => this.fileNameInput1 = c}
                    onChange={this.handleFileNameChange}
                    onKeyUp={this.handleKeyUp}
                    className="form-control" maxLength="255" />
                </div>
              </fieldset>
            </div>
              
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
                    ref={(c) => this.fileNameInput2 = c}
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
                this.state.fileCreationMode == 'source' &&
                !this.state.scaffold
              ) ||
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
                !this._validateFileName(this.state.fileName)
              )
            }>
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default CreateFileModalContent;
