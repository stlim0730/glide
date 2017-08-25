// 
// CreateNewFileModalContent component
// 
class CreateNewFileModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      path: '',
      fileName: ''
    };

    this._reset = this._reset.bind(this);
    this._validateFileName = this._validateFileName.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  _reset() {
    this.setState({
      path: '',
      fileName: ''
    });

    this.fileNameInput.value = '';
  }

  _validateFileName(fileName) {
    // TODO: validate the file name
    // For now, just return true if not empty
    if(fileName.length > 0) {
      return true;
    }
  }

  handleFileNameChange(e) {
    let fileName = e.target.value.trim();

    if(this._validateFileName(fileName)) {
      this.setState({
        fileName: fileName
      });
    }
    else {
      this.setState({
        fileName: ''
      });
    }
  }

  handleSubmit() {

  }

  componentDidMount() {
    this.setState({
      path: this.props.path,
      fileName: this.props.fileName
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      path: nextProps.path,
      fileName: nextProps.fileName
    });
  }

  render() {
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button"
            className="close"
            data-dismiss="modal">
            &times;
          </button>
          <h4 className="modal-title">Create a New File or Folder</h4>
        </div>
        
        <div className="modal-body">
          <div className="row">
            <fieldset>
              <div className="form-group">
                <label className="col-md-3 control-label text-right">
                  Path
                </label>
                <div className="col-md-7">
                  <input
                    type="text"
                    className="form-control pathInput"
                    maxLength="255"
                    disabled />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 col-md-offset-1 control-label">
                  File Name
                </label>
                <div className="col-md-7">
                  <input
                    type="text"
                    onChange={this.handleFileNameChange}
                    ref={(c) => this.fileNameInput = c}
                    className="form-control"
                    maxLength="255" />
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal"
            onClick={this._reset}>Close</button>
          <button
            className="btn btn-primary"
            onClick={this.handleSubmit}
            data-dismiss="modal"
            disabled={this.state.fileName==''}
            type="submit">
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default CreateNewFileModalContent;
