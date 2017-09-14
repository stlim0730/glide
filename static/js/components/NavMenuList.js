import NavMenuListItem from './NavMenuListItem';

// 
// NavMenuList component
// 
class NavMenuList extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    let children = this.props.children.map(function(menuListItem, index) {
      return <NavMenuListItem key={'menuListItem_' + index} label={menuListItem.label} dataTarget={menuListItem.targetModal} disabled={menuListItem.disabled} />;
    });

    return (
      <li className="dropdown">
        <a className="dropdown-toggle" data-toggle="dropdown" href="#" aria-expanded="false">
          {this.props.label} <span className="caret"></span>
        </a>
        
        <ul className="dropdown-menu">
          {children}
        </ul>

      </li>
    );
  }
}

export default NavMenuList
