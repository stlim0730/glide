import FileNode from './FileNode.js';

// 
// FileSideBar component
// 
class FileSideBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewFriendlyTree: {},
      tree: {},
      repository: null,
      branch: null,
      commit: null,
      filesOpened: [],
      fileActive: null
    };

    this._ajaxTree = this._ajaxTree.bind(this);
    // this._reset = this._reset.bind(this);
  }

  // _reset(callback) {
  //   this.setState({
  //     viewFriendlyTree: {},
  //     tree: {},
  //     repository: null,
  //     branch: null,
  //     commit: null,
  //     filesOpened: [],
  //     fileActive: null
  //   }, function() {
  //     // callback();
  //   });
  // }

  _ajaxTree(repository, branch, commit) {
    // GET project file structure
    let url = '/api/project/tree/' + repository.full_name + '/' + branch.name + '/' + commit.sha;
    let self = this;
    $.ajax({
      url: url,
      method: 'GET',
      // headers: { 'X-CSRFToken': window.glide.csrfToken },
      success: function(response) {
        console.info('_ajaxTree AJAX success', response);
        if('error' in response) {
          // TODO
        }
        else {
          self.setState({
            viewFriendlyTree: response.viewFriendlyTree,
            tree: response.tree
          });
        }
      }
    });
  }
  
  componentDidMount() {
    // console.info('FileSideBar CDM', this.state);
    // let self = this;
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      commit: this.props.commit
    }/*, function() {
      self._ajaxTree(
        self.state.repository,
        self.state.branch,
        self.state.commit
      );
    }*/);
  }

  componentWillReceiveProps(nextProps) {
    console.info('FileSideBar CWRP', this.state);
    let self = this;
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      commit: nextProps.commit
    }, function() {
      self._ajaxTree(
        self.state.repository,
        self.state.branch,
        self.state.commit
      );
    });
    // if(this.state.repository && this.state.repository.full_name != nextProps.repository.full_name
    //   || this.state.branch && this.state.branch.name != nextProps.branch.name
    //   || this.state.commit && this.state.commit.sha != nextProps.commit.sha) {
    //   // Need to reset the component and update viewFriendlyTree:
    //   //   when another repository is selected
    //   //   when another branch is selected
    //   //   when another commit is selected
    //   // let self = this;
    //   // this._reset(function() {
    //   //   self._ajaxTree(nextProps.repository, nextProps.branch, nextProps.commit);
    //   // });
    //   this._ajaxTree(nextProps.repository, nextProps.branch, nextProps.commit);
    // }
  }

  render () {
    console.info('FileSideBar', this.state);
    return (
      <div className="col-lg-2 col-md-2 full-height">
        <div className="panel panel-default full-height">
          <div className="panel-heading">Files</div>
          {
            <div className="auto-scroll height-90 panel-body">
              <FileNode
                nodes={this.state.viewFriendlyTree.nodes}
                fileSideBar={this}
                app={this.props.app} />
            </div>
          }
        </div>
      </div>
    );
  }
}

export default FileSideBar
