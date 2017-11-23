import NavMenuListItem from './NavMenuListItem';

// 
// NavMenuList component
// 
class NavMenuList extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    let children = this.props.children.map(function(item, index) {
      return <NavMenuListItem key={index} label={item.label} dataTarget={item.targetModal} disabled={item.disabled} />;
    });

    return (
      <li className="nav-item dropdown">
        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {this.props.label} <span className="caret"></span>
        </a>

        <div className="dropdown-menu">
          {children}
        </div>
      </li>
    );
  }
}

export default NavMenuList;
