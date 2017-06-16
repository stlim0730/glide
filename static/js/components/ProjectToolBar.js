import BranchButton from './BranchButton.js';

// 
// ProjectToolBar component
// 
class ProjectToolBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      project: this.props.project,
      branches: [],
      branch: null
    };

    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  componentDidMount() {
    // GET project branches
    let url = '/api/project/branches/' + this.state.project.slug;
    let self = this;
    let app = self.props.app;

    $.ajax({
      url: url,
      method: 'GET',
      // headers: { 'X-CSRFToken': window.glide.csrfToken },
      success: function(response) {
        // console.info('ProjectToolBar AJAX', response);
        if('error' in response) {
          // TODO
        }
        else {
          self.setState({
            branches: response
          }, function() {
            app.setState({
              branches: response
            });
          });
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      project: nextProps.project,
      branch: nextProps.branch,
      // Don't update branches: it comes from the server
    });
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
    console.info('ProjectToolBar', this.state);
    return (
      <div className="overflow-hidden" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        <label className="h5">&emsp;{this.state.project.title}&emsp;</label>
        <BranchButton app={this.props.app} branches={this.state.branches} branch={this.state.branch} />
      </div>
    );
  }
}

export default ProjectToolBar


// <small className="hidden">
//   <span className="glyphicon glyphicon-cog" aria-hidden="true"></span> Configure project...&emsp;
//   <span className="glyphicon glyphicon-new-window" aria-hidden="true"></span> Open in a new window
// </small>
