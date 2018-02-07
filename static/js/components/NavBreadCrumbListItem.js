// 
// NavBreadCrumbListItem component
// 
class NavBreadCrumbListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activePhase: null,
      disabled: null
    };

    this.handleBreadCrumbClick = this.handleBreadCrumbClick.bind(this);
  }

  handleBreadCrumbClick(targetPhase, e) {
    let self = this;
    let activePhase = this.state.activePhase;
    let app = this.props.app;

    // TODO!!!
    // this.props.navbar.setState({
    //   targetPhase: targetPhase
    // }, function() {
    //   // If the phase transition doesn't need to be confirmed
    //   if(!(activePhase >= app.state.constants.APP_PHASE_COMMIT_OPEN &&
    //       targetPhase < app.state.constants.APP_PHASE_COMMIT_OPEN)) {
    //     // Switch to the targetPhase
    //     app.setState({
    //       phase: targetPhase
    //     });
    //   }
    //   else {
    //     // Do nothing: Confirmation modal will take the control
    //   }
    // });
  }

  componentDidMount() {
    this.setState({
      activePhase: this.props.activePhase,
      disabled: this.props.phase > this.state.activePhase ? true : false
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      activePhase: nextProps.activePhase,
      disabled: nextProps.phase > nextProps.activePhase ? true : false
      disabled: nextProps.phase > nextProps.activePhase ? true: false
    });
  }

  render() {
    let active = this.props.phase == this.state.activePhase ? 'active' : '';
    let className = active + ' ' + (this.state.disabled ? 'disabled' : '');

    return (
      <li>
        <a href="#" data-toggle="modal"
          data-target={this.props.confirmModalToLeave ? this.props.confirmModalToLeave : null}
          className={className} onClick={this.handleBreadCrumbClick.bind(this, this.props.phase)}>
          <span>{this.props.label}</span>
        </a>
      </li>
    );
  }
}

export default NavBreadCrumbListItem;
