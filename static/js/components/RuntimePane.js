import RendererPane from './RendererPane.js';
import DebuggerPane from './DebuggerPane.js';

// 
// RuntimePane component
// 
class RuntimePane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      liveHtml: null
    };
  }

  componentDidMount() {
    this.setState({
      liveHtml: this.props.liveHtml
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      liveHtml: nextProps.liveHtml
    });
  }

  render () {
    return (
      <div className="col-lg-4 col-md-4 full-height">
        <RendererPane
          liveHtml={this.state.liveHtml} />
        <DebuggerPane />
      </div>
    );
  }
}

export default RuntimePane
