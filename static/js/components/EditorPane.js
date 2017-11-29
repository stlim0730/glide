import EditorToolBar from './EditorToolBar.js';
import TabbedEditors from './TabbedEditors.js';

// 
// EditorPane component
// 
class EditorPane extends React.Component {
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
      <div className="col-lg-5 col-md-5 no-padding full-height">

        <div className="card full-height">
          <h6 className="card-header">Editor</h6>
          <TabbedEditors
            app={this.props.app}
            tree={this.props.tree}
            recursiveTree={this.props.recursiveTree}
            filesOpened={this.state.filesOpened}
            fileActive={this.state.fileActive} />
        </div>

        {
          // <div className="panel panel-default full-height">
          //   <div className="panel-heading">Editor</div>
          //   <div className="height-95 panel-body no-padding">
          //     <TabbedEditors
          //       app={this.props.app}
          //       tree={this.props.tree}
          //       recursiveTree={this.props.recursiveTree}
          //       filesOpened={this.state.filesOpened}
          //       fileActive={this.state.fileActive} />
          //   </div>
          // </div>
        }
      </div>
    );
  }
}

export default EditorPane
