// import FileNode from './FileNode.js';

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

  // componentDidMount() {
    
  // }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fileOpened: nextProps.fileOpened,
      fileActive: nextProps.fileActive
    });
  }

  render () {
    return (
      <div className="col-lg-5 col-md-5 full-height">
        <div className="panel panel-default full-height">
          <div className="panel-heading">Editor</div>
          <div className="auto-scroll full-height panel-body">
            {
              this.state.fileActive && JSON.stringify(this.state.fileActive)
            }
          </div>
        </div>
      </div>
    );
  }
}

export default EditorPane
