import '../../css/codemirror/codemirror.css';
var CodeMirror = require('react-codemirror');


// 
// TabbedEditors component
// 
class TabbedEditors extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filesOpened: [],
      fileActive: null,
      editors: {}
    };

    // this._slugify = this._slugify.bind(this);
    this._getEditorId = this._getEditorId.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
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

  _getEditorId(fileObj) {
    let suffix = '_editor';
    return fileObj.sha + suffix;
  }

  handleTabClick(file, e) {
    let app = this.props.app;
    this.setState({
      fileActive: file
    }, function() {
      app.setState({
        fileActive: file
      });
    });
  }

  handleEditorChange(file, newVal) {
    file.newContent = newVal;
    let app = this.props.app;
    if(file.originalContent != file.newContent) {
      // This file has been modified.
      //   NOT USED file.modified = true;
      if(!_.find(app.state.changedFiles, { path: file.path })) {
        let changedFiles = app.state.changedFiles;
        changedFiles.push(file);
        app.setState({
          changedFiles: changedFiles
        });
      }
    }
    else {
      // This file hasn't been modified:
      //   Take out this file from staged area
      
      // Returns a new array with non-target elements
      let changedFiles = _.remove(app.state.changedFiles, function(item) {
        return item.path != file.path;
      });
      app.setState({
        changedFiles: changedFiles
      });
    }
  }

  componentDidMount() {
    this.setState({
      filesOpened: this.props.filesOpened,
      fileActive: this.props.fileActive
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      filesOpened: nextProps.filesOpened,
      fileActive: nextProps.fileActive
    }, function() {
      let file = this.state.fileActive;
      if(file) {
        // let editorId = this._getEditorId(file);
        // let editor = ace.edit(editorId);
        // let editors = this.state.editors;
        // editors[editorId] = editor;
        // this.setState({
        //   editors: editors
        // }, function() {
          // Default editor settings
          // editor.getSession().setTabSize(2);
          // editor.getSession().setUseSoftTabs(true);
          // editor.$blockScrolling = Infinity;
          // editor.setValue(file.content);
          // 
          // TODO: Editor mode according to file types
          // 
          // editor.setMode('ace/mode/yaml');
          // 
          // editor.gotoLine(1);
          // editor.focus();
          // console.info(this.state.editors);
        // });
      }
    });
  }

  render () {
    let tabs = [];
    let tabbedEditors = [];
    this.state.filesOpened.map(function(item, index) {

      let tabClassName = (item == this.state.fileActive ? "active" : "");
      tabs.push(
        <li key={item.path} className={tabClassName}>
          <a
            href={"#" + this._getEditorId(item)}
            data-toggle="tab"
            onClick={this.handleTabClick.bind(this, item)}>
            {item.name}
          </a>
        </li>
      );
      
      // let editorClassName = (this.state.fileActive == item ? "tab-pane fade active in full-height position-relative" : "tab-pane fade full-height position-relative");
      // tabbedEditors.push(
      //   <div key={item.path} id={this._getEditorId(item)} className={editorClassName}></div>
      // );

      // let editorClassName = (this.state.fileActive == item ? "tab-pane fade active in full-height position-relative" : "tab-pane fade full-height position-relative");
      // tabbedEditors.push(
      //   <AceEditor key={item.path} id={this._getEditorId(item)} className={editorClassName} file={this.state.fileActive}/>
      // );

      // let editorClassName = (this.state.fileActive == item ? "tab-pane fade active in full-height position-relative" : "tab-pane fade full-height position-relative");
      // tabbedEditors.push(
      //   <CodeMirrorEditor key={item.path} id={this._getEditorId(item)} className={editorClassName} file={this.state.fileActive} />
      // );

      let editorClassName = (this.state.fileActive == item ? "tab-pane fade active in full-height" : "tab-pane fade full-height");
      let options = {
        lineNumbers: true
      };
      tabbedEditors.push(
        // <CodeMirrorEditor key={item.path} id={this._getEditorId(item)} className={editorClassName} file={this.state.fileActive} />
        <CodeMirror
          key={item.path}
          file={item}
          value={item.newContent ? item.newContent : item.originalContent}
          className={editorClassName}
          autoFocus={true}
          options={options}
          onChange={this.handleEditorChange.bind(this, item)} />
      );

    }.bind(this))

    return (
      <div className="height-95">
        <ul className="nav nav-tabs">
          {tabs}
        </ul>
        <div className="tab-content height-95">
          {tabbedEditors}
        </div>
      </div>
    );
  }
}

export default TabbedEditors
