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
  }

  componentDidMount() {
    this.setState({
      activePhase: this.props.activePhase,
      label: this.props.label,
      disabled: this.props.phase > this.state.activePhase ? true: false
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      activePhase: nextProps.activePhase,
      label: nextProps.label,
      disabled: nextProps.phase > nextProps.activePhase ? true: false
    });
  }

  render() {
    let active = this.props.phase == this.state.activePhase ? 'active' : '';
    // let disabled = this.props.phase > this.state.activePhase ? 'disabled': '';
    let className = active + ' ' + (this.state.disabled ? 'disabled' : '');

    return (
      <li>
        <a href="#" className={className}>
          <span>{this.props.label}</span>
        </a>
      </li>
    );
  }
}

export default NavBreadCrumbListItem;

// Parent:

// register(name) {
//   console.log(name);
// }


// render() {
//   return(
//     <RegisterLookup onRegister={this.register} />
//   );
// }
// Modal:

// nameChange = (e) => {
//   this.setState({name: e.target.value});
// }

// reg = () => {
//   this.props.register(this.state.name);
// }

// render() {
//   return(
//     <Modal>
//       Enter your name: <Input onChange={this.nameChange} />
//       <Button onClick={this.reg}>Register</Button>
//     </Modal>
//   );
// }
