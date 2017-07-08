import FileNode from './FileNode.js';

// 
// FileSideBar component
// 
class FileSideBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tree: {},
      repository: null,
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
      repository: null,
      branch: null,
      commit: null,
      filesOpened: [],
      fileActive: null
    }, function() {
      callback();
    });
  }

  _loadTree(repository, branch, commit) {
    // GET project file structure
    let url = '/api/project/tree/' + repository.full_name + '/' + branch.name + '/' + commit.sha;
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
            tree: response.tree//,
            // repository: repository
          });
        }
      }
    });
  }

  componentDidMount() {
    this.setState({
      // project: this.props.project,
      repository: this.props.repository,
      branch: this.props.branch,
      commit: this.props.commit
    }, function() {
      this._loadTree(this.state.repository, this.state.branch, this.state.commit);
    });
  }

  componentWillReceiveProps(nextProps) {
    if(this.state.repository && this.state.repository.full_name != nextProps.repository.full_name
      || this.state.branch && this.state.branch.name != nextProps.branch.name
      || this.state.commit && this.state.commit.sha != nextProps.commit.sha) {
      // Need to reset the component and update tree:
      //   when another repository is selected
      //   when another branch is selected
      //   when another commit is selected
      // let self = this;
      // this._reset(function() {
      //   self._loadTree(nextProps.repository, nextProps.branch, nextProps.commit);
      // });
      this._loadTree(nextProps.repository, nextProps.branch, nextProps.commit);
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
