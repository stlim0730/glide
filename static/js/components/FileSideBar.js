import FileNode from './FileNode.js';

// 
// FileSideBar component
// 
class FileSideBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      commit: null,
      recursiveTree: null,
      tree: null,
      filesOpened: [],
      fileActive: null
    };

    this._ajaxTree = this._ajaxTree.bind(this);
    // this._reset = this._reset.bind(this);
  }

  // _reset(callback) {
  //   this.setState({
  //     recursiveTree: {},
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
    // console.info('FileSideBar _ajaxTree', this.state);
    let url = '/api/project/tree/'
      + repository.full_name + '/'
      + branch.name + '/' + commit.sha;
    let app = this.props.app;
    let self = this;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        // console.info('_ajaxTree AJAX success', response);
        if('error' in response) {
          // TODO
        }
        else {
          self.setState({
            recursiveTree: response.recursiveTree,
            tree: response.tree
          }, function() {
            app.setState({
              recursiveTree: response.recursiveTree,
              tree: response.tree
            });
          });
        }
      }
    });
  }
  
  componentDidMount() {
    let self = this;
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      commit: this.props.commit,
      filesOpened: this.props.filesOpened,
      fileActive: this.props.fileActive
    }, function() {
      // console.info('FileSideBar CDM', this.state);
      // let repository = self.state.repository;
      // let branch = self.state.branch;
      // let commit = self.state.commit;
      // if(repository && branch && commit) {
        self._ajaxTree(
          self.state.repository,
          self.state.branch,
          self.state.commit
        );
      // }
    });
  }

  componentWillReceiveProps(nextProps) {
    // if(this.state.repository == nextProps.repository
    //   && this.state.branch == nextProps.branch
    //   && this.state.commit == nextProps.commit) {
    //   // To avoid unnecessary _ajaxTree call
    //   return;
    // }

    // if(this.state.recursiveTree != nextProps.recursiveTree) {
    //   // No need to make _ajaxTree call:
    //   //   This should happen
    //   //   when the recursiveTree structure has changed
    //   //   outside this component (e.g., CreateFileModalContent).
    //   console.info('rec tree received');
    //   this.setState({
    //     recursiveTree: nextProps.recursiveTree
    //   });
    //   return;
    // }

    // let self = this;
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      commit: nextProps.commit,
      filesOpened: nextProps.filesOpened,
      fileActive: nextProps.fileActive
    }, function() {
      console.info('FileSideBar WRP', this.state, nextProps);
      // self._ajaxTree(
      //   self.state.repository,
      //   self.state.branch,
      //   self.state.commit
      // );
    });

    // 
    // I don't understand why I wrote these lines below...
    // 
    // if(this.state.repository && this.state.repository.full_name != nextProps.repository.full_name
    //   || this.state.branch && this.state.branch.name != nextProps.branch.name
    //   || this.state.commit && this.state.commit.sha != nextProps.commit.sha) {
    //   // Need to reset the component and update recursiveTree:
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
    // console.info('FileSideBar', this.state);
    return (
      <div className="col-lg-2 col-md-2 no-padding full-height">

        <div className="card full-height">
          <h6 className="card-header">Files</h6>
          {
            this.state.recursiveTree &&
            <div className="auto-scroll height-90">
              <FileNode
                app={this.props.app}
                repository={this.state.repository}
                filesOpened={this.state.filesOpened}
                fileActive={this.state.fileActive}
                currentPath=''
                nodes={this.state.recursiveTree.nodes} />
            </div>
          }
        </div>

      </div>
    );
  }
}

export default FileSideBar;
