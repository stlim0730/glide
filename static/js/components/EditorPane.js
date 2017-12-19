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
      changedFiles: [],
      addedFiles: [],
      filesOpened: [],
      fileActive: null
    };

    this.handleRenderClick = this.handleRenderClick.bind(this);
  }

  handleRenderClick() {
    // POST request for Hexo initialization
    let url = '/api/project/generate';
    let self = this;

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
          //
        }
      }
    });
  }

  componentDidMount() {
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
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
              disabled={!this.state.fileActive}
              style={{paddingTop: 0, paddingBottom: 0, marginTop: 3}}
              className="btn btn-outline-success btn-sm inline-block float-right"
              onClick={this.handleRenderClick} type="button" >
              Render <i className="angle double right icon"></i>
            </button>
          </div>
          
          <TabbedEditors
            app={this.props.app}
            tree={this.props.tree}
            recursiveTree={this.props.recursiveTree}
            filesOpened={this.state.filesOpened}
            fileActive={this.state.fileActive} />
        </div>
      </div>
    );
  }
}

export default EditorPane;
