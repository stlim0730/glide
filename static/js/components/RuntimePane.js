import RendererPane from './RendererPane.js';
import DebuggerPane from './DebuggerPane.js';

// 
// RuntimePane component
// 
class RuntimePane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //
    };
  }

  render () {
    return (
      <div className="col-lg-5 col-md-5 full-height">
        <RendererPane />
        <DebuggerPane />
      </div>
    );
  }
}

export default RuntimePane
