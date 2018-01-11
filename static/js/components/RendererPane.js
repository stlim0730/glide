// 
// RendererPane component
// 
class RendererPane extends React.Component {
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
      <div className="height-50 card">
        <h6 className="card-header">Preview</h6>
        <iframe
          className="auto-scroll height-90 panel-body"
          srcDoc={this.state.liveHtml}
          width="100%"
          style={{border:'none'}}
          sandbox="allow-scripts">
        </iframe>
      </div>
    );
  }
}

export default RendererPane;
