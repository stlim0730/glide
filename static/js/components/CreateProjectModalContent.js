// 
// CreateProjectModalContent component
// 
class CreateProjectModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projectTitle: '',
      slug: '',
      repoUrl: '',
      description: '',
      themeSelected: null,
      themes: []
    };

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleDescChange = this.handleDescChange.bind(this);
    this.handleThemeClick = this.handleThemeClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    // GET all themes
    let url = '/api/theme';
    let self = this;
    $.ajax({
      url: url,
      success: function(response) {        
        self.setState({
          themes: response
        });
      }
    });
  }

  handleTitleChange(e) {
    this.state.projectTitle = e.target.value;
    this.state.slug = this.state.projectTitle.toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
      .trim();
    if(this.state.projectTitle.trim() != '') {
      let prefix = 'https://github.com/';
      let username = window.glide.username.split('@')[0];
      this.setState({
        repoUrl: (prefix + username + '/' + this.state.slug)
      });
    }
    else {
      this.setState({
        repoUrl: ''
      });
    }
  }

  handleDescChange(e) {
    this.state.description = e.target.value;
  }

  handleThemeClick(e) {
    this.setState({
      themeSelected: e.target.value
    });
  }

  reset() {
    this.setState({
      repoUrl: '',
      themeSelected: null
    });

    this.titleInput.value = '';
    this.descInput.value = '';
  }

  handleSubmit(e) {
    // POST new project info
    let url = '/api/project/create';
    let self = this;
    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        title: self.state.projectTitle,
        description: self.state.description,
        slug: self.state.slug,
        repoUrl: self.state.repoUrl,
        theme: self.state.themeSelected
      }),
      contentType: 'application/json; charset=utf-8',//'application/x-www-form-urlencoded',//,
      success: function(response) {
        console.info(response);
        if('error' in response) {

        }
        else {
          self.reset();
          let project = response.project;
          let projects = response.projects;
          let app = self.props.app;
          app.setState({
            phase: app.state.constants.APP_PHASE_OPEN,
            project: project,
            projects: projects
          });
        }
      }
    });
  }

  render() {
    // console.info('CreateProjectModalContent', this.state);
    return (
      <div className="modal-content">
        <div className="modal-header">
          <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
          <h4 className="modal-title">Create a New Project</h4>
        </div>
        
        <div className="modal-body">
          <div className="row">
            <fieldset>
              <div className="form-group">
                <label className="col-md-2 col-md-offset-1 control-label">Project Title</label>
                <div className="col-md-7">
                  <input type="text" ref={(c) => this.titleInput = c} onChange={this.handleTitleChange} className="form-control" maxLength="20"/>
                </div>
              </div>

              <div className="form-group">
                <div className="col-md-7 col-md-offset-3">
                  <span className="help-block">Your project repository will be:
                    <br />
                    <span className="text-primary">
                      {this.state.repoUrl}
                    </span>
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="col-md-2 col-md-offset-1 control-label">Description</label>
                <div className="col-md-7">
                  <input type="text" ref={(c) => this.descInput = c} onChange={this.handleDescChange} className="form-control" maxLength="100" placeholder="Optional" />
                </div>
              </div>

              <div className="form-group">
                <label className="col-md-2 col-md-offset-1 control-label">
                  Select a Theme
                </label>
                <div className="col-md-9">
                  {
                    this.state.themes.map(function(item, index) {
                      return (
                        <div key={item.slug} className="radio col-md-3">
                          <label>
                            <input type="radio" name="theme" value={item.slug}
                            onClick={this.handleThemeClick} checked={this.state.themeSelected === item.slug}/>
                            {item.name}
                          </label>
                        </div>
                      );
                    }.bind(this))
                  }
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.reset}>Close</button>
          <button type="submit" className="btn btn-primary" data-dismiss="modal"
            disabled={!this.state.themeSelected || this.state.repoUrl==''} onClick={this.handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default CreateProjectModalContent;
