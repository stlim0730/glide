// 
// Modal component
// 
class Modal extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {

    return (
      <div id={this.props.id} className="modal fade" tabIndex="-1">
        <div className={"modal-dialog" + (this.props.large ? " modal-lg" : "")}>
          {this.props.modalContent}
        </div>
      </div>
    );
  }
}

export default Modal;
