// 
// RepositoryPane component
// 
class RepositoryPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      repositories: [],
      repository: null,
      liveHtml: null
    };

    this._reset = this._reset.bind(this);
    this._ajaxRepositories = this._ajaxRepositories.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
    this.handleSortRepo = this.handleSortRepo.bind(this);
    this.handleRepositoryClick = this.handleRepositoryClick.bind(this);
    this.handleCloneClick = this.handleCloneClick.bind(this);
  }

  _reset() {
    this.setState({
      repositories: [],
      repository: null,
      liveHtml: null
    });
  }
  
  _ajaxRepositories() {
    // GET project branches
    let url = '/api/project/repositories';
    let self = this;
    let app = self.props.app;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        if('error' in response) {
          // TODO
        }
        else {
          let repositories = JSON.parse(response.repositories);
          self.setState({
            repositories: repositories,
            repository: null
          });
        }
      }
    });
  }

  handleRefreshClick() {
    let self = this;

    this.setState({
      repositories: [],
      repository: null,
      liveHtml: null
    }, function() {
      self._ajaxRepositories();
    });
  }

  handleSortRepo(sortBy) {
    let sortedRepositories;
    switch(sortBy) {
      case 'date':
        sortedRepositories = _.sortBy(
          this.state.repositories,
          ['created_at', 'name', 'owner.login']
        ).reverse();
        break;
      case 'name':
        sortedRepositories = _.sortBy(
          this.state.repositories,
          ['name', 'created_at', 'owner.login']
        );
        break;
      case 'owner':
        sortedRepositories = _.sortBy(
          this.state.repositories,
          ['owner.login', 'name', 'created_at']
        );
        break;
    }

    this.setState({
      repositories: sortedRepositories
    });
  }

  handleRepositoryClick(repository) {

    // GET repository url to clone from
    let owner = repository.owner.login;
    let repo = repository.name;
    let url = '/api/project/readme/' + owner + '/' + repo;
    let self = this;

    $.ajax({
      url: url,
      method: 'GET',
      success: function(response) {
        if('error' in response) {
          if(response.error == 'HTTPError') {
            self.setState({
              repository: repository,
              liveHtml: 'Can\'t find README.md in this repository.'
            });
          }
          else if(response.error == 'decoding') {
            self.setState({
              repository: repository,
              liveHtml: 'Can\'t decode README.md.'
            });
          }
        }
        else {
          let readme = response.readme;
          self.setState({
            repository: repository,
            liveHtml: readme
          });
        }
      }
    });
  }

  handleCloneClick() {
    // POST repository url to clone from
    let url = '/api/project/clone';
    // let suffix = this.state.repoUrl.replace(prefix, '');
    let owner = this.state.repository.owner.login;//suffix.split('/')[0];
    let repo = this.state.repository.name;//suffix.split('/')[1].replace('.git', '');
    let repoUrl = this.state.repository.html_url;
    let self = this;
    $.ajax({
      url: url,
      method: 'POST',
      headers: { 'X-CSRFToken': window.glide.csrfToken },
      dataType: 'json',
      data: JSON.stringify({
        repoUrl: repoUrl,
        owner: owner,
        repo: repo
      }),
      contentType: 'application/json; charset=utf-8',
      success: function(response) {
        // console.info(response);
        if('error' in response) {
          // TODO
        }
        else {
          self._reset();
          let repository = JSON.parse(response.repository);
          let app = self.props.app;
          app.setState({
            // phase: app.state.constants.APP_PHASE_REPOSITORY_OPEN,
            phase: app.state.constants.APP_PHASE_BRANCH_SELECTION,
            repository: repository,
            branches: [],
            branch: null,
            commits: [],
            commit: null
          });
        }
      }
    });
  }

  componentDidMount() {
    this._ajaxRepositories();
  }

  render () {
    return (
      <div className="container">

        <div className="row">
          <div className="col">
            <div className="h1">
              Select a Repository to Clone
              <button
                type="button" className="btn btn-lg btn-link" data-placement="bottom"
                title="" data-container="body" data-toggle="popover"
                data-original-title="Don't you see your repository?"
                data-content="If you don't, request the repository owner to add you as a collaborator.">
                <i className="info circle icon"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div style={{marginLeft: -12}}
            className="col-lg-1 col-md-1">
            <button
              type="button" className="btn btn-link"
              onClick={this.handleRefreshClick.bind(this)}>
              <i className="refresh icon"></i> Refresh
            </button>
          </div>

          <div className="col offset-lg-1 offset-md-1">
            Sort by:
            <button
              onClick={this.handleSortRepo.bind(this, 'date')}
              className="btn btn-link">Date</button>
            <button
              onClick={this.handleSortRepo.bind(this, 'name')}
              className="btn btn-link">Name</button>
            <button
              onClick={this.handleSortRepo.bind(this, 'owner')}
              className="btn btn-link">Owner</button>
          </div>
        </div>

        <div className="row">

          <div className="col-lg-5 col-md-5">

            <div className="list-group height-600 auto-scroll margin-top-15">
              {
                this.state.repositories.map(function(item, index) {
                  let className = this.state.repository && this.state.repository.full_name==item.full_name
                    ? 'list-group-item active'
                    : 'list-group-item';
                  return (
                    <a
                      key={index} href="#" className={className}
                      onClick={this.handleRepositoryClick.bind(this, item)}>
                      <h5 className="list-group-item-heading">
                        {item.full_name}
                      </h5>
                    </a>
                  );
                }.bind(this))
              }
            </div>
          </div>

          <div className="col-lg-7 col-md-7">
            {
              this.state.repository &&
              <div>
                <p className="h3">
                  <span className="text-muted">Repository Name</span>&emsp;
                  <a
                    target="_blank"
                    href={this.state.repository.html_url}>
                    {this.state.repository.name}
                  </a>
                </p>
                <p className="h3">
                  <span className="text-muted">Owner</span>&emsp;
                  <a
                    target="_blank"
                    href={this.state.repository.owner.html_url}>
                    {this.state.repository.owner.login}
                  </a>
                </p>
                <p className="h3">
                  <span className="text-muted">Created At</span>&emsp;
                  <small>
                    {
                      new Date(this.state.repository.created_at).toLocaleTimeString()
                    }
                    <span className="text-muted">&nbsp;On&nbsp;</span>
                    {
                      new Date(this.state.repository.created_at).toLocaleDateString()
                    }
                  </small>
                </p>
              </div>
            }

            {
              this.state.liveHtml &&
              <div className="card height-400 margin-top-15">
                <h5 className="card-header">README.md</h5>
                <div className="card-body max-height-400 auto-scroll">
                  <div
                    className=""
                    dangerouslySetInnerHTML={{__html: this.state.liveHtml}}>
                  </div>
                </div>                
              </div>
            }

            {
              this.state.repository &&
              <div className="margin-top-15">
                <button
                  type="button" className="btn btn-success btn-lg btn-block"
                  onClick={this.handleCloneClick.bind(this)}>
                  Clone {this.state.repository.name}
                </button>
                <a
                  target="_blank" href={this.state.repository.html_url}
                  className="btn btn-outline-success btn-sm btn-block">
                  <i className="external icon"></i>&nbsp;
                  Open Repository on GitHub
                </a>
              </div>
            }

          </div>

        </div>

      </div>
    );
  }
}

export default RepositoryPane;
