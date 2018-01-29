// 
// RendererPane component
// 
class RendererPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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
      fileActive: this.props.fileActive,
      isHexoPrj: this.props.isHexoPrj
    }, function() {
      self.renderFile();
    });
  }

  componentWillReceiveProps(nextProps) {
    let self = this;
    this.setState({
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

    return (
      <div className="height-50 card">
        <h6 className="card-header">Preview</h6>
        <iframe
          className="auto-scroll height-90 panel-body" style={{border:'none'}}
          srcDoc={ srcDoc ? srcDoc : null } width="100%" sandbox="allow-scripts">
        </iframe>
      </div>
    );
  }
}

export default RendererPane;
