import RendererPane from './RendererPane.js';
// import DebuggerPane from './DebuggerPane.js';
import GitPane from './GitPane.js';

// 
// RuntimePane component
// 
class RuntimePane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      liveYaml: null,
      liveHtml: null,
      liveBugs: []
    };
  }

  componentDidMount() {
    this.setState({
      liveYaml: this.props.liveYaml,
      liveHtml: this.props.liveHtml,
      liveBugs: this.props.liveBugs
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      liveYaml: nextProps.liveYaml,
      liveHtml: nextProps.liveHtml,
      liveBugs: nextProps.liveBugs
    });
  }

  render () {
    return (
      <div className="col-lg-5 col-md-5 no-padding full-height">
        
        <RendererPane
          liveHtml={this.state.liveHtml} />
        {
          // <DebuggerPane
          //   liveYaml={this.state.liveYaml}
          //   liveBugs={this.state.liveBugs} />
        }

        <GitPane
          branch={this.props.branch}
          changedFiles={this.props.changedFiles}
          addedFiles={this.props.addedFiles} />
          
      </div>
    );
  }
}

export default RuntimePane
