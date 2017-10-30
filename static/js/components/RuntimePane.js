import RendererPane from './RendererPane.js';
import DebuggerPane from './DebuggerPane.js';

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
      <div className="col-lg-4 col-md-4 full-height">
        <RendererPane
          liveHtml={this.state.liveHtml} />
        <DebuggerPane
          liveYaml={this.state.liveYaml}
          liveBugs={this.state.liveBugs} />
      </div>
    );
  }
}

export default RuntimePane
