// 
// CreateProjectModalContent component
// 
class CreateProjectModalContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      githubUrl: '',
      themeSelected: false
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({
      githubUrl: e.target.value.toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
        .trim()
    });
  }

  render() {
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
                <label htmlFor="project-title" className="col-md-2 col-md-offset-1 control-label">Project Title</label>
                <div className="col-md-7">
                  <input type="text" onChange={this.handleChange} className="form-control" maxLength="20"/>
                </div>
              </div>

              <div className="form-group">
                <div className="col-md-7 col-md-offset-3">
                  <span className="help-block">Your project repository will be:
                    <br />
                    <span className="text-primary">
                      {this.state.githubUrl}
                    </span>
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="project-description" className="col-md-2 col-md-offset-1 control-label">Description</label>
                <div className="col-md-7">
                  <input type="text" className="form-control" maxLength="100" placeholder="Optional" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="" className="col-md-2 col-md-offset-1 control-label">
                  Select a Theme
                </label><br/>
                <div className="col-md-9 col-md-offset-3">
                  Here goes the theme list.
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
          <button type="submit" className="btn btn-primary" data-dismiss="modal" disabled={!this.state.themeSelected || this.state.githubUrl==''}>Submit</button>
        </div>
      </div>
    );
  }
}

export default CreateProjectModalContent;

// {% for theme in themes %}
//   <div className="radio col-md-3">
//     <label>
//       <input type="radio" name="theme" value="{{ theme.slug }}" />
//       {{ theme.name }}
//     </label>
//   </div>

//   {% if forloop.counter|divisibleby:3 %}
//     <div className="col-md-3"></div>
//   {% endif %}
// {% endfor %}
