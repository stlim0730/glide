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
      scaffold: null,
      scaffolds: []
    };

    this._reset = this._reset.bind(this);
    this._slugify = this._slugify.bind(this);
    this._validateFileName = this._validateFileName.bind(this);
    // this._loadTemplateFiles = this._loadTemplateFiles.bind(this);
    this._isTemplateFile = this._isTemplateFile.bind(this);
    this._isDataFile = this._isDataFile.bind(this);
    this._fileNameOnly = this._fileNameOnly.bind(this);
    // this._loadThemeStructure = this._loadThemeStructure.bind(this);
    this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
    // this._loadTemplateContent = this._loadTemplateContent.bind(this);
    // this._countLayouts = this._countLayouts.bind(this);
    // this._renderThemeStructure = this._renderThemeStructure.bind(this);
    this.handleFileOrFolderChange = this.handleFileOrFolderChange.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.handleScaffoldChange = this.handleScaffoldChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  _reset() {
    this.setState({
      fileOrFolder: null,
      // pageOrPost: null,
      fileName: '',
      scaffold: null,
      scaffolds: [],
      // template: null,
      // liveHtmlSrc: null
    }, function() {
      this.fileNameInput.value = '';
      // $('button.theme-structure').addClass('disabled');
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

  _isTemplateFile(file) {
    let templateExtensionsRegex = /\.(ejs|swig|htm|html)$/i;
    if(templateExtensionsRegex.test(file.name)) {
      return true;
    }
    else {
      return false;
    }
  }

  _isDataFile(fileName) {
    if(this.state.fileOrFolder != 'file') {
      return false;
    }

    let markdownRegex = /\.(md|markdown|mdown|mkdn|mkd)$/i;
    if(markdownRegex.test(fileName)) {
      return true;
    }
    else {
      return false;
    }
  }

  _fileNameOnly(file) {
    let fileNameArr = file.name.split('.');
    fileNameArr.pop();
    return fileNameArr.join('.');
  }

  _addFileToRecursiveTree(recursiveTree, newFile, folders) {
    if(folders.length == 1) {
      recursiveTree.nodes.push(newFile);
    }
    else {
      let folderName = folders.shift();
      let targetFolder = _.find(recursiveTree.nodes, {name: folderName, type: 'tree'});
      if(targetFolder) {
        this._addFileToRecursiveTree(targetFolder, newFile, folders);
      }
      else {
        // console.log('_add', newFile, folders);
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

  handleSubmit() {
    let tree = this.state.tree;
    let recursiveTree = this.state.recursiveTree;
    let fileName = this.state.fileName;
    if(this.state.scaffold) {
      fileName = this._slugify(fileName);
    }

    // Must remove leading '/'
    let path = this.pathInput.value.trim();
    path = (path.startsWith('/') ? path.substring(1) : path);
    
    // Duplicate check
    let exists = _.find(tree.tree, function(file) {
      return _.lowerCase(file.path) === _.lowerCase(path + fileName);
    });

    if(exists) {
      console.error('GLIDE: File already exists!');
      this._reset();
      // TODO: Error message for duplicated file.
      return;
    }
    
    // Use Hexo scaffolds on GLIDE server
    let self = this;
    let app = this.props.app;
    let url = '/api/project/file/new';

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        repository: this.state.repository.full_name,
        branch: this.state.branch.name,
        scaffold: this.state.scaffold,
        fileName: fileName,
        fileOrFolder: this.state.fileOrFolder,
        path: path
      }),
      contentType: 'application/json; charset=utf-8',
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
            // Push the file into tree
            tree.tree.push(createdFile);

            // Push the file into recursiveTree
            let folders = createdFile.path.split('/');
            self._addFileToRecursiveTree(recursiveTree, createdFile, folders);
            
            // Update the states
            addedFiles.push(createdFile);
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
    // let scaffolds = this._loadScaffoldsFiles(this.props.tree);

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
    // let scaffolds = this._loadScaffoldsFiles(nextProps.tree);
    
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
        
        <div className="modal-body rrow">
          <div className="ccol-md-4 rright-border">
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
              <div className="form-group margin-top-15">                  
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
              </div>
              <div className="form-group">
                <label className="control-label">
                  {this.state.fileOrFolder == 'folder' ? 'Folder' : 'File'} Name
                </label>
                <div className="">
                  <input
                    type="text" disabled={!this.state.fileOrFolder}
                    onChange={this.handleFileNameChange}
                    onKeyUp={this.handleKeyUp}
                    ref={(c) => this.fileNameInput = c}
                    className="form-control" maxLength="255" />
                </div>
              </div>
              <div className="form-group">
                {
                  // <label className="control-label">
                  //   Themes & Layouts
                  // </label>
                  // <button
                  //   type="button" className="btn btn-sm btn-link"
                  //   data-container="body" data-toggle="popover"
                  //   data-placement="bottom" data-original-title="" title=""
                  //   data-content="Layout selection is available when you create Markdown(.md) files.">
                  //   <i className="info circle icon"></i>
                  // </button>
                  // <br />
                }
                <div className="form-group margin-top-15">
                  <label className="control-label">
                    Content Type (Hexo Scaffolds)
                  </label>
                  <br />
                  {
                    this.state.scaffolds.map(function(item, index) {
                      if(item) {
                        return (
                          <div key={index} className="inline-block">
                            <label>
                              <input
                                type="radio" value={this._fileNameOnly(item)}
                                disabled={this.state.fileOrFolder=='folder'}
                                checked={this.state.scaffold==this._fileNameOnly(item)}
                                onChange={this.handleScaffoldChange} />
                                &nbsp;{this._fileNameOnly(item)}
                            </label>
                            &emsp;
                          </div>
                        );
                      }
                      else {
                        return (
                          <div key={index} className="inline-block">
                            <label>
                              <input
                                type="radio" value={''}
                                disabled={this.state.fileOrFolder=='folder'}
                                checked={this.state.scaffold==null}
                                onChange={this.handleScaffoldChange} />
                                &nbsp;Do not use Hexo scaffolds
                            </label>
                          </div>
                        );
                      }
                    }.bind(this))
                  }
                  {
                    // <label>
                    //   <input
                    //     type="radio" value="page"
                    //     disabled={!this._isDataFile(this.state.fileName)}
                    //     checked={this.state.pageOrPost=='page'}
                    //     onChange={this.handlePageOrPostChange} /> Page
                    // </label>
                    // &emsp;
                    // <label>
                    //   <input
                    //     type="radio" value="post"
                    //     disabled={!this._isDataFile(this.state.fileName)}
                    //     checked={this.state.pageOrPost=='post'}
                    //     onChange={this.handlePageOrPostChange} /> Blog Post
                    // </label>
                  }
                </div>
                {
                  // <span className="help-block">
                  //   This repository has {this._countLayouts(this.state.themes)} layout(s)&nbsp;
                  //   in {_.keys(this.state.themes).length} theme(s) available.
                  // </span>
                }
                {
                  // _.keys(this.state.themes).map(function(item, index) {
                  //   return this._renderThemeStructure(item, this.state.themes[item], index);
                  // }.bind(this))
                }
              </div>
            </fieldset>
          </div>

          {
            // <div className="col-md-8">
            //   <label className="control-label">
            //     Theme & Layout Preview
            //   </label>
            //   <div className="form-group">
            //     {
            //       this.state.liveHtmlSrc &&
            //       <iframe
            //         width="100%"
            //         height="350px"
            //         src={this.state.liveHtmlSrc}>
            //       </iframe>
            //     }
            //     {
            //       !this.state.liveHtmlSrc &&
            //       'Select a layout for preview.'
            //     }
            //   </div>
            // </div>
          }

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
              !this.state.fileOrFolder
              // || this.state.fileName.trim().length==0
              || !this._validateFileName(this.state.fileName)
            }>
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default CreateFileModalContent;
