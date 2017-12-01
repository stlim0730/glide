// 
// NavMenuList component
// 
class NavMenuListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    let className = this.props.disabled
      ? "dropdown-item disabled"
      : "dropdown-item";

    return (
      <a
        className={className} href="#"
        data-toggle="modal" data-target={this.props.dataTarget}>
        {this.props.label}
      </a>
    );
  }
}

export default NavMenuListItem;
