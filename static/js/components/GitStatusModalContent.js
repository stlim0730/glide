// 
// GitStatusModalContent component
// 
class GitStatusModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //
    };

    this._reset = this._reset.bind(this);
  } 

  _reset() {
    // 
  }

  componentDidMount() {
    // 
  }

  componentWillReceiveProps(nextProps) {
    // 
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
          <h4 className="modal-title">Status of Your Workspace</h4>
        </div>
        
        <div className="modal-body">
          <label>
            On branch ###
          </label>
          <div className="row">
            Changes not staged for commit:
          </div>
          <div className="row">
            Untracked files:
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal"
            onClick={this._reset}>Close</button>
        </div>
      </div>
    );
  }
}

export default GitStatusModalContent;
