import Serializers from '../util/Serializers.js';
import FileUtil from '../util/FileUtil.js';

// 
// FileNode component
// 
class FileNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      tree: null,
      filesOpened: [],
      fileActive: null,
      currentPath: '',
      nodes: []
    };

    this._orderNodes = this._orderNodes.bind(this);
    // this._slugify = this._slugify.bind(this);
    this._getFolderId = this._getFolderId.bind(this);
    // this._getEditorId = this._getEditorId.bind(this);
    this.handleFileMouseOver = this.handleFileMouseOver.bind(this);
    this.handleFileMouseOut = this.handleFileMouseOut.bind(this);
    this.handleFileManipulationClick = this.handleFileManipulationClick.bind(this);
    this._loadScaffoldsFiles = this._loadScaffoldsFiles.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
    this.handleCreateNewClick = this.handleCreateNewClick.bind(this);
  }

  _orderNodes(nodes) {
    let orderedNodes = _.orderBy(
      nodes, ['type','name'], ['desc', 'asc']
    );
    this.setState({
      nodes: orderedNodes
    });
  }

  // _slugify(str) {
  //   return str.toLowerCase()
  //     .replace(/\s+/g, '-') // Replace spaces with -
  //     .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  //     .replace(/\-\-+/g, '-') // Replace multiple - with single -
  //     .replace(/^-+/, '') // Trim - from start of text
  //     .replace(/-+$/, '') // Trim - from end of text
  //     .trim();
  // }

  _getFolderId(folder) {
    return folder.path.replace(/\//g, '-slash-').replace(/\s/g, '-ws-');
  }

  // _getEditorId(fileObj) {
  //   let suffix = '_editor';
  //   return fileObj.sha + suffix;
  // }

  _loadScaffoldsFiles(tree) {
    if(!tree) return [];

    let scaffolds = _.filter(tree.tree, function(file) {
      let scaffoldsPathRegex = /^scaffolds\/([a-z0-9\s\._-])+\.(md|markdown|mdown|mkdn|mkd)$/i;
      return scaffoldsPathRegex.test(file.path);
    });

    let app = this.props.app;
    app.setState({
      scaffolds: scaffolds
    });
  }

  handleFileMouseOver(e) {
    $('.file-manipulation.icon').addClass('invisible');
    $(e.target).children('.file-manipulation.icon').removeClass('invisible');
  }
  
  handleFileMouseOut(e) {
    $(e.target).children('.file-manipulation.icon').addClass('invisible');
  }

  handleFileManipulationClick(manipulation, file, e) {
    console.log(manipulation, file);
    e.stopPropagation();
    
    switch(manipulation) {
      case 'Rename':
        break;
      case 'Delete':
        break;
      case 'Copy':
        break;
    }

    let app = this.props.app;
    app.setState({
      fileManipulation: manipulation,
      fileToManipulate: file
    });
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
      // Toggle the file icon of this FileNode
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
              // response.blob.content is always encoded in base64
              //   https://developer.github.com/v3/git/blobs/#get-a-blob
              
              if(FileUtil.isBinary(file)) {
                // For binary files: atob decodes
                file.originalContent = atob(response.blob.content);
              }
              else {
                // For text files
                file.originalContent = Serializers.b64DecodeUnicode(response.blob.content);
              }
              
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
        // Loading file that was newly created on GLIDE
        // Use local content:
        //   Just set the state
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

  handleCreateNewClick() {
    // Show the path of the new file
    let path = this.state.currentPath + '/';
    $('#create-file-modal input.pathInput').val(path);

    // Load Hexo-provided scaffolds
    this._loadScaffoldsFiles(this.state.tree);
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
      tree: this.props.tree,
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
      tree: nextProps.tree,
      filesOpened: nextProps.filesOpened,
      fileActive: nextProps.fileActive,
      currentPath: nextProps.currentPath
      // Do not manually set the state of nodes
      //   Instead, rely on the callback function
    }, function() {
      self._orderNodes(nextProps.nodes);  
    });
  }

  render() {
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
                      tree={this.state.tree}
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
                  onMouseEnter={this.handleFileMouseOver.bind(this)}
                  onMouseLeave={this.handleFileMouseOut.bind(this)}
                  onClick={this.handleFileClick.bind(this, item)}>
                  {
                    _.find(this.state.filesOpened, function(f) {
                      return f.path == item.path; }) ?
                    <i className="file text icon"></i> :
                    <i className="file text outline icon"></i>
                  } {item.name}
                  {
                    <i
                      data-target="#file-manipulation-modal" data-toggle="modal"
                      onClick={this.handleFileManipulationClick.bind(this, 'Rename', item)}
                      className="olive write icon invisible file-manipulation"
                      title="Rename this file" style={{ marginLeft: 20 }}></i>
                  }
                  {
                    <i
                      data-target="#file-manipulation-modal" data-toggle="modal"
                      onClick={this.handleFileManipulationClick.bind(this, 'Delete', item)}
                      className="red remove icon invisible file-manipulation"
                      title="Delete this file"></i>
                  }
                  {
                    <i
                      data-target="#file-manipulation-modal" data-toggle="modal"
                      onClick={this.handleFileManipulationClick.bind(this, 'Copy', item)}
                      className="teal copy icon invisible file-manipulation"
                      title="Copy this file to..."></i>
                  }
                </button>
              );
            }
          }.bind(this))
        }
        <button
          className="btn btn-link new-file-button block"
          onClick={this.handleCreateNewClick.bind(this)}
          data-toggle="modal" type="button"
          data-target="#create-file-modal">
          <i className="add square icon"></i> Create New...
        </button>
      </div>
    );
  }
}

export default FileNode;
