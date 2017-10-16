import EditorToolBar from './EditorToolBar.js';
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
    return (
      <div className="col-lg-6 col-md-6 full-height">
        <div className="panel panel-default full-height">
          <div className="panel-heading">Editor</div>
          <div className="height-95 panel-body no-padding">
            {
              // <EditorToolBar
              //   app={this.props.app}
              //   filesOpened={this.state.filesOpened}
              //   fileActive={this.state.fileActive} />
            }
            <TabbedEditors
              app={this.props.app}
              tree={this.props.tree}
              filesOpened={this.state.filesOpened}
              fileActive={this.state.fileActive} />
          </div>
        </div>
      </div>
    );
  }
}

export default EditorPane
