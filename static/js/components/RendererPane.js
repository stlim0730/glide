// 
// RendererPane component
// 
class RendererPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //
    };
  }

  render () {
    return (
      <div className="height-60 panel panel-default">
        <div className="panel-heading">Preview</div>
        <div className="auto-scroll full-height panel-body">
          &nbsp;
        </div>
      </div>
    );
  }
}

export default RendererPane
