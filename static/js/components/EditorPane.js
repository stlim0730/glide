// import EditorToolBar from './EditorToolBar.js';
import TabbedEditors from './TabbedEditors.js';

// 
// EditorPane component
// 
class EditorPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      constants: {
        //
      },
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
    // console.info('EditorPane', this.state);
    return (
      <div className="col-lg-5 col-md-5 full-height">
        <div className="panel panel-default full-height">
          <div className="panel-heading">Editor</div>
          <div className="height-90 panel-body no-padding">
            <TabbedEditors app={this.props.app} filesOpened={this.state.filesOpened} fileActive={this.state.fileActive} />
          </div>
        </div>
      </div>
    );
  }
}

export default EditorPane

//<EditorToolBar />
