// 
// DebuggerPane component
// 
class DebuggerPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      liveBugs: []
    };
  }

  componentDidMount() {
    this.setState({
      liveBugs: this.props.liveBugs
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      liveBugs: nextProps.liveBugs
    });
  }

  render () {
    return (
      <div className="height-40 panel panel-default">
        <div className="panel-heading">Debugger</div>
        <div className="auto-scroll full-height panel-body">
          <table className="table table-striped table-hover ">
            <thead>
              <tr>
                <th>No.</th>
                <th>File</th>
                <th>Line No.</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.liveBugs.map(function(item, index) {
                  return (
                    <tr key={index} className={item.type == 'error' ? 'danger' : ''}>
                      <td>
                        {(index + 1)}
                      </td>
                      <td>
                        {item.file}
                      </td>
                      <td>
                        {item.line}
                      </td>
                      <td>
                        {item.message}
                      </td>
                    </tr>
                  );
                }.bind(this))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default DebuggerPane
