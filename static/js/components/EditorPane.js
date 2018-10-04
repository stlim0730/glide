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
      fileActive: null,
      theme: null,
      editorExpanded: null
    };

    // this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
    this.handleExpandClick = this.handleExpandClick.bind(this);
    this.handleThemeOptionChange = this.handleThemeOptionChange.bind(this);
  }

  // _addFileToRecursiveTree(recursiveTree, newFile, folders) {
  //   if(folders.length == 1) {
  //     // This is the location where we add the file
  //     // Duplicate Check
  //     //   Just remove potentially existing duplicate
  //     //   and just push the new file.
  //     _.remove(recursiveTree.nodes, function(file) {
  //       // console.log(file.path, newFile.path);
  //       return file.path == newFile.path;
  //     });
      
  //     // TODO: Add a leading '/'?
  //     recursiveTree.nodes.push(newFile);
  //   }
  //   else {
  //     // We should go deeper
  //     let folderName = folders.shift();
  //     // Duplicate check
  //     let targetFolder = _.find(recursiveTree.nodes, {name: folderName, type: 'tree'});
  //     if(targetFolder) {
  //       // The target path exists
  //       this._addFileToRecursiveTree(targetFolder, newFile, folders);
  //     }
  //     else {
  //       // Create a subfolder
  //       let subdirs = '/' + folders.join('/');
  //       let path  = '/' + newFile.path.replace(subdirs, '');
  //       // Create a folder
  //       let newFolder = {
  //         name: folderName,
  //         nodes: [],
  //         path: path,
  //         type: 'tree',
  //         mode: '040000'
  //       };

  //       recursiveTree.nodes.push(newFolder);
  //       this._addFileToRecursiveTree(newFolder, newFile, folders);
  //     }
  //   }
  // }

  handleThemeOptionChange(e) {
    let theme = e.target.value;
    this.setState({
      theme: theme
    });
  }

  handleExpandClick(e) {
    let app = this.props.app;
    this.setState({
      editorExpanded: !this.state.editorExpanded
    }, function() {
      app.setState({
        editorExpanded: this.state.editorExpanded
      });
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
      fileActive: this.props.fileActive,
      editorExpanded: this.props.editorExpanded
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
      fileActive: nextProps.fileActive,
      editorExpanded: nextProps.editorExpanded
    });
  }

  render () {
    return (
      <div className={this.state.editorExpanded ? 'col-lg-10 col-md-10 no-padding' : 'col-lg-5 col-md-5 no-padding'} style={{height: '95vh'}}>

        <div className="card" style={{height: '95vh'}}>
          <div className="card-header" style={{paddingTop: 0, paddingBottom:0}}>
            <h6 className="inline-block" style={{paddingTop: 11}}>Editor</h6>

            <button type="button" className="btn btn-link" style={{paddingTop: 0}}
              onClick={this.handleExpandClick}>
              <i className={this.state.editorExpanded ? 'caret square left outline icon' : 'caret square right outline icon'}></i>
              {this.state.editorExpanded ? 'Compress' : 'Expand'} Editor
            </button>

            <div className="form-group inline-block form-control-sm"
              style={{marginBottom: 0, paddingTop: 3, paddingBottom: 2, float: 'right'}}>
              <select className="custom-select" onChange={this.handleThemeOptionChange}>
                <option value="">Select Your Favorite Editor Theme</option>
                <option value="ambiance">Ambiance</option>
                <option value="chaos">Chaos</option>
                <option value="chrome">Chrome</option>
                <option value="clouds_midnight">Clouds Midnight</option>
                <option value="clouds">Clouds</option>
                <option value="cobalt">Cobalt</option>
                <option value="crimson_editor">Crimson Editor</option>
                <option value="dawn">Dawn</option>
                <option value="dracula">Dracula</option>
                <option value="dreamweaver">Dreamweaver</option>
                <option value="eclipse">Eclipse</option>
                <option value="github">Github</option>
                <option value="gob">Gob</option>
                <option value="gruvbox">Gruvbox</option>
                <option value="idle_fingers">Idle Fingers</option>
                <option value="iplastic">Iplastic</option>
                <option value="katzenmilch">Katzenmilch</option>
                <option value="kr_theme">Kr Theme</option>
                <option value="kuroir">Kuroir</option>
                <option value="merbivore_soft">Merbivore Soft</option>
                <option value="merbivore">Merbivore</option>
                <option value="mono_industrial">Mono Industrial</option>
                <option value="monokai">Monokai</option>
                <option value="pastel_on_dark">Pastel On Dark</option>
                <option value="solarized_dark">Solarized Dark</option>
                <option value="solarized_light">Solarized Light</option>
                <option value="sqlserver">Sqlserver</option>
                <option value="terminal">Terminal</option>
                <option value="textmate">Textmate</option>
                <option value="tomorrow_night_blue">Tomorrow Night Blue</option>
                <option value="tomorrow_night_bright">Tomorrow Night Bright</option>
                <option value="tomorrow_night_eighties">Tomorrow Night Eighties</option>
                <option value="tomorrow_night">Tomorrow Night</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="twilight">Twilight</option>
                <option value="vibrant_ink">Vibrant Ink</option>
                <option value="xcode">Xcode</option>
              </select>
            </div>
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
            fileActive={this.state.fileActive}
            theme={this.state.theme} />
        </div>
      </div>
    );
  }
}

export default EditorPane;
