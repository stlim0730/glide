// 
// CommitButton component
// 
class CommitButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      commits: [],
      commit: null
    };

    this.handleCommitClick = this.handleCommitClick.bind(this);
  }

  componentDidMount() {
    this.setState({
      commits: this.props.commits,
      commit: this.props.commit
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      commits: nextProps.commits,
      commit: nextProps.commit
    });
  }

  handleCommitClick(commit, e) {
    let app = this.props.app;
    this.setState({
      commit: commit
    }, app.setState({
      commit: commit,
      phase: app.state.constants.APP_PHASE_COMMIT_OPEN
    }));
  }

  render () {
    if(this.state.commits.length == 0) {
      return null;
    }
    else {
      return (
        <div className="btn-group" style={{marginTop: -5, marginLeft: 10}}>
          <a href="#" className="btn btn-default btn-xs">
            {
              this.state.commit ? this.state.commit.commit.message : 'Select a commit'
            }
          </a>
          <a href="#" className="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown"><span className="caret"></span></a>
          <ul className="dropdown-menu">
            {
              this.state.commits.map(function(item, index) {
                return (
                  <li key={item.sha}>
                    <a href="#" onClick={this.handleCommitClick.bind(this, item)}>
                      "{item.commit.message}" by {item.commit.committer.name} ({item.sha.substring(0, 7)})
                    </a>
                  </li>
                );
              }.bind(this))
            }
          </ul>
        </div>
      );
    }
  }
}

export default CommitButton
