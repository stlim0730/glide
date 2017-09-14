// 
// FileNode component
// 
class FileNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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
    // console.info(file);
    // Folders don't call this event handler: yay
    let app = this.props.app;
    let fileSideBar = this.props.fileSideBar;
    let filesOpened = fileSideBar.state.filesOpened;
    let fileActive = fileSideBar.state.fileActive;

    if(_.find(filesOpened, {'path': file.path})) {
      // Already opened
      // TODO: Change the tab
    }
    else {
      if(file.originalContent == null) {
        // Initial loading of an existing file in the repository:
        //   Request server to load remote resources
        let url = '/api/project/blob/' + fileSideBar.state.repository.full_name + '/' + file.sha;
        let app = this.props.app;

        $.ajax({
          url: url,
          method: 'GET',
          success: function(response) {
            console.info(response);
            if('error' in response) {
              // TODO
            }
            else {
              file.originalContent = atob(response.blob.content);
              
              fileActive = file;
              filesOpened.push(file);
              fileSideBar.setState({
                filesOpened: filesOpened,
                fileActive: fileActive
              }, function() {
                app.setState({
                  filesOpened: filesOpened,
                  fileActive: fileActive
                });
              });
            }
          }
        });
      }
      else {
        // Use local content
        if(file.added) {
          // Newly added file by the user:
          //   There is no remote resources to load
          fileActive = file;
          filesOpened.push(file);
          fileSideBar.setState({
            filesOpened: filesOpened,
            fileActive: fileActive
          }, function() {
            app.setState({
              filesOpened: filesOpened,
              fileActive: fileActive
            });
          });
        }
        else {
          // TODO: existing file to use local content,
          //   which means files changed and closed
        }
      }
    }
  }

  handleCreateNewFileClick() {
    // Show the path of the new file
    let path = this.state.currentPath + '/';
    $('#create-new-file-modal input.pathInput').val(path);
  }

  componentDidMount() {
    // 
    // This event seems to affect children nodes' behavior.
    //   Maybe, that's because recursively generated nodes are dynamic
    //   so that the state should update after being mounted.
    // 
    this.setState({
      currentPath: this.props.currentPath
    });
    this._orderNodes(this.props.nodes);
  }

  componentWillReceiveProps(nextProps) {
    // 
    // This event seems to affect the root node's behavior.
    // 
    this.setState({
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
                    href="#"
                    className="btn btn-link file-node-folder block"
                    data-toggle="collapse"
                    data-target={"#" + this._slugify(item.path) + "-list-group"}>
                    {item.name}
                  </button>
                  <ul id={this._slugify(item.path) + "-list-group"}
                    className="collapse subtree">
                    <FileNode
                      currentPath={item.path}
                      nodes={item.nodes}
                      fileSideBar={this.props.fileSideBar}
                      app={this.props.app} />
                  </ul>
                </div>
              );
            }
            else {
              // Render a file.
              return (
                <button
                  key={index}
                  className="btn btn-link file-node-file block"
                  onClick={this.handleFileClick.bind(this, item)}>
                  {item.name} {item.modified && !item.added && <span className="glyphicon glyphicon-asterisk
                  "></span>}
                </button>
              );
            }
          }.bind(this))
        }
        <button
          className="btn btn-link new-file-button block"
          onClick={this.handleCreateNewFileClick.bind(this)}
          data-toggle="modal"
          data-target="#create-new-file-modal">
          <span className="glyphicon glyphicon-plus"></span> Create New...
        </button>
      </div>
    );
  }
}

export default FileNode
