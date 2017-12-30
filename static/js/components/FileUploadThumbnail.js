// 
// FileUploadThumbnail component
// 
class FileUploadThumbnail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      file: null,
      error: null,
      parent: null
    };

    this.handleUploadFileMouseOver = this.handleUploadFileMouseOver.bind(this);
    this.handleUploadFileMouseOut = this.handleUploadFileMouseOut.bind(this);
    this.handleUploadFileRemove = this.handleUploadFileRemove.bind(this);
  }

  handleUploadFileMouseOver(e) {
    e.stopPropagation();
    $(e.target).children('button.invisible').removeClass('invisible');
  }

  handleUploadFileMouseOut(e) {
    e.stopPropagation();
    $(e.target).children('button').addClass('invisible');
  }

  handleUploadFileRemove(e) {
    e.stopPropagation();

    let parent = this.state.parent;
    let self = this;

    if(!this.state.error) {
      let filesToUpload = parent.state.filesToUpload;
      _.remove(filesToUpload, function(f) {
        return self.state.file.id == f.id;
      });
      parent.setState({
        filesToUpload: filesToUpload
      });
    }
    else {
      let filesFailedToUpload = parent.state.filesFailedToUpload;
      _.remove(filesFailedToUpload, function(f) {
        return self.state.file.id == f.id;
      });
      parent.setState({
        filesFailedToUpload: filesFailedToUpload
      });
    }
  }

  componentDidMount() {
    this.setState({
      file: this.props.file,
      error: this.props.error,
      parent: this.props.CreateFileModalContent
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      file: nextProps.file,
      error: nextProps.error,
      parent: nextProps.CreateFileModalContent
    });
  }

  render () {
    if(!this.state.file) {
      return null;
    }
    else {
      return (
        <li
          onMouseEnter={this.handleUploadFileMouseOver}
          onMouseLeave={this.handleUploadFileMouseOut}
          className="list-group-item d-flex justify-content-between align-items-center">
          
          {
            !this.state.error && 
            this.state.file.preview.type === 'image' &&
            this.state.file.preview.url ?
            <img
              src={this.state.file.preview.url}
              className="upload-image-thumbnail" /> :
            (
              this.state.error ?
              <i className="huge ban icon"></i> :
              <i className="huge file text outline icon"></i>
            )
          }

          <span>
            &emsp;{
              this.state.error ?
              <s>{this.state.file.name}</s> :
              this.state.file.name
            }
          </span>
          <span className="text-muted">
            &emsp;{
              _.round(this.state.file.size / (1024 * 1024), 2) > 0 ?
              _.round(this.state.file.size / (1024 * 1024), 2) + ' MB':
              _.round(this.state.file.size / 1024, 2) + ' KB'
            } 
          </span>
          <button type="button"
            className="btn btn-link invisible"
            onClick={this.handleUploadFileRemove}>
            <strong className="text-danger">&times;</strong>
          </button>
        </li>
      );
    }
  }
}

export default FileUploadThumbnail;
