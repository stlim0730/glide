// 
// FileNode component
// 
class FileNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      nodes: []
    };

    this._orderNodes = this._orderNodes.bind(this);
    this._slugify = this._slugify.bind(this);
    this._getEditorId = this._getEditorId.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
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

  componentDidMount() {
    // 
    // This event seems to affect children nodes' behavior.
    //   Maybe, that's because recursively generated nodes are dynamic
    //   so that the state should update after being mounted.
    // 
    this._orderNodes(this.props.nodes);
  }

  componentWillReceiveProps(nextProps) {
    // 
    // This event seems to affect the root node's behavior.
    // 
    this._orderNodes(nextProps.nodes);
  }

  handleFileClick(file, e) {
    // Folders don't call this event handler
    let app = this.props.app;
    let fileSideBar = this.props.fileSideBar;
    let filesOpened = fileSideBar.state.filesOpened;
    let fileActive = fileSideBar.state.fileActive;

    if(_.find(filesOpened, {'path': file.path})) {
      alert('file alreay opened');
      // Already opened
      // TODO: Change the tab
    }
    else {
      if(file.originalContent == null) {
        // Initial loading:
        //   request server to load remote resources
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
        // TODO: Use local content
      }
    }
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
                    className="btn btn-link file-node-folder"
                    data-toggle="collapse"
                    data-target={"#" + this._slugify(item.path) + "-list-group"}>
                    {item.name}
                  </button>&nbsp;<span className="glyphicon glyphicon-menu-down"></span>
                  <ul id={this._slugify(item.path) + "-list-group"}
                    className="list-group collapse">
                    <FileNode
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
                  className="list-group-item file-node-file"
                  onClick={this.handleFileClick.bind(this, item)}>
                  {item.name} {item.modified && !item.added && <span className="glyphicon glyphicon-asterisk
                  "></span>}
                </button>
              );
            }
          }.bind(this))
        }
      </div>
    );
  }
}

export default FileNode

// data-download-url={item.downloadUrl}