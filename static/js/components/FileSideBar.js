import FileNode from './FileNode.js';

// 
// FileSideBar component
// 
class FileSideBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      constants: {
        TYPE_VIEW: 'type',
        FOLDER_VIEW: 'path'
      },
      groupBy: 'path',
      tree: {},
      project: this.props.project,
      fileOpened: [],
      fileActive: null
    };

    this._loadTree = this._loadTree.bind(this);
  }

  _loadTree(projectSlug) {
    // GET project file structure
    let url = '/api/project/tree/' + projectSlug;
    let self = this;
    $.ajax({
      url: url,
      method: 'GET',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      success: function(response) {
        console.info('_loadTree AJAX success', response);
        if('error' in response) {
          // TODO
        }
        else {
          self.setState({
            tree: response.tree
          });
        }
      }
    });
  }

  componentDidMount() {
    this._loadTree(this.state.project.slug);
  }

  componentWillReceiveProps(nextProps) {
    this._loadTree(nextProps.project.slug);
  }

  render () {
    return (
      <div className="col-lg-2 col-md-2 full-height">
        <div className="panel panel-default full-height">
          <div className="panel-heading">Files</div>

          {
            this.state.groupBy == 'type'
            ?
            (
              <div className="auto-scroll full-height">
              </div>
            )
            :
            (
              <div className="auto-scroll full-height panel-body">
                <FileNode nodes={this.state.tree.nodes} fileSideBar={this} app={this.props.app}/>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default FileSideBar
