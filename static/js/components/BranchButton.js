// 
// BranchButton component
// 
class BranchButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      branches: [],
      branch: null
    };

    this.handleBranchClick = this.handleBranchClick.bind(this);
  }

  componentDidMount() {
    this.setState({
      branches: this.props.branches,
      branch: this.props.branch
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      branches: nextProps.branches,
      branch: nextProps.branch
    });
  }

  _slugify(str) {
    return str.toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
      .trim();
  }

  handleBranchClick(branch, e) {
    let app = this.props.app;
    this.setState({
      branch: branch
    }, function() {
      let self = this;
      app.setState({
        branch: branch,
        phase: app.state.constants.APP_PHASE_BRANCH_OPEN
      }, function() {
        // GET project branches
        let url = '/api/project/commits/' + this.state.project.slug + '/' + branch.name;
        // let self = this;
        let app = self.props.app;

        $.ajax({
          url: url,
          method: 'GET',
          // headers: { 'X-CSRFToken': window.glide.csrfToken },
          success: function(response) {
            console.info('BranchButton AJAX', response);
            if('error' in response) {
              // TODO
            }
            else {
              app.setState({
                commits: response
              });
            }
          }
        });
      });
    });
  }

  render () {
    return (
      <div className="btn-group" style={{marginTop: -5}}>
        <a href="#" className="btn btn-default btn-xs">
          {
            this.state.branch ? this.state.branch.name : 'Select a branch'
          }
        </a>
        <a href="#" className="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown"><span className="caret"></span></a>
        <ul className="dropdown-menu">
          {
            this.state.branches.map(function(item, index) {
              return (
                <li key={item.name}>
                  <a href="#" onClick={this.handleBranchClick.bind(this, item)}>{item.name}</a>
                </li>
              );
            }.bind(this))
          }
          <li className="divider"></li>
          <li><a href="#">Create a New Branch</a></li>
        </ul>
      </div>
    );
  }
}

export default BranchButton
