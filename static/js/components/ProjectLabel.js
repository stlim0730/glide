// 
// ProjectLabel component
// 
class ProjectLabel extends React.Component {
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
    this.refs.configIcon.className = "glyphicon glyphicon-cog";
  }

  handleMouseLeave(e) {
    this.refs.configIcon.className = "glyphicon glyphicon-cog hidden";
  }

  render () {
    return (
      <div className="overflow-hidden h5" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <label>&emsp;{this.state.project.title}&emsp;</label>
        <small>
          <span ref="configIcon" className="glyphicon glyphicon-cog hidden" aria-hidden="true"></span>
        </small>
      </div>
    );
  }
}

export default ProjectLabel
