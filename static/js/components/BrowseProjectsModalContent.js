// 
// BrowseProjectsModalContent component
// 
class BrowseProjectsModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: this.props.projects
    };

    this.handleProjectClick = this.handleProjectClick.bind(this)
  }

  componentDidMount() {
    // GET project tree
    let url = '/api/project/get';
    let self = this;
    let app = self.props.app;

    $.ajax({
      url: url,
      method: 'GET',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      success: function(response) {
        console.info(response);
        if('error' in response) {
          // TODO
        }
        else {
          self.setState({
            projects: response
          }, function() {
            app.setState({
              projects: response
            });
          });
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      projects: nextProps.projects
    });
  }

  handleProjectClick(project, e) {
    let app = this.props.app;
    app.setState({
      phase: app.state.constants.APP_PHASE_PROJECT_OPEN,
      project: project
    });
  }

  render() {
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 className="modal-title">Project Browser</h4>
        </div>
        <div className="modal-body">
          <div className="row">
            {
              this.state.projects.map(function(item, index) {
                return (
                  <div key={index} className="col-md-3 project-icon-wrapper">
                    <a href="#" onClick={this.handleProjectClick.bind(this, item)}>
                      <span>{item.title}</span>
                    </a><br/>
                    <span className="text-muted">{item.createdAt}</span>
                  </div>
                );
              }.bind(this))
            }
          </div>
          <div className="row">
            <div className="col-md-3 project-icon-wrapper">
              <a href="#" className="create-project" data-dismiss="modal" data-toggle="modal" data-target="#create-project-modal">Create New...</a>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
    );
  }
}

export default BrowseProjectsModalContent;
