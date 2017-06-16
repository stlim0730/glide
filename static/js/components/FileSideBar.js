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
      project: null,
      filesOpened: [],
      fileActive: null
    };

    this._loadTree = this._loadTree.bind(this);
    this._reset = this._reset.bind(this);
  }

  _reset() {
    this.setState({
      groupBy: 'path',
      tree: {},
      project: null,
      filesOpened: [],
      fileActive: null
    });
  }

  _loadTree(project) {
    // GET project file structure
    let url = '/api/project/tree/' + project.slug;
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
            tree: response.tree,
            project: project
          });
        }
      }
    });
  }

  componentDidMount() {
    this.setState({
      project: this.props.project
    }, function() {
      this._loadTree(this.state.project);
    });
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.project && this.state.project.slug != nextProps.project.slug) {
      // Need to update tree
      this._reset();
      this._loadTree(nextProps.project);
    }
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
              <div className="auto-scroll height-90 panel-body">
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
