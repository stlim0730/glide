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
      isHexoPrj: null,
      srcDoc: null
    };

    this.renderFile = this.renderFile.bind(this);
  }

  renderFile() {
    if(!this.state.fileActive) {
      this.setState({
        srcDoc: null
      });
    }
    else {
      let url = '/api/project/file/render';
      let self = this;
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
            self.setState({
              srcDoc: response.srcDoc
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
      isHexoPrj: this.props.isHexoPrj
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
      isHexoPrj: nextProps.isHexoPrj
    }, function() {
      self.renderFile();
    });
  }

  render () {
    // TODO: Set a placeholder for nothing to render
    // TODO: Set a placeholder for loading
    let srcDoc = this.state.srcDoc;
    let hexoPrjUrl = null;
    if(this.state.repository && this.state.branch) {
      hexoPrjUrl= '/media/hexo/' + this.state.repository.full_name + '/'
        + this.state.branch.name + '/' + window.glide.username.split('@')[0] + '/docs/index.html';
    }
    console.info(hexoPrjUrl);

    return (
      <div className="height-50 card">
        <h6 className="card-header">Preview</h6>
        {
          !this.state.isHexoPrj ?
          <iframe
            className="auto-scroll height-90 panel-body" style={{border:'none'}}
            srcDoc={ srcDoc ? srcDoc : null } width="100%" sandbox="allow-scripts">
          </iframe>
          :
          <iframe
            className="auto-scroll height-90 panel-body" style={{border:'none'}}
            src={hexoPrjUrl} width="100%" sandbox="allow-scripts">
          </iframe>
        }
      </div>
    );
  }
}

export default RendererPane;
