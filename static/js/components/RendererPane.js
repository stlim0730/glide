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
      <div className="height-60 panel panel-default">
        <div className="panel-heading">Preview</div>
        <div
          className="auto-scroll height-90 panel-body"
          dangerouslySetInnerHTML={{__html: this.state.liveHtml}}>
        </div>
      </div>
    );
  }
}

export default RendererPane
