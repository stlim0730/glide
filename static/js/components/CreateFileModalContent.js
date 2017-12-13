// 
// CreateFileModalContent component
// 
class CreateFileModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      fileOrFolder: null,
      fileName: '',
      tree: null,
      recursiveTree: null,
      themes: {},
      template: null,
      liveHtmlSrc: null
    };

    this._reset = this._reset.bind(this);
    this._validateFileName = this._validateFileName.bind(this);
    // this._loadTemplateFiles = this._loadTemplateFiles.bind(this);
    this._isTemplateFile = this._isTemplateFile.bind(this);
    this._isDataFile = this._isDataFile.bind(this);
    this._loadThemeStructure = this._loadThemeStructure.bind(this);
    this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
    this._loadTemplateContent = this._loadTemplateContent.bind(this);
    this._countLayouts = this._countLayouts.bind(this);
    this._renderThemeStructure = this._renderThemeStructure.bind(this);
    this.handleFileOrFolderChange = this.handleFileOrFolderChange.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.handleLayoutChange = this.handleLayoutChange.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  _reset() {
    this.setState({
      fileOrFolder: null,
      fileName: '',
      template: null,
      liveHtmlSrc: null
    });

    this.fileNameInput.value = '';
  }

  _validateFileName(fileName) {
    // Validate the file name
    let fileNameRegex = /^([a-z0-9\s\._-]+)$/i;
    if(fileNameRegex.test(fileName)) {
      return true;
    }
    else {
      return false;
    }
  }

  _isTemplateFile(file) {
    let templateExtensionsRegex = /(\.ejs|\.swig|\.htm|\.html)$/i;
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

    let dataFileRegex = /(\.md|\.markdown)$/i;
    if(dataFileRegex.test(fileName)) {
      return true;
    }
    else {
      return false;
    }
  }

  _addFileToRecursiveTree(recursiveTree, newFile, folders) {
    if(folders.length == 1) {
      recursiveTree.nodes.push(newFile);
    }
    else {
      let targetFolder = _.find(recursiveTree.nodes, {name: folders.shift(), type: 'tree'});
      this._addFileToRecursiveTree(targetFolder, newFile, folders);
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

  _loadThemeStructure(tree) {
    if(!tree) return [];

    let themes = _.filter(tree.tree, function(file) {
      let themeFolderRegex = /themes\/([a-z0-9\s\._-])+$/i;
      // Include theme folders
      return themeFolderRegex.test(file.path) && file.type=='tree';
    });

    let layouts = {};
    let self = this;
    _.forEach(themes, function(theme) {
      layouts[theme.name] = _.filter(tree.tree, function(file) {
        let layoutFileRegex = /themes\/([a-z0-9\s\._-])+\/layout\/([a-z0-9\s\._-])+$/i;
        // Include layout files per theme
        return layoutFileRegex.test(file.path)
          && file.type=='blob' && self._isTemplateFile(file);
      });
    });

    return layouts;
  }

  _loadTemplateContent(repository, templateFile, yamlFile) {
    let url = '/api/project/blob/' + repository.full_name + '/' + templateFile.sha;
    let app = this.props.app;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        // console.info('Template content loaded', response);
        if('error' in response) {
          // TODO
        }
        else {
          let content = atob(response.blob.content)
          templateFile.originalContent = content;
          // return content;

          // Request template variable parsing
          $.ajax({
            url: '/api/project/parse/template',
            method: 'POST',
            headers: { 'X-CSRFToken': window.glide.csrfToken },
            dataType: 'json',
            data: JSON.stringify({
              templateFileContent: content
            }),
            contentType: 'application/json; charset=utf-8',
            success: function(response) {
              // console.info('Keys in the template parsed', response);
              if('error' in response) {
                // TODO
              }
              else {
                _.forEach(response.keys, function(value, key) {
                  yamlFile.newContent += value + ': ';
                  yamlFile.newContent += '\n';
                });
              }
            }
          });
        }
      }
    });
  }

  _countLayouts(themes) {
    let cnt = 0;
    for(let theme in themes) {
      let layouts = themes[theme];
      cnt += layouts.length;
    }
    return cnt;
  }

  _renderThemeStructure(themeName, layouts, index) {
    return (
      <div key={index}>
        <button
          className="btn btn-link file-node-folder block theme-structure disabled">
          <i className="folder icon"></i> {themeName}
        </button>
        <ul className="folder-level-indentation">
          {
            layouts.map(function(layout, index) {
              return (
                <button
                  type="button" key={index}
                  className="btn btn-link file-node-file block theme-structure disabled">
                  <i className="file outline text icon"></i> {layout.name}
                </button>
              )
            })
          }
        </ul>
      </div>
    );
  }

  handleFileOrFolderChange(e) {
    this.setState({
      fileOrFolder: e.target.value
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

    if(this._isDataFile(fileName)) {
      $('button.theme-structure').removeClass('disabled');
    }
    else {
      $('button.theme-structure').addClass('disabled');
    }
  }

  handleLayoutChange(file, e) {
    // Load template file content
    let url = '/api/project/cdn/' + this.state.repository.full_name;
    let self = this;

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        file: file,
        branch: null
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        console.info(response);
        if('error' in response) {
          // TODO
        }
        else {
          self.setState({
            template: file,
            liveHtmlSrc: response.cdnUrl
          });
        }
      }
    });
  }

  handleKeyUp(e) {
    let keyCode = e.keyCode;
    if(keyCode == 13) {
      this.submitButton.click();
    }
  }

  handleSubmit() {
    let app = this.props.app;
    let path = this.pathInput.value.trim();
    // Remove leading '/'
    path = (path.startsWith('/') ? path.substring(1) : path);
    let fileName = this.state.fileName;
    
    // Duplicate check
    // This block might have a bug:
    //   returns true for files with the same name in different path.
    //   More tests required.
    let tree = this.state.tree;
    let exists = _.find(tree.tree, function(file) {
      return _.lowerCase(file.path) === _.lowerCase(path + fileName);
    });

    if(exists) {
      console.info('File already exists!');
      this._reset();
      // TODO: Error message for duplicated file.
      return;
    }

    // Create a file object
    let newFile = {
      name: fileName,
      nodes: [],
      path: path + fileName,
    };

    if(this.state.fileOrFolder == 'file') {
      newFile.added = true,
      newFile.modified = false,
      newFile.originalContent = '',
      newFile.sha = null,
      newFile.size = 0,
      newFile.url = null
      newFile.type = 'blob';
      newFile.mode = '100644';
    }
    else if(this.state.fileOrFolder == 'folder') {
      newFile.type = 'tree';
      newFile.mode = '040000';
    }
    else {
      // Not expected..
      console.info(newFile, 'unexpected type');
      this._reset();
      return;
    }

    // Add template if the file is yaml
    if((newFile.name.endsWith('.yaml')
      || newFile.name.endsWith('.yml'))
      && this.state.template) {
      newFile.newContent = 'template: ';
      newFile.newContent += this.state.template.path;
      newFile.newContent += '\n';
      // Load the template file content through the server
      let templateFile = _.find(tree.tree, ['path', this.state.template.path]);
      this._loadTemplateContent(app.state.repository, templateFile, newFile);
    }

    // Push the file into tree
    tree.tree.push(newFile);

    // Push the file into recursiveTree
    let recursiveTree = this.state.recursiveTree;
    let folders = newFile.path.split('/');
    this._addFileToRecursiveTree(recursiveTree, newFile, folders);

    // Update the states
    //   TODO: Should I do this only for files
    //   TODO: because an empty folder can't be pushed to GitHub anyway?
    //   TODO: I'm Thinking... More tests required.
    let addedFiles = app.state.addedFiles;
    addedFiles.push(newFile);

    this.setState({
      recursiveTree: recursiveTree,
      tree: tree
    }, function() {
      app.setState({
        recursiveTree: recursiveTree,
        tree: tree,
        addedFiles: addedFiles
      });
    });

    //
    // Note:
    //   Blob is automatically created on GitHub
    //   when the branch is pushed and tree has blob content.
    // 

    this._reset();
  }

  componentDidMount() {
    let themes = this._loadThemeStructure(this.props.tree);

    this.setState({
      repository: this.props.repository,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree,
      themes: themes,
      template: null
    });
  }

  componentWillReceiveProps(nextProps) {
    let themes = this._loadThemeStructure(nextProps.tree);
    
    this.setState({
      repository: nextProps.repository,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      themes: themes,
      template: null
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
        
        <div className="modal-body row">
          <div className="col-md-4 right-border">
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
                      type="radio"
                      value="file"
                      checked={this.state.fileOrFolder=='file'}
                      onChange={this.handleFileOrFolderChange} /> File
                  </label>
                  &emsp;
                  <label>
                    <input
                      type="radio"
                      value="folder"
                      checked={this.state.fileOrFolder=='folder'}
                      onChange={this.handleFileOrFolderChange} /> Folder
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
                <label className="control-label">
                  Themes & Layouts
                </label>
                <button
                  type="button" className="btn btn-sm btn-link"
                  data-container="body" data-toggle="popover"
                  data-placement="bottom" data-original-title="" title=""
                  data-content="Layout selection is available when you create Markdown(.md) files.">
                  <i className="info circle icon"></i>
                </button>
                <br />
                <span className="help-block">
                  This repository has {this._countLayouts(this.state.themes)} layout(s)&nbsp;
                  in {_.keys(this.state.themes).length} theme(s) available.
                </span>
                {
                  _.keys(this.state.themes).map(function(item, index) {
                    return this._renderThemeStructure(item, this.state.themes[item], index);
                  }.bind(this))
                }
              </div>
            </fieldset>
          </div>

          <div className="col-md-8">
            <label className="control-label">
              Theme & Layout Preview
            </label>
            <div className="form-group">
              {
                this.state.liveHtmlSrc &&
                <iframe
                  width="100%"
                  height="350px"
                  src={this.state.liveHtmlSrc}>
                </iframe>
              }
              {
                !this.state.liveHtmlSrc &&
                'Select a layout for preview.'
              }
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
              !this.state.fileOrFolder
              || this.state.fileName.trim().length==0
              || ((this.state.fileName.endsWith('yaml')
                || this.state.fileName.endsWith('yml')
                || this.state.fileName.endsWith('html')
                || this.state.fileName.endsWith('htm')) && !this.state.template)
            }>
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default CreateFileModalContent;
