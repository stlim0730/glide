// 
// RendererPane component
// 
class RendererPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repository: null,
      branch: null,
      fileActive: null,
      srcDoc: null,
      src: null,
      editorChangesSaved: null,
      rendererUpdated: null
    };

    this.renderFile = this.renderFile.bind(this);
  }

  renderFile() {
    if(!this.state.fileActive) {
      this.setState({
        srcDoc: null,
        src: null
      });
    }
    else {
      let url = '/api/project/file/render';
      let self = this;
      let app = this.props.app;
      $.ajax({
        url: url,
        method: 'POST',
        headers: { 'X-CSRFToken': window.glide.csrfToken },
        dataType: 'json',
        data: JSON.stringify({
          file: this.state.fileActive
        }),
        contentType: 'application/json; charset=utf-8',
        success: function(response) {
          // console.debug(response);
          if('error' in response) {
            // TODO
          }
          else {
            // Set state for changed files
            let src = null;
            if(self.state.fileActive.path.endsWith('html') ||
              self.state.fileActive.path.endsWith('htm')) {
              src =
              window.location.protocol + '//' +
              window.location.host + '/media/repos/'
              + self.state.repository.full_name + '/'
              + self.state.branch.name + '/'
              + window.glide.username.split('@')[0] + '/'
              + self.state.fileActive.path;
            }

            self.setState({
              srcDoc: response.srcDoc,
              src: src
            }, function() {
              if(src && !self.state.rendererUpdated) {
                // Only to update iframe with existing src
                self.srcIFrame.contentWindow.location.reload();
                app.setState({
                  rendererUpdated: true
                });
              }
            });
          }
        }
      });
    }
  }

  componentDidMount() {
    let self = this;
    this.setState({
      repository: this.props.repository,
      branch: this.props.branch,
      fileActive: this.props.fileActive,
      editorChangesSaved: this.props.editorChangesSaved,
      rendererUpdated: this.props.rendererUpdated
    }, function() {
      self.renderFile();
    });
  }

  componentWillReceiveProps(nextProps) {
    let self = this;
    this.setState({
      repository: nextProps.repository,
      branch: nextProps.branch,
      fileActive: nextProps.fileActive,
      editorChangesSaved: nextProps.editorChangesSaved,
      rendererUpdated: nextProps.rendererUpdated
    }, function() {
      self.renderFile();
    });
  }

  render () {
    // TODO: Set a placeholder for nothing to render
    let srcDoc = this.state.srcDoc;
    let src = this.state.src;

    return (
      <div className="card" style={{height: '50vh'}}>
        <div className="card-header" style={{paddingTop: 6, paddingBottom: 6}}>
          <h6 className="inline-block" style={{marginTop:6, marginBottom: 0}}>
            Preview&emsp;{this.state.editorChangesSaved != null ? (!this.state.editorChangesSaved ? <img src="/static/img/spinner.gif" /> : null) : null}
          </h6>
          <a href={src ? src : "#"} target="_blank"
            className={src ? "btn btn-link inline-block" : "btn btn-link inline-block disabled"}
            style={{float: 'right', paddingTop: 3, paddingBottom: 3, textDecoration: 'none'}}>
            <i className="external alternate icon"></i> Preview in New Tab
          </a>
        </div>
        {
          srcDoc &&
          <iframe
            className="auto-scroll panel-body" style={{border:'none', height: '90vh'}}
            srcDoc={srcDoc} width="100%" sandbox="allow-scripts">
          </iframe>
        }
        {
          srcDoc == null &&
          src &&
          <iframe
            ref={(c) => this.srcIFrame = c}
            className="auto-scroll panel-body" style={{border:'none', height: '90vh'}}
            src={src} width="100%" sandbox="allow-scripts allow-same-origin">
          </iframe>
        }
      </div>
    );
  }
}

export default RendererPane;
