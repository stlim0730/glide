// 
// ProjectToolBar component
// 
class ProjectToolBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      project: this.props.project
    };

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  componentDidMount() {
    
  }

  componentWillReceiveProps(nextProps) {
    
  }

  handleMouseEnter(e) {
    // this.refs.configIcon.className = "glyphicon glyphicon-cog";
    // let commands = e.target.getElementsByClassName('project-level-commands');
    $(e.target).children('small').removeClass('hidden');
  }

  handleMouseLeave(e) {
    // this.refs.configIcon.className = "glyphicon glyphicon-cog hidden";
    $(e.target).children('small').addClass('hidden');
  }

  render () {
    // TODO: Make all the icons into components!
    return (
      <div className="overflow-hidden h5" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <label>&emsp;{this.state.project.title}&emsp;</label>
        <small className="hidden">
          <span className="glyphicon glyphicon-cog" aria-hidden="true"></span> Configure project...&emsp;
          <span className="glyphicon glyphicon-new-window" aria-hidden="true"></span> Open in a new window
        </small>
      </div>
    );
  }
}

export default ProjectToolBar
