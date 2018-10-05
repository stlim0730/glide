import brace from 'brace';
import AceEditor from 'react-ace';
import FileUtil from '../util/FileUtil.js';

// Syntax highlighing supported by Ace Editor
import 'brace/mode/c_cpp';
import 'brace/mode/coffee';
import 'brace/mode/csharp';
import 'brace/mode/css';
import 'brace/mode/ejs';
import 'brace/mode/haml';
import 'brace/mode/handlebars';
import 'brace/mode/html';
import 'brace/mode/jade';
import 'brace/mode/java';
import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/mode/latex';
import 'brace/mode/less';
import 'brace/mode/liquid';
import 'brace/mode/lua';
import 'brace/mode/markdown';
import 'brace/mode/matlab';
import 'brace/mode/perl';
import 'brace/mode/php';
import 'brace/mode/plain_text';
import 'brace/mode/python';
import 'brace/mode/r';
import 'brace/mode/ruby';
import 'brace/mode/sass';
import 'brace/mode/scala';
import 'brace/mode/svg';
import 'brace/mode/swig';
import 'brace/mode/text';
import 'brace/mode/toml';
import 'brace/mode/twig';
import 'brace/mode/xml';
import 'brace/mode/yaml';

// Themes supported by Ace Editor
import 'brace/theme/ambiance';
import 'brace/theme/chaos';
import 'brace/theme/chrome';
import 'brace/theme/clouds_midnight';
import 'brace/theme/clouds';
import 'brace/theme/cobalt';
import 'brace/theme/crimson_editor';
import 'brace/theme/dawn';
import 'brace/theme/dracula';
import 'brace/theme/dreamweaver';
import 'brace/theme/eclipse';
import 'brace/theme/github';
import 'brace/theme/gob';
import 'brace/theme/gruvbox';
import 'brace/theme/idle_fingers';
import 'brace/theme/iplastic';
import 'brace/theme/katzenmilch';
import 'brace/theme/kr_theme';
import 'brace/theme/kuroir';
import 'brace/theme/merbivore_soft';
import 'brace/theme/merbivore';
import 'brace/theme/mono_industrial';
import 'brace/theme/monokai';
import 'brace/theme/pastel_on_dark';
import 'brace/theme/solarized_dark';
import 'brace/theme/solarized_light';
import 'brace/theme/sqlserver';
import 'brace/theme/terminal';
import 'brace/theme/textmate';
import 'brace/theme/tomorrow_night_blue';
import 'brace/theme/tomorrow_night_bright';
import 'brace/theme/tomorrow_night_eighties';
import 'brace/theme/tomorrow_night';
import 'brace/theme/tomorrow';
import 'brace/theme/twilight';
import 'brace/theme/vibrant_ink';
import 'brace/theme/xcode';

