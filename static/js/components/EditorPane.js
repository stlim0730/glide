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
          <h6 className="card-header">Editor</h6>
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
