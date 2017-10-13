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

    this._getEditorId = this._getEditorId.bind(this);
    this._requestRender = this._requestRender.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }

  _getEditorId(fileObj) {
    let suffix = '_editor';
    return fileObj.sha + suffix;
  }

  _requestRender(data, fileName) {
    // POST Request rendering
    let url = '/api/project/render';
    let app = this.props.app;
    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        data: data,
        fileName: fileName
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        console.info(response);
        if('error' in response) {
          app.setState({
            liveBugs: response.error,
            liveYaml: null,
            liveHtml: null
          });
        }
        else {

          let liveHtml = null;
          let liveYaml = null;

          if('html' in response) {
            liveHtml = response.html;
          }

          if('yaml' in response) {
            liveYaml = response.yaml;
          }

          app.setState({
            liveHtml: liveHtml,
            liveYaml: liveYaml,
            liveBugs: []
          });
        }
      }
    });
  }

  handleTabClick(file, e) {
    let self = this;
    let app = this.props.app;
    this.setState({
      fileActive: file
    }, function() {
      app.setState({
        fileActive: file
      });

      let content = null;
      if(file.newContent) {
        content = file.newContent;
      }
      else {
        content = file.originalContent;
      }
      self._requestRender(content, file.name);
    });
  }

  handleEditorChange(file, newVal) {
    file.newContent = newVal;
    let app = this.props.app;
    
    if(file.originalContent != file.newContent) {
      // This file has been modified.
      //   CURRENTLY NOT USING file.modified = true;
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

    this._requestRender(file.newContent, file.name);
  }

  componentDidMount() {
    this.setState({
      filesOpened: this.props.filesOpened,
      fileActive: this.props.fileActive
    });
  }

  componentWillReceiveProps(nextProps) {

    // let currentFilesOpened = this.state.filesOpened;
    // let nextFilesOpened = nextProps.filesOpened;
    // _.forEach()
    let self = this;
    let prevFileActive = this.state.fileActive;

    this.setState({
      filesOpened: nextProps.filesOpened,
      fileActive: nextProps.fileActive
    }, function() {

      if(self.state.filesOpened == [] && self.state.fileActive == null) {
        $('#tabbed-editors-tabs').empty();
        $('#tabbed-editors-editors').empty();
      }
      else if(self.state.fileActive && prevFileActive != nextProps.fileActive){
        let fileActive = self.state.fileActive;
        let content = null;
        if(fileActive.newContent) {
          content = fileActive.newContent;
        }
        else {
          content = fileActive.originalContent;
        }
        
        self._requestRender(content, fileActive.name);
      }
      // $('.CodeMirror').each(function(i, el){
      //   el.CodeMirror.refresh();
      //   console.info(el);
      // });
      // let file = this.state.fileActive;
      // if(file) {
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
      // }
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
        <ul className="nav nav-tabs" id="tabbed-editors-tabs">
          {tabs}
        </ul>
        <div className="tab-content height-95" id="tabbed-editors-editors">
          {tabbedEditors}
        </div>
      </div>
    );
  }
}

export default TabbedEditors
