// 
// NavMenuList component
// 
class NavMenuListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <li>
        <a href="#" disabled={this.props.disabled} data-toggle="modal" data-target={this.props.dataTarget}>
          {this.props.label}
        </a>
      </li>
    );
  }
}

export default NavMenuListItem
