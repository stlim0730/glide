// 
// EditorToolBar component
// 
class EditorToolBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filesOpened: [],
      fileActive: null
    };
  }

  componentDidMount() {
    this.setState({
      filesOpened: this.props.filesOpened,
      fileActive: this.props.fileActive
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      filesOpened: nextProps.filesOpened,
      fileActive: nextProps.fileActive
    });
  }

  render () {
    return (
      <div className="btn-group btn-group-justified">
        {this.state.fileActive && <a href="#" className="btn btn-link">Add</a>}
        {this.state.fileActive && <a href="#" className="btn btn-link">2</a>}
        {this.state.fileActive && <a href="#" className="btn btn-link">3</a>}
        {this.state.fileActive && <a href="#" className="btn btn-link">4</a>}
        {this.state.fileActive && <a href="#" className="btn btn-link">5</a>}
      </div>
    );
  }
}

export default EditorToolBar
