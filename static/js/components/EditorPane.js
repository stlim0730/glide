import EditorToolBar from './EditorToolBar.js';
import TabbedEditors from './TabbedEditors.js';

// 
// EditorPane component
// 
class EditorPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      tree: null,
      recursiveTree: null,
      changedFiles: [],
      addedFiles: [],
      filesOpened: [],
      fileActive: null
    };

    this.handleGenerateClick = this.handleGenerateClick.bind(this);
    this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
  }

  _addFileToRecursiveTree(recursiveTree, newFile, folders) {
    if(folders.length == 1) {
      // This is the location where we add the file
      // Duplicate Check
      //   Just remove potentially existing duplicate
      //   and just push the new file.
      _.remove(recursiveTree.nodes, function(file) {
        // console.log(file.path, newFile.path);
        return file.path == newFile.path;
      });
      
      // TODO: Add a leading '/'?
      recursiveTree.nodes.push(newFile);
    }
    else {
      // We should go deeper
      let folderName = folders.shift();
      // Duplicate check
      let targetFolder = _.find(recursiveTree.nodes, {name: folderName, type: 'tree'});
      if(targetFolder) {
        // The target path exists
        this._addFileToRecursiveTree(targetFolder, newFile, folders);
      }
      else {
        // Create a subfolder
        let subdirs = '/' + folders.join('/');
        let path  = '/' + newFile.path.replace(subdirs, '');
        // Create a folder
        let newFolder = {
          name: folderName,
          nodes: [],
          path: path,
          type: 'tree',
          mode: '040000'
        };

        recursiveTree.nodes.push(newFolder);
        this._addFileToRecursiveTree(newFolder, newFile, folders);
      }
    }
  }

  handleGenerateClick() {
    // POST request for Hexo initialization
    let url = '/api/project/generate';
    let self = this;
    let tree = this.state.tree;
    let recursiveTree = this.state.recursiveTree;
    let app = this.props.app;

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        addedFiles: this.state.addedFiles,
        changedFiles: this.state.changedFiles,
        repository: this.state.repository.full_name,
        branch: this.state.branch.name
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        console.log(response);
        if('error' in response) {
          // TODO
        }
        else {
          // Create the new file objects created on the server
          let createdFiles = response.createdFiles;
          let addedFiles = app.state.addedFiles;

          _.forEach(createdFiles, function(createdFile) {
            // To match encoding / decoding scheme to blobs through GitHub API
            createdFile.originalContent = atob(createdFile.originalContent);
            // Update the tree
            //   Duplicate check:
            //   Just remove potentially existing duplicate
            //   and just push the new file.
            _.remove(tree.tree, function(file) {
              return file.path == createdFile.path;
            });
            tree.tree.push(createdFile);

            // Push the file into recursiveTree
            let folders = createdFile.path.split('/');
            self._addFileToRecursiveTree(recursiveTree, createdFile, folders);
            
            // Update addedFiles
            //   Duplicate check:
            //   Just remove potentially existing duplicate
            //   and just push the new file.
            _.remove(addedFiles, function(file) {
              return file.path == createdFile.path;
            });
            addedFiles.push(createdFile);
          });

          self.setState({
            recursiveTree: recursiveTree,
            tree: tree
          }, function() {
            app.setState({
              recursiveTree: recursiveTree,
              tree: tree,
              addedFiles: addedFiles
            });
          });
        }
      }
    });
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      tree: this.props.tree,
      recursiveTree: this.props.recursiveTree,
      changedFiles: this.props.changedFiles,
      addedFiles: this.props.addedFiles,
      filesOpened: this.props.filesOpened,
      fileActive: this.props.fileActive
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles,
      filesOpened: nextProps.filesOpened,
      fileActive: nextProps.fileActive
    });
  }

  render () {
    return (
      <div className="col-lg-5 col-md-5 no-padding full-height">

        <div className="card full-height">
          <div
            className="card-header"
            style={{paddingTop: 8, paddingBottom: 6}}>
            <h6 className="inline-block">Editor</h6>
            <button
              style={{paddingTop: 0, paddingBottom: 0, marginTop: 3}}
              className="btn btn-outline-success btn-sm inline-block float-right"
              onClick={this.handleGenerateClick} type="button" >
              Generate & Render <i className="angle double right icon"></i>
            </button>
          </div>
          
          <TabbedEditors
            app={this.props.app}
            repository={this.state.repository}
            branch={this.state.branch}
            tree={this.props.tree}
            recursiveTree={this.props.recursiveTree}
            changedFiles={this.state.changedFiles}
            addedFiles={this.state.addedFiles}
            filesOpened={this.state.filesOpened}
            fileActive={this.state.fileActive} />
        </div>
      </div>
    );
  }
}

export default EditorPane;
