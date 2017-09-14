// 
// GitDiffPane component
// 
class GitDiffPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      diffFile: null
    };

    this.handleDiffClose = this.handleDiffClose.bind(this);
  }

  handleDiffClose() {
    this.setState({
      diffFile: null
    }, function() {
      this.props.gitStatusModalContent.setState({
        diffFile: null
      });
    });
  }

  componentDidMount() {
    // this.setState({
    //   diffFile: this.props.diffFile
    // });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      diffFile: nextProps.diffFile
    });
  }

  render () {
    return (
      !this.state.diffFile ? null :
      <div>
        <div className="col-lg-8 col-md-8">
          <button
            type="button"
            className="close"
            onClick={this.handleDiffClose.bind(this)}>
            &times;
          </button>
        </div>
        <div>
          <pre className="col-lg-4 col-md-4">
            {this.state.diffFile.originalContent}
          </pre>
          <pre className="col-lg-4 col-md-4">
            {this.state.diffFile.newContent}
          </pre>
        </div>
      </div>
    );
  }
}

export default GitDiffPane
