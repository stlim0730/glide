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
    this._getEditorId = this._getEditorId.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
    this.handleCreateNewFileClick = this.handleCreateNewFileClick.bind(this);
  }

  _orderNodes(nodes) {
    let orderedNodes = _.orderBy(nodes, ['type','name'], ['desc', 'asc']);
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

  _getEditorId(fileObj) {
    let suffix = '_editor';
    return fileObj.sha + suffix;
  }

  handleFileClick(file, e) {
    // Folders don't call this event handler: yay
    let app = this.props.app;
    let self = this;
    let filesOpened = this.state.filesOpened;
    let fileActive = this.state.fileActive;

    if(_.find(filesOpened, {'path': file.path})) {
      // Already opened
      // TODO: Change the tab
    }
    else {
      if(file.originalContent == null) {
        // Initial loading of an existing file in the repository:
        //   Request server to load remote resources
        let url = '/api/project/blob/' + this.state.repository.full_name + '/' + file.sha;

        $.ajax({
          url: url,
          method: 'GET',
          success: function(response) {
            // console.info(response);
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

                console.info(this.state.fileActive);
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
    this.setState({
      repository: this.props.repository,
      filesOpened: this.props.filesOpened,
      fileActive: this.props.fileActive,
      currentPath: this.props.currentPath
    });
    this._orderNodes(this.props.nodes);
  }

  componentWillReceiveProps(nextProps) {
    // 
    // This event seems to affect the root node's behavior.
    // 
    this.setState({
      repository: nextProps.repository,
      filesOpened: nextProps.filesOpened,
      fileActive: nextProps.fileActive,
      currentPath: nextProps.currentPath
    });
    this._orderNodes(nextProps.nodes);
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
                    data-target={"#" + this._slugify(item.path) + "-list-group"}>
                    <i className="folder icon"></i> {item.name}
                  </button>
                  <ul id={this._slugify(item.path) + "-list-group"}
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
                  <i className="file text outline icon"></i> {item.name}
                  {
                    item.modified &&
                    !item.added &&
                    <span className="glyphicon glyphicon-asterisk"></span>
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
