// 
// DebuggerPane component
// 
class DebuggerPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      liveYaml: null,
      liveBugs: []
    };
  }

  componentDidMount() {
    this.setState({
      liveYaml: this.props.liveYaml,
      liveBugs: this.props.liveBugs
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      liveYaml: nextProps.liveYaml,
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
              {
                this.state.liveBugs.length > 0 ?
                (
                  <tr>
                    <th>No.</th>
                    <th>File</th>
                    <th>Line No.</th>
                    <th>Message</th>
                  </tr>
                )
                :
                (
                  <tr>
                    <th>No.</th>
                    <th>Key</th>
                    <th>Type</th>
                    <th>Value</th>
                  </tr>
                )
              }
            </thead>
            <tbody>
              {
                this.state.liveBugs.length > 0 &&
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
              {
                this.state.liveBugs.length == 0 &&
                _.keys(this.state.liveYaml).map(function(item, index) {
                  return (
                    <tr key={index}>
                      <td>
                        {(index + 1)}
                      </td>
                      <td>
                        {item}
                      </td>
                      <td>
                        {typeof this.state.liveYaml[item]}
                      </td>
                      <td>
                        {
                          JSON.stringify(this.state.liveYaml[item]).length < 35 ?
                          JSON.stringify(this.state.liveYaml[item]):
                          JSON.stringify(this.state.liveYaml[item]).substring(0, 35) + ' ...'
                        }
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
