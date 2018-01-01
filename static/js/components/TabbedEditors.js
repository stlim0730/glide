import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/markdown';
import 'brace/theme/github';

// Many code editor libraries are problematic, or not state-responsive,
//   since they weren't originally made to work with React.
// 
// Tried - didn't work well enough
//   'react-ace'
//   'react-ace-editor'
//   'react-codemirror'
//   'react-codemirror2'
// 
// Currently using
//   'react-ace-2' // the module name is still 'react-ace'
//   Be aware of the potential conflicts with 'react-ace'
// 
// Potential alternatives if things go wrong with the editor library
//   'react-ace-wrapper'
//   // To be added

//
// TabbedEditors component
// 
class TabbedEditors extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      tree: null,
      recursiveTree: null,
      filesOpened: [],
      fileActive: null,
      changedFiles: []
    };

    this._isTextFile = this._isTextFile.bind(this);
    this._isImageFile = this._isImageFile.bind(this);
    this._getObjUrl = this._getObjUrl.bind(this);
    this._getTabId = this._getTabId.bind(this);
    this._getEditorId = this._getEditorId.bind(this);
    this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
    this.handleTabMouseOver = this.handleTabMouseOver.bind(this);
    this.handleTabMouseOut = this.handleTabMouseOut.bind(this);
    this.handleTabCloseClick = this.handleTabCloseClick.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }
  
  _isTextFile(fileObj) {
    const regexes = {
      'textFileRegex'          : /\.txt/,
      'htmlFileRegex'          : /\.(htm|html)/,
      'webDevFileRegex'        : /\.(js|css|sass|less)/,
      'hexoTemplateFileRegex'  : /\.(swig|ejs|pug|haml|jade)/,
      'customTemplateFileRegex': /\.(mustache|handlebars|dust)/,
      'dataFileRegex'          : /\.(yaml|yml|json)/,
      'markdownFileRegex'      : /\.(md|markdown|mdown|mkdn|mkd)/,
      'miscAppFileRegex'       : /\.(csv|latex|tex|log|sh)/
    };

    for(let key in regexes) {
      let regex = regexes[key];
      if(regex.test(fileObj.name)) {
        return true;
      }
    }

    return false;
  }

  _isImageFile(fileObj) {
    const imgFileRegex = /\.(jpg|jpeg|gif|png|svg|bmp|ico)$/i;
    if(imgFileRegex.test(fileObj.name)) {
      return true;
    }
    else {
      return false;
    }
  }

  _getObjUrl(fileObj) {
    return 'data:image/png;base64,' + btoa(fileObj.originalContent);
  }

  _getTabId(fileObj) {
    let prefix = 'tab_';
    return prefix + fileObj.sha;
  }

  _getEditorId(fileObj) {
    let prefix = 'editor_';
    return prefix + fileObj.sha;
  }

  _addFileToRecursiveTree(recursiveTree, newFile, folders) {
    if(folders.length == 1) {
      recursiveTree.nodes.push(newFile);
    }
    else {
      let targetFolder = _.find(recursiveTree.nodes, {name: folders.shift(), type: 'tree'});
      this._addFileToRecursiveTree(targetFolder, newFile, folders);
    }
  }

  // _getBlob(repository, file) {
  //   let url = '/api/project/blob/' + repository.full_name + '/' + file.sha;
  //   let app = this.props.app;

  //   $.ajax({
  //     url: url,
  //     method: 'GET',
  //     success: function(response) {
  //       console.info('blob loaded', response);
  //       if('error' in response) {
  //         // TODO
  //         return null;
  //       }
  //       else {
  //         let content = atob(response.blob.content)
  //         file.originalContent = content;
  //         return content;
  //       }
  //     }
  //   });

  //   return null;
  // }

  handleTabMouseOver(e) {
    let closeButton = $(e.target).children('button.close-tab');
    $(closeButton).removeClass('invisible');
  }

  handleTabMouseOut(e) {
    let closeButton = $(e.target).children('button.close-tab');
    $(closeButton).addClass('invisible');
  }

  handleTabCloseClick(file, e) {
    e.stopPropagation();
    e.preventDefault();

    let filesOpened = this.state.filesOpened;
    let fileActive = this.state.fileActive;
    let app = this.props.app;

    _.remove(filesOpened, function (f) {
      return f.path == file.path;
    });

    if(fileActive.path == file.path) {
      // Closing the active tab
      fileActive = _.last(filesOpened);
    }
    else {
      // Closing one of the other tabs
      // Do nothing on fileActive
    }

    this.setState({
      filesOpened: filesOpened,
      fileActive: fileActive
    }, function() {
      app.setState({
        filesOpened: filesOpened,
        fileActive: fileActive
      });
    });
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

  handleEditorChange(file, newVal, aceEvent) {
    file.newContent = newVal;
    let app = this.props.app;
    let self = this;
    let changedFiles = this.state.changedFiles;
    
    if(file.originalContent != file.newContent) {
      // This file has been modified.
      file.modified = true;
    }
    else {
      // This file hasn't been modified:
      file.modified = false;
      delete file.newContent;
    }

    // POST the change
    let url = '/api/project/file/update';

    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        repository: this.state.repository.full_name,
        branch: this.state.branch.name,
        filePath: file.path,
        newVal: newVal
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        console.info(response);
        if('error' in response) {
          // TODO
        }
        else {
          // Set state for changed files
          file.size = response.size;

          let staged = true && _.find(changedFiles, { path: file.path });
          let updateState = false;
                    
          if(file.modified && !staged) {
            changedFiles.push(file);
            updateState = true;
          }
          else if(!file.modified && staged) {
            _.remove(changedFiles, function(f) {
              return f.path == file.path;
            });
            updateState = true;
          }

          if(updateState) {
            self.setState({
              changedFiles: changedFiles
            }, function() {
              app.setState({
                changedFiles: changedFiles
              });
            });
          }
        }
      }
    });

    // let data = this._prepareRenderingReq(file.newContent, file);
    // this._requestRendering(data);
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
    let self = this;
    let prevFileActive = this.state.fileActive;

    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      tree: nextProps.tree,
      recursiveTree: nextProps.recursiveTree,
      changedFiles: nextProps.changedFiles,
      addedFiles: nextProps.addedFiles,
      filesOpened: nextProps.filesOpened,
      fileActive: nextProps.fileActive
    }, function() {

      if(self.state.filesOpened.length==0 && self.state.fileActive == null) {
        // $('#tabbed-editors-tabs').empty();
        // $('#tabbed-editors-editors').empty();
      }
      else if(self.state.fileActive && prevFileActive != nextProps.fileActive){
        // let fileActive = self.state.fileActive;
        // let content = null;
        // if(fileActive.newContent) {
        //   content = fileActive.newContent;
        // }
        // else {
        //   content = fileActive.originalContent;
        // }
        
        // let data = self._prepareRenderingReq(content, fileActive);
        // self._requestRendering(data);
      }
    });
  }

  render () {
    let tabs = [];
    let tabbedEditors = [];

    this.state.filesOpened.map(function(item, index) {
      let tabClassName = (
        this.state.fileActive && 
        item.path == this.state.fileActive.path ?
        "nav-link active" :
        "nav-link"
      );
      tabs.push(
        <li key={index} className="nav-item">
          <a
            style={{paddingRight:8}} title={item.path}
            href={"#" + this._getEditorId(item)}
            data-toggle="tab" className={tabClassName}
            onMouseEnter={this.handleTabMouseOver.bind(this)}
            onMouseLeave={this.handleTabMouseOut.bind(this)}
            onClick={this.handleTabClick.bind(this, item)}>
            {item.name}
            <button
              type="button" className="btn btn-link close-tab invisible"
              style={{paddingTop:2, paddingRight:0, paddingLeft:8}}
              onClick={this.handleTabCloseClick.bind(this, item)}>
              {
                // <strong className="text-danger">&times;</strong>
              }
              <i className="red remove icon"></i>
            </button>
          </a>
        </li>
      );

      let editorClassName = (
        this.state.fileActive &&
        this.state.fileActive.path == item.path ?
        "tab-pane fade in active show" :
        "tab-pane fade"
      );
      let options = {
        lineNumbers: true
      };
      let idStr = this._getEditorId(item);
      tabbedEditors.push(
        <div className={editorClassName} name={idStr} key={index}>
          {
            this._isTextFile(item) ?
            <AceEditor
              tabSize={2} mode="markdown" theme="github"
              onChange={this.handleEditorChange.bind(this, item)}
              value={item.newContent ? item.newContent : item.originalContent}
              name={"ace_" + idStr} enableBasicAutocompletion={false}
              enableSnippets={false} enableLiveAutocompletion={false}
              editorProps={{$blockScrolling: Infinity}} /> :
            (
              this._isImageFile(item) ?
              <div>
                <img src={this._getObjUrl(item)} />
              </div>:
              null
            )
          }
        </div>
      );
    }.bind(this))

    return (
      <div className="full-height">
        <ul className="nav nav-tabs">
          {tabs}
        </ul>
        <div className="tab-content">
          {tabbedEditors}
        </div>
      </div>
    );
  }
}

export default TabbedEditors;
