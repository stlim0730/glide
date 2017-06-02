// 
// BrowseProjectsModalContent component
// 
class BrowseProjectsModalContent extends React.Component {
  constructor(props) {
    super(props);
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

// {% for project in projects %}
//   <div className="col-md-3 project-icon-wrapper">
//     <a href="/workspace/open/{{ project.slug }}">
//       <span>{{ project.title }}</span>
//     </a><br/>
//     <span className="text-muted">{{ project.createdAt }}</span>
//   </div>
// {% endfor %}
