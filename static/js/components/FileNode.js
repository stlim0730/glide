// 
// FileNode component
// 
class FileNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      filesOpened: [],
      fileActive: null,
      currentPath: '',
      nodes: []
    };

    this._orderNodes = this._orderNodes.bind(this);
    this._slugify = this._slugify.bind(this);
    this._getFolderId = this._getFolderId.bind(this);
    this._getEditorId = this._getEditorId.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
    this.handleCreateNewFileClick = this.handleCreateNewFileClick.bind(this);
  }

  _orderNodes(nodes) {
    let orderedNodes = _.orderBy(
      nodes, ['type','name'], ['desc', 'asc']
    );
    this.setState({
      nodes: orderedNodes
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

  _getFolderId(folder) {
    return folder.path.replace(/\//g, '-slash-');
  }

  _getEditorId(fileObj) {
    let suffix = '_editor';
    return fileObj.sha + suffix;
  }

  handleFolderClick(e) {
    $(e.target).children('i.folder.icon').toggleClass('open');
  }

  handleFileClick(file, e) {
    // Folders don't call this event handler: yay
    let app = this.props.app;
    let self = this;
    let filesOpened = this.state.filesOpened;
    let fileActive = this.state.fileActive;
    // let openToggle = this.state.openToggle;

    if(_.find(filesOpened, {'path': file.path})) {
      // Already opened: Change the tab
      this.setState({
        fileActive: file
      }, function() {
        app.setState({
          fileActive: file
        });
      });
    }
    else {
      // Toggle the file icon
      $(e.target).children('i.file.icon').toggleClass('outline');

      if(file.originalContent == null) {
        // Initial loading of an existing file in the repository:
        //   Request server to load remote resources
        let url = '/api/project/blob/'
          + this.state.repository.full_name
          + '/' + file.sha;

        $.ajax({
          url: url,
          method: 'GET',
          success: function(response) {
            if('error' in response) {
              // TODO
            }
            else {
              file.originalContent = atob(response.blob.content);
              
              filesOpened.push(file);
              self.setState({
                filesOpened: filesOpened,
                fileActive: file
              }, function() {
                app.setState({
                  filesOpened: filesOpened,
                  fileActive: file
                });
              });
            }
          }
        });
      }
      else {
        // Use local content
        filesOpened.push(file);
        self.setState({
          filesOpened: filesOpened,
          fileActive: file
        }, function() {
          app.setState({
            filesOpened: filesOpened,
            fileActive: file
          });
        });
      }
    }
  }

  handleCreateNewFileClick() {
    // Show the path of the new file
    let path = this.state.currentPath + '/';
    $('#create-file-modal input.pathInput').val(path);
  }

  componentDidMount() {
    // 
    // This event seems to affect children nodes' behavior.
    //   Maybe, that's because recursively generated nodes are dynamic
    //   so that the state should update after being mounted.
    // 
    let self = this;
    this.setState({
      repository: this.props.repository,
      filesOpened: this.props.filesOpened,
      fileActive: this.props.fileActive,
      currentPath: this.props.currentPath
      // Do not manually set the state of nodes
      //   Instead, rely on the callback function
    }, function() {
      self._orderNodes(self.props.nodes);
    });
    
  }

  componentWillReceiveProps(nextProps) {
    // 
    // This event seems to affect the root node's behavior.
    // 
    let self = this;
    this.setState({
      repository: nextProps.repository,
      filesOpened: nextProps.filesOpened,
      fileActive: nextProps.fileActive,
      currentPath: nextProps.currentPath
      // Do not manually set the state of nodes
      //   Instead, rely on the callback function
    }, function() {
      self._orderNodes(nextProps.nodes);  
    });
  }

  render () {
    return (
      <div>
        {
          this.state.nodes.map(function(item, index) {
            if(item.type == 'tree') {
              // Render a folder
              return (
                <div key={index}>
                  <button
                    className="btn btn-link file-node-folder block"
                    data-toggle="collapse" type="button"
                    onClick={this.handleFolderClick}
                    data-target={"#" + this._getFolderId(item) + "-list-group"}>
                    <i className="folder icon"></i> {item.name}
                  </button>
                  <ul id={this._getFolderId(item) + "-list-group"}
                    className="collapse subtree">
                    <FileNode
                      app={this.props.app}
                      repository={this.state.repository}
                      filesOpened={this.state.filesOpened}
                      fileActive={this.state.fileActive}
                      currentPath={item.path}
                      nodes={item.nodes} />
                  </ul>
                </div>
              );
            }
            else {
              // Render a file.
              return (
                <button
                  key={index} type="button"
                  className="btn btn-link file-node-file block"
                  onClick={this.handleFileClick.bind(this, item)}>
                  {
                    _.find(this.state.filesOpened, function(f) {
                      return f.path == item.path; }) ?
                    <i className="file text icon"></i> :
                    <i className="file text outline icon"></i>
                  } {item.name}
                  {
                    // item.modified &&
                    // !item.added &&
                    // <span className="glyphicon glyphicon-asterisk"></span>
                  }
                </button>
              );
            }
          }.bind(this))
        }
        <button
          className="btn btn-link new-file-button block"
          onClick={this.handleCreateNewFileClick.bind(this)}
          data-toggle="modal" type="button"
          data-target="#create-file-modal">
          <i className="add square icon"></i> Create New...
        </button>
      </div>
    );
  }
}

export default FileNode;
