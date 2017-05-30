// 
// NavBar component
// 
class NavBar extends React.Component {
  render () {
    return (
      <div className="navbar navbar-inverse navbar-fixed-top">
        <form>
          <div className="container">
            <div className="navbar-header">
              <a href="../" className="navbar-brand">Glide</a>
              <button className="navbar-toggle" type="button" data-toggle="collapse" data-target="#navbar-main">
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
            </div>
  
            <div className="navbar-collapse collapse" id="navbar-main">
              <ul className="nav navbar-nav">
                <li className="dropdown">
                  <a className="dropdown-toggle" data-toggle="dropdown" href="#" id="themes" aria-expanded="false">Projects <span className="caret"></span></a>
                  <ul className="dropdown-menu">
                    <li>
                      <a href="#" data-toggle="modal" data-target="#project-browser-modal" className="project-browser">
                        Browse Projects...
                      </a>
                    </li>
                    <li>
                      <a href="#" data-toggle="modal" data-target="#create-project-modal">
                        Create New...
                      </a>
                    </li>
                    <li>
                      <a href="#">Close</a>
                    </li>
                    <li className="divider"></li>
                    <li>
                      <a href="#">My Recent Project</a>
                    </li>
                  </ul>
                </li>
                <li className="dropdown">
                  <a className="dropdown-toggle" data-toggle="dropdown" href="#" aria-expanded="false">Templates <span className="caret"></span></a>
                  <ul className="dropdown-menu">
                    <li><a href="#">Browse Templates...</a></li>
                    <li className="divider"></li>
                    <li><a href="#">Flatly</a></li>
                    <li><a href="#">Journal</a></li>
                    <li><a href="#">Lumen</a></li>
                    <li><a href="#">Paper</a></li>
                    <li><a href="#">Readable</a></li>
                    <li><a href="#">Sandstone</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default NavBar