// Many code editor libraries are problematic, or not state-responsive,
//   since they weren't originally made to work with React.
// 
// Tried - didn't work well enough
//   'react-ace-editor'
//   'react-codemirror'
//   'react-codemirror2'
// 
// Currently using
//   'react-ace'
//   Be aware of the potential conflicts with 'react-ace'
// 
// Potential alternatives if things go wrong with the editor library
//   'react-ace-2'
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
      changedFiles: [],
      timeoutId: null
    };

    this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
    this.handleTabMouseOver = this.handleTabMouseOver.bind(this);
    this.handleTabMouseOut = this.handleTabMouseOut.bind(this);
    this.handleTabCloseClick = this.handleTabCloseClick.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }

  static getMode(fileObj) {
    const regexes = {
      'c_cpp': /\.(c|cpp|h)$/,
      'coffee': /\.coffee$/,
      'csharp': /\.cs$/,
      'css': /\.css$/,
      'ejs': /\.ejs$/,
      'haml': /\.haml$/,
      'handlebars': /\.handlebars$/,
      'html': /\.(html|htm)$/,
      'jade': /\.jade$/,
      'java': /\.java$/,
      'javascript': /\.js$/,
      'json': /\.json$/,
      'latex': /\.(latex|tex)$/,
      'less': /\.less$/,
      'liquid': /\.liquid$/,
      'lua': /\.lua$/,
      'markdown': /\.(md|markdown|mdown|mkdn|mkd)$/,
      'matlab': /\.m$/,
      'perl': /\.pl$/,
      'php': /\.php$/,
      'plain_text': /\.txt$/,
      'python': /\.py$/,
      'r': /\.r$/,
      'ruby': /\.rb$/,
      'sass': /\.sass$/,
      'scala': /\.scala$/,
      'svg': /\.svg$/,
      'swig': /\.swig$/,
      // 'text': /\.txt$/,
      'toml': /\.toml$/,
      'twig': /\.twig$/,
      'xml': /\.xml$/,
      'yaml': /\.(yml|yaml)$/
    };

    for(let key in regexes) {
      let regex = regexes[key];
      if(regex.test(fileObj.name)) {
        return key;
      }
    }

    return 'plain_text';
  }

  static getInlineImgUrl(fileObj) {
    return 'data:image/png;base64,' + btoa(fileObj.originalContent);
  }

  // static _getTabId(fileObj) {
  //   let prefix = 'tab_';
  //   return prefix + fileObj.sha;
  // }

  static getEditorId(fileObj) {
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

  save(file, newVal) {
    let app = this.props.app;
    let self = this;
    let changedFiles = this.state.changedFiles;
    
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
        console.debug(response);
        if('error' in response) {
          // TODO
        }
        else {
          // Set state for changed files
          file.size = response.size;

          let staged = true && _.find(changedFiles, { path: file.path });
          // let updateState = false;
                    
          if(file.modified && !staged) {
            changedFiles.push(file);
            // updateState = true;
          }
          else if(!file.modified && staged) {
            _.remove(changedFiles, function(f) {
              return f.path == file.path;
            });
            // updateState = true;
          }

          self.setState({
            fileActive: file,
            changedFiles: changedFiles
          }, function() {
            app.setState({
              fileActive: file,
              changedFiles: changedFiles,
              editorChangesSaved: true,
              rendererUpdated: false
            });
          });

          // if(updateState) {
          //   self.setState({
          //     changedFiles: changedFiles
          //   }, function() {
          //     app.setState({
          //       changedFiles: changedFiles
          //     });
          //   });
          // }
        }
      }
    });
  }

  handleEditorChange(file, newVal, aceEvent) {
    let self = this;
    let app = this.props.app;

    file.newContent = newVal;
    if(file.originalContent != file.newContent) {
      // This file has been modified.
      file.modified = true;
    }
    else {
      // This file hasn't been modified:
      file.modified = false;
      delete file.newContent;
    }

    app.setState({
      editorChangesSaved: false
    });

    let delay = 3000;

    // Delayed save
    clearTimeout(this.state.timeoutId);
    this.state.timeoutId = setTimeout(function() {
      self.save(file, newVal);
    }, delay);
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

  render() {
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
            href="#"
            // Now handling bootstrap tab behavior in React-controlled way,
            //   so comment them out
            // href={"#" + TabbedEditors.getEditorId(item)}
            // data-toggle="tab"
            className={tabClassName}
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
      let idStr = TabbedEditors.getEditorId(item);
      
      // Handle height of editor:
      //   The editor overflows the pane
      let editorMaxHeight = $('#editor-wrapper').height() - 50;
      $('div.ace_content').css('height', editorMaxHeight + 'px');
      $('div.ace_layer').css('height', editorMaxHeight + 'px');

      // Set syntax highlighter of the editor
      let mode = TabbedEditors.getMode(item);

      let editor = FileUtil.isText(item) ?
        <AceEditor
          className={editorClassName}
          editorProps={{$blockScrolling: Infinity}}
          enableBasicAutocompletion={false}
          enableLiveAutocompletion={false}
          enableSnippets={false}
          key={index}
          mode={mode}
          name={idStr}
          onChange={this.handleEditorChange.bind(this, item)}
          showPrintMargin={false}
          style={{height: editorMaxHeight}}
          tabSize={2}
          theme={this.props.theme ? this.props.theme : 'textmate'}
          value={item.modified ? item.newContent : item.originalContent}
          width="100%" /> :
        (
          FileUtil.isImage(item) ?
          <div key={index} className={editorClassName} id={idStr}>
            <img src={TabbedEditors.getInlineImgUrl(item)} />
          </div>:
          null
        );

      tabbedEditors.push(editor);
    }.bind(this));

    return (
      
      <div id="editor-wrapper" style={{height: '95vh'}}>
        <ul id="editor-tab-wrapper" className="nav nav-tabs" style={{backgroundColor: '#ededed'}}>
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
