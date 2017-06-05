// import FileListGroup from './FileListGroup.js';

// 
// FileSideBar component
// 
class FileSideBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      constants: {
        TYPE_VIEW: 'type',
        FOLDER_VIEW: 'path'
      },
      groupBy: 'path',
      files: [],
      project: this.props.project
    };

    this._loadTree = this._loadTree.bind(this);
  }

  _loadTree(project) {
    // GET project tree
    let url = '/api/project/tree/' + project;
    let self = this;
    $.ajax({
      url: url,
      method: 'GET',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      success: function(response) {
        console.info(response);
        if('error' in response) {
          //
        }
        else {
          self.setState({
            files: _.concat(response.repoTree.tree, response.themeTree.tree),
            project: project
          });
        }
      }
    });
  }

  componentDidMount() {
    this._loadTree(this.state.project);
  }

  componentWillReceiveProps(nextProps) {
    // console.info('FileSideBar is changing to', nextProps);
    this._loadTree(nextProps.project);
  }

  render () {
    return (
      <div>
        <label className="h5">Files in {this.state.project}</label>
        {
          this.state.groupBy == 'type'
          ?
          (
            <div className="full-height y-scroll">
              <FileListGroup label="Glide Data" default={true} />
              <FileListGroup label="Template HTML" default={false} />
              <FileListGroup label="Template CSS" default={false} />
            </div>
          )
          :
          (
            <div className="full-height y-scroll">
              {
                this.state.files.map(function(item, index) {
                  return (
                    <div key={index}>{item.path}</div>
                  );
                })
              }
            </div>
          )
        }
      </div>
    );
  }
}

export default FileSideBar

// {% include "partials/file_list_group.html" with list_group_name="Glide Data" default=True tree=repoTree editor="data" %}
// {% include "partials/file_list_group.html" with list_group_name="Template HTML" default=False tree=themeTree editor="html" %}
// {% include "partials/file_list_group.html" with list_group_name="Template CSS" default=False tree=themeTree editor="css" %}

// <div className="btn-toolbar">
//   <div className="btn-group">
//     <a href="#" className={("btn btn-default" + this.state.groupBy=="type" ? " active" : "")}>
//       <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
//     </a>
//     <a href="#" className={("btn btn-default" + this.state.groupBy=="folder" ? " active" : "")}>
//       <span className="glyphicon glyphicon-folder-open" aria-hidden="true"></span>
//     </a>
//   </div>
// </div>
