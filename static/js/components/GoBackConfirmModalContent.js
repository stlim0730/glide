// 
// GoBackConfirmModalContent component
// 
class GoBackConfirmModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      targetPhase: null
    };

    this.swtichPhase = this.swtichPhase.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  swtichPhase() {
    // let self = this;
    let app = this.props.app;

    // Switch to the targetPhase
    app.setState({
      phase: this.state.targetPhase
    });
  }

  handleConfirm() {
    this.swtichPhase();
  }

  componentDidMount() {
    this.setState({
      targetPhase: this.props.targetPhase
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      targetPhase: nextProps.targetPhase
    });
  }

  render() {
    return (
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            Confirm
          </h5>
          <button
            type="button" className="close" data-dismiss="modal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        
        <div className="modal-body">
<<<<<<< HEAD
          <p className="lead">You will <strong className="text-danger">lose all the changes</strong> in the code that are not pushed to GitHub.</p>
          <p className="lead">Are you sure you want to go back?</p>
=======
          <p>You will <strong className="text-danger">lose all the changes</strong> in the code that are not pushed to GitHub.</p>
          <p>Are you sure you want to go back?</p>
>>>>>>> 3e3acdf57b40ad5d131bfda36a352772015cb894
        </div>
        
        <div className="modal-footer">
          <button
            type="button" className="btn btn-secondary"
            data-dismiss="modal">
            No
          </button>
          <button
            type="button" ref={(c) => this.confirmButton = c}
            className="btn btn-primary" onClick={this.handleConfirm}
            data-dismiss="modal">
            Yes
          </button>
        </div>
      </div>
    );
  }
}

export default GoBackConfirmModalContent;
