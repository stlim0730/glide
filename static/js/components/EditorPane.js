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
      fileOpened: [],
      fileActive: null
    };
  }

  componentDidMount() {
    this.setState({
      fileOpened: this.props.fileOpened,
      fileActive: this.props.fileActive
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fileOpened: nextProps.fileOpened,
      fileActive: nextProps.fileActive
    });
  }

  render () {
    console.info('EditorPane', this.state);
    
    return (
      <div className="col-lg-5 col-md-5 full-height">
        <div className="panel panel-default full-height">
          <div className="panel-heading">Editor</div>
          <div className="auto-scroll full-height panel-body">
            <TabbedEditors app={this.props.app} fileOpened={this.state.fileOpened} fileActive={this.state.fileActive} />
          </div>
        </div>
      </div>
    );
  }
}

export default EditorPane

//<EditorToolBar />