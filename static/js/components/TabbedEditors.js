import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/markdown';
import 'brace/theme/github';

// Tried
//   'react-ace'
//   'react-ace-editor'
//   'react-codemirror'
//   'react-codemirror2'

// Current
//   'react-ace-2'

// Potential alternatives if things go wrong with the editor library
//   'react-ace-wrapper'

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
      // editors: {}
    };

    this._getTabId = this._getTabId.bind(this);
    this._getEditorId = this._getEditorId.bind(this);
    this._addFileToRecursiveTree = this._addFileToRecursiveTree.bind(this);
    this._updateFileInRecursiveTree = this._updateFileInRecursiveTree.bind(this);
    this._prepareRenderingReq = this._prepareRenderingReq.bind(this);
    this._requestRendering = this._requestRendering.bind(this);
    this.handleTabMouseOver = this.handleTabMouseOver.bind(this);
    this.handleTabMouseOut = this.handleTabMouseOut.bind(this);
    this.handleTabCloseClick = this.handleTabCloseClick.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
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

  _updateFileInRecursiveTree(recursiveTree, targetFile, folders) {
    console.info('_update', folders);
    if(folders.length == 1) {
      // Found the path
      recursiveTree.nodes.push(targetFile);
      let index = _.findIndex(recursiveTree.nodes, function(file) {
        return file.path == targetFile.path;
      });
      recursiveTree.nodes[index] = targetFile;
    }
    else {
      let targetFolder = _.find(recursiveTree.nodes, {name: folders.shift(), type: 'tree'});
      this._updateFileInRecursiveTree(targetFolder, targetFile, folders);
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

  _prepareRenderingReq(data, file) {
    // 
    // Returns data package
    //   to make rendering request with
    // 

    let app = this.props.app;
    let fileName = file.name;

    // Build data to make rendering request with
    //   - if the file is yaml, build a package with its template content.
    if(fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
      let templateFileRegex = /template\s*:\s*templates\/([a-z0-9\/\s\._-]+)\.(html|htm)/im;
      if(templateFileRegex.test(data)) {
        // Layout specified
        let matchRes = templateFileRegex.exec(data);
        // Note that the regex only returns the first match
        let templateFileName = _.join(_.concat(matchRes[1], matchRes[2]), '.');
        let templateFilePath = 'templates/' + templateFileName;
        // Find the templateFile
        let tree = this.state.tree.tree;
        let templateFile = _.find(tree, ['path', templateFilePath]);
        // Load template file content
        let templateFileContent = null;
        if(templateFile) {
          // Layout file exists in the repository
          if(templateFile.newContent) {
            // The user has been modified the template file content
            templateFileContent = templateFile.newContent;
          }
          else if(templateFile.originalContent) {
            // The template file content exists in the repository
            templateFileContent = templateFile.originalContent;
          }
          else {
            // This must not happen: originalContent must exist
            // templateFileContent = this._getBlob(app.state.repository, templateFile);
          }

          return {
            data: data,
            fileName: fileName,
            templateFileContent: templateFileContent
          };
        }
        else {
          // Layout file doesn't exist
          // TODO: Show the error in the debugger
          return {
            data: data,
            fileName: fileName
          };
        }
      }
      else {
        // TODO: Layout file not specified
        return {
          data: data,
          fileName: fileName
        };
      }
    }
    else {
      // TODO: The other file types
      return {
        data: data,
        fileName: fileName
      };
    }
  }

  _requestRendering(data) {
    if(!data) {
      return;
    }

    // POST Request rendering
    let url = '/api/project/render';
    let app = this.props.app;
    let self = this;

    // $.ajax({
    //   url: url,
    //   method: 'POST',
    //   headers: { 'X-CSRFToken': window.glide.csrfToken },
    //   dataType: 'json',
    //   data: JSON.stringify(data),
    //   contentType: 'application/json; charset=utf-8',
    //   success: function(response) {
    //     // console.info(response);
    //     if('error' in response) {
    //       // TODO: Remove the HTML file in tree and recursive tree if it exists
    //       app.setState({
    //         liveBugs: response.error,
    //         liveYaml: null,
    //         liveHtml: null
    //       });
    //     }
    //     else {

    //       let liveHtml = null;
    //       let liveYaml = null;

    //       // If the response has html structure
    //       if('html' in response) {
    //         liveHtml = response.html;
    //         // TODO: Create an HTML file in tree and recursive tree
    //         //   cf. CreateNewModalContent component

    //         let htmlFileName = data.fileName.replace(/\.(yaml|yml)$/, '.html');

    //         let tree = self.state.tree;
    //         let recursiveTree = self.state.recursiveTree;
    //         let filesOpened = self.state.filesOpened;
    //         let addedFiles = app.state.addedFiles;
    //         let changedFiles = app.state.changedFiles;

    //         let htmlFile = _.find(tree.tree, function(file) {
    //           return _.lowerCase(file.path) === _.lowerCase('docs/' + htmlFileName);
    //         });

    //         if(!htmlFile) {
    //           // Create a new HTML file
    //           htmlFile = {
    //             name: htmlFileName,
    //             nodes: [],
    //             path: 'docs/' + htmlFileName,
    //             added: true,
    //             modified: false,
    //             originalContent: '',
    //             newContent: liveHtml,
    //             sha: null,
    //             size: liveHtml.length,
    //             url: null,
    //             type: 'blob',
    //             mode: '100644'
    //           };

    //           // Push the file into tree
    //           tree.tree.push(htmlFile);

    //           // Push the file into recursiveTree
    //           let folders = htmlFile.path.split('/');
    //           self._addFileToRecursiveTree(recursiveTree, htmlFile, folders);
    //           // console.info('see if tree has the new html file', recursiveTree);

    //           // Push the file into addedFiles
    //           addedFiles.push(htmlFile);
    //         }
    //         else {
    //           // Update the existing HTML file
    //           //   in tree and recursiveTree
    //           htmlFile.newContent = liveHtml;
    //           htmlFile.size = liveHtml.length;
    //           htmlFile.modified = true;
              
    //           let treeIndex = _.findIndex(tree.tree, function(file) {
    //             return file.path === htmlFile.path;
    //           });
    //           tree.tree[treeIndex] = htmlFile;
    //           // Note: Seems that recursiveTree doesn't have to be manually updated
    //           //   since it already has the reference to htmlFile.
    //           // let folders = htmlFile.path.split('/');
    //           // self._updateFileInRecursiveTree(recursiveTree, htmlFile, folders);
    //           // console.info('see if tree has the updated html file', recursiveTree);
              
    //           // Push the file into changedFiles
    //           if(htmlFile.originalContent != htmlFile.newContent) {
    //             // This file has been modified.
    //             //   CURRENTLY NOT USING file.modified = true;
    //             if(!_.find(changedFiles, { path: htmlFile.path })) {
    //               changedFiles.push(htmlFile);
    //             }
    //           }
    //           else {
    //             changedFiles = _.remove(changedFiles, function(file) {
    //               return file.path != htmlFile.path;
    //             });
    //           }

    //           // Update editor if the HTML file is opened
    //           let htmlFileIndex = _.findIndex(filesOpened, function(file) {
    //             return file.path == htmlFile.path;
    //           });

    //           if(htmlFileIndex >= 0) {
    //             filesOpened[htmlFileIndex] = htmlFile;
    //           }

    //           // TODO: Refresh CodeMirror elements
    //           // TODO
    //           console.info($('#cm-' + htmlFile.path.replace('/', '--')));

    //         }

    //         // Update the states
    //         self.setState({
    //           recursiveTree: recursiveTree,
    //           tree: tree,
    //           filesOpened: filesOpened
    //         }, function() {
    //           app.setState({
    //             recursiveTree: recursiveTree,
    //             tree: tree,
    //             addedFiles: addedFiles,
    //             changedFiles: changedFiles,
    //             filesOpened: filesOpened
    //           });
    //         });
    //       }

    //       // If the response has yaml structure
    //       if('yaml' in response) {
    //         liveYaml = response.yaml;
    //       }

    //       app.setState({
    //         liveHtml: liveHtml,
    //         liveYaml: liveYaml,
    //         liveBugs: []
    //       });
    //     }
    //   }
    // });
  }

  handleTabMouseOver(e) {
    let closeButton = $(e.target).children('span.close-tab');
    $(closeButton).removeClass('invisible');
  }

  handleTabMouseOut(e) {
    let closeButton = $(e.target).children('span.close-tab');
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
    let self = this;
    let app = this.props.app;

    // TODO: manually hide all the tab pane first
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
      let data = self._prepareRenderingReq(content, file);
      self._requestRendering(data);
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
            <span
              style={{paddingTop:2, paddingRight:0, paddingLeft:8}}
              onClick={this.handleTabCloseClick.bind(this, item)}
              className="btn btn-link close-tab invisible">
              <strong className="text-danger">&times;</strong>
            </span>
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
          <AceEditor
            tabSize={2} mode="markdown" theme="github"
            onChange={this.handleEditorChange.bind(this, item)}
            value={item.newContent ? item.newContent : item.originalContent}
            name={"ace_" + idStr} enableBasicAutocompletion={false}
            enableSnippets={false} enableLiveAutocompletion={false}
            editorProps={{$blockScrolling: Infinity}} />
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
