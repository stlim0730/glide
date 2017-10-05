// import EditorToolBar from './EditorToolBar.js';

// 
// RepoListPane component
// 
class RepoListPane extends React.Component {
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
        console.info(response);
        if('error' in response) {
          //
        }
        else {
          self._reset();
          let repository = JSON.parse(response.repository);
          let app = self.props.app;
          app.setState({
            phase: app.state.constants.APP_PHASE_REPOSITORY_OPEN,
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
      <div className="full-height">

        <div className="full-height col-lg-3 col-md-3">
          
          <label>Select a Repository to Clone</label>
          <button
            type="button" className="btn btn-sm btn-link"
            data-container="body" data-toggle="popover"
            data-placement="bottom" data-original-title="" title=""
            data-content="If you don't see the repository you want to clone, request the repository owner to add you as a collaborator.">
            <span className="glyphicon glyphicon-info-sign"></span>
          </button>
          <button
            type="button" className="btn btn-sm btn-link"
            onClick={this.handleRefreshClick.bind(this)}>
            <span className="glyphicon glyphicon-refresh"></span> Refresh
          </button>

          <div className="text-right">
            Sort by: 
            <div className="btn-group">
              <button
                onClick={this.handleSortRepo.bind(this, 'date')}
                className="btn btn-sm btn-link">Date</button>
              <button
                onClick={this.handleSortRepo.bind(this, 'name')}
                className="btn btn-sm btn-link">Name</button>
              <button
                onClick={this.handleSortRepo.bind(this, 'owner')}
                className="btn btn-sm btn-link">Owner</button>
            </div>
          </div>

          <div className="height-95 auto-scroll list-group">
            {
              this.state.repositories.map(function(item, index) {
                return (
                  <button
                    key={index} type="button" className="list-group-item"
                    onClick={this.handleRepositoryClick.bind(this, item)}>
                    <h4 className="list-group-item-heading">{item.full_name}</h4>
                    <p className="list-group-item-text text-right">
                      Owned by {item.owner.login}<br />
                      Created at {new Date(item.created_at).toLocaleTimeString()} on {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </button>
                );
              }.bind(this))
            }
          </div>
        </div>

        <br />
        <br />
        <br />
        <div className="full-height col-lg-6 col-md-6">
          {
            this.state.liveHtml && 
            <div className="height-60 panel panel-default">
              <div className="panel-heading">
                README.md
              </div>
              <div
                className="auto-scroll height-90 panel-body"
                dangerouslySetInnerHTML={{__html: this.state.liveHtml}}>
              </div>
            </div>
          }
          {
            this.state.repository &&
            <div className="height-40">
              
              <div className="row">
                <label className="col-lg-3 control-label text-right">
                  Repository Name
                </label>
                <div className="col-lg-9">
                  <a
                    target="_blank"
                    href={this.state.repository.html_url}>
                    {this.state.repository.name}
                  </a>
                </div>
              </div>

              <div className="row">
                <label className="col-lg-3 control-label text-right">
                  Owner
                </label>
                <div className="col-lg-9">
                  <a
                    target="_blank"
                    href={this.state.repository.owner.html_url}>
                    {this.state.repository.owner.login}
                  </a>
                </div>
              </div>

              <div className="row">
                <label className="col-lg-3 control-label text-right">
                  Created At
                </label>
                <div className="col-lg-9">
                  {new Date(this.state.repository.created_at).toLocaleTimeString()} on {new Date(this.state.repository.created_at).toLocaleDateString()}
                </div>
              </div>

              {
                // <div className="row">
                //   <label className="col-lg-3 control-label text-right">
                //     Updated At
                //   </label>
                //   <div className="col-lg-9">
                //     {new Date(this.state.repository.updated_at).toLocaleTimeString()} on {new Date(this.state.repository.updated_at).toLocaleDateString()}
                //   </div>
                // </div>
              }

            </div>
          }
        </div>

        <div className="col-lg-3 col-md-3">
          {
            this.state.repository &&
            <div>
              <button
                onClick={this.handleCloneClick.bind(this)}
                className="btn btn-primary btn-lg btn-block">
                Clone {this.state.repository.name}
              </button>
              <a
                target="_blank" href={this.state.repository.html_url}
                className="btn btn-default btn-sm btn-block">
                <span className="glyphicon glyphicon-new-window"></span>&nbsp;
                Open on GitHub
              </a>
            </div>
          }
        </div>

      </div>
    );
  }
}

export default RepoListPane
