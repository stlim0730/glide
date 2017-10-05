// 
// CreateNewFileModalContent component
// 
class CreateNewFileModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      fileOrFolder: null,
      fileName: '',
      tree: null,
      recursiveTree: null,
      layouts: [],
      layout: null,
      liveHtmlSrc: null
    };

    this._reset = this._reset.bind(this);
    this._validateFileName = this._validateFileName.bind(this);
    this._loadTemplateFiles = this._loadTemplateFiles.bind(this);
    this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
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
      layout: null,
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

  _addFileToRecursiveTree(recursiveTree, newFile, folders) {
    if(folders.length == 1) {
      recursiveTree.nodes.push(newFile);
    }
    else {
      let targetFolder = _.find(recursiveTree.nodes, {name: folders.shift(), type: 'tree'});
      this._addFileToRecursiveTree(targetFolder, newFile, folders);
    }
  }

  _loadTemplateFiles(tree) {
    if(!tree) return [];

    let layouts = _.filter(tree.tree, function(file) {
      let layoutFileRegex = /templates\/([a-z0-9\s\._-])+\.(html|htm)/i;
      return layoutFileRegex.test(file.path);
    });

    return layouts;
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
  }

  handleLayoutChange(file, e) {
    // Load layout file content
    let url = '/api/project/cdn/' + this.state.repository.full_name;
    // let url = '/api/project/blob/' + this.state.repository.full_name + '/' + file.sha;
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
          // let content = atob(response.blob.content);
          // content = self._resolveBookmarks(content)
          // content = self._resolveRelativePaths(content)

          self.setState({
            layout: file,
            liveHtmlSrc: response.cdnUrl
          });
        }
      }
    });

    // $.ajax({
    //   url: url,
    //   method: 'GET',
    //   success: function(response) {
    //     console.info(response);
    //     if('error' in response) {
    //       // TODO
    //     }
    //     else {
    //       let content = atob(response.blob.content);
    //       content = self._resolveBookmarks(content)
    //       content = self._resolveRelativePaths(content)

    //       self.setState({
    //         layout: file,
    //         liveHtml: content
    //       });
    //     }
    //   }
    // });
  }

  handleKeyUp(e) {
    let keyCode = e.keyCode;
    if(keyCode == 13) {
      this.submitButton.click();
    }
  }

  handleSubmit() {
    let path = this.pathInput.value.trim();
    path = (path.startsWith('/') ? path.substring(1) : path);
    let fileName = this.state.fileName;
    
    // Duplicate check
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

    // Add layout if the file is yaml
    if((newFile.name.endsWith('.yaml')
      || newFile.name.endsWith('.yml'))
      && this.state.layout) {
      newFile.newContent = 'layout: ';
      newFile.newContent += this.state.layout.path;
      newFile.newContent += '\n';
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
    //   TODO: I'm Thinking...
    let app = this.props.app;
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
    //   Create blob on GitHub when the branch is pushed!
    // 

    this._reset();
  }

  componentDidMount() {
    let layouts = this._loadTemplateFiles(this.props.tree);

    this.setState({
      repository: this.props.repository,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree,
      layouts: layouts,
      layout: null
    });
  }

  componentWillReceiveProps(nextProps) {
    let layouts = this._loadTemplateFiles(nextProps.tree);
    
    this.setState({
      repository: nextProps.repository,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      layouts: layouts,
      layout: null
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
          <h4 className="modal-title">Create a New File or Folder</h4>
        </div>
        
        <div className="modal-body row">
          <div className="col-md-3 right-border">
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
                    type="text"
                    onChange={this.handleFileNameChange}
                    onKeyUp={this.handleKeyUp}
                    ref={(c) => this.fileNameInput = c}
                    className="form-control"
                    maxLength="255" />
                </div>
              </div>
              <div className="form-group">
                <label className="control-label">
                  Page Layout
                </label>
                <button
                  type="button" className="btn btn-sm btn-link"
                  data-container="body" data-toggle="popover"
                  data-placement="bottom" data-original-title="" title=""
                  data-content="Layout selection is available when you author YAML(.yaml) or HTML(.html) files.">
                  <span className="glyphicon glyphicon-info-sign"></span>
                </button>
                <br />
                <span className="help-block">
                  This repository has {this.state.layouts.length} layout(s) available.
                </span>
                {
                  this.state.layouts.map(function(item, index) {
                    return (
                      <div key={index}>
                        <input
                          type="radio"
                          name="pageLayout"
                          value={item.name}
                          disabled={
                            !(this.state.fileName.endsWith('.yaml')
                            || this.state.fileName.endsWith('.yml')
                            || this.state.fileName.endsWith('.html')
                            || this.state.fileName.endsWith('.htm'))
                          }
                          onClick={this.handleLayoutChange.bind(this, item)}
                          />&emsp;{item.name}
                        <br />
                      </div>
                    );
                  }.bind(this))
                }
              </div>
            </fieldset>
          </div>

          <div className="col-md-9">
            <label className="control-label">
              Page Layout Preview
            </label>
            <div className="form-group">
              <iframe
                width="600px"
                height="350px"
                src={this.state.liveHtmlSrc}>
              </iframe>
            </div>
          </div>

        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal"
            onClick={this._reset}>Close</button>
          <button
            type="button"
            ref={(c) => this.submitButton = c}
            className="btn btn-primary"
            onClick={this.handleSubmit}
            data-dismiss="modal"
            disabled={
              !this.state.fileOrFolder
              || this.state.fileName.trim().length==0
              || ((this.state.fileName.endsWith('yaml')
                || this.state.fileName.endsWith('yml')
                || this.state.fileName.endsWith('html')
                || this.state.fileName.endsWith('htm')) && !this.state.layout)
            }>
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default CreateNewFileModalContent;
