import FileNode from './FileNode.js';

// 
// FileSideBar component
// 
class FileSideBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tree: {},
      project: null,
      branch: null,
      commit: null,
      filesOpened: [],
      fileActive: null
    };

    this._loadTree = this._loadTree.bind(this);
    this._reset = this._reset.bind(this);
  }

  _reset(callback) {
    this.setState({
      tree: {},
      project: null,
      branch: null,
      commit: null,
      filesOpened: [],
      fileActive: null
    }, function() {
      callback();
    });
  }

  _loadTree(project, branch, commit) {
    // GET project file structure
    let url = '/api/project/tree/' + project.slug + '/' + branch.name + '/' + commit.sha;
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
      project: this.props.project,
      branch: this.props.branch,
      commit: this.props.commit
    }, function() {
      this._loadTree(this.state.project, this.state.branch, this.state.commit);
    });
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.project && this.state.project.slug != nextProps.project.slug
      || this.state.branch && this.state.branch.name != nextProps.branch.name
      || this.state.commit && this.state.commit.sha != nextProps.commit.sha) {
      // Need to reset the component and update tree:
      //   when another project is selected
      //   when another branch is selected
      //   when another commit is selected
      // let self = this;
      // this._reset(function() {
      //   self._loadTree(nextProps.project, nextProps.branch, nextProps.commit);
      // });
      this._loadTree(nextProps.project, nextProps.branch, nextProps.commit);
    }
  }

  render () {
    return (
      <div className="col-lg-2 col-md-2 full-height">
        <div className="panel panel-default full-height">
          <div className="panel-heading">Files</div>

          {
            <div className="auto-scroll height-90 panel-body">
              <FileNode nodes={this.state.tree.nodes} fileSideBar={this} app={this.props.app}/>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default FileSideBar
