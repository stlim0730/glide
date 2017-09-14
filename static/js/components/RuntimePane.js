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
      <div className="col-lg-4 col-md-4 full-height">
        <RendererPane />
        <DebuggerPane />
      </div>
    );
  }
}

export default RuntimePane
