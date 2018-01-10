// 
// LoadingPane component
// 
class LoadingPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //
    };
  }

  _reset() {
    this.setState({
      // 
    });
  }

  componentDidMount() {
    this.setState({
      //
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      //
    });
  }

  render () {
    return (
      <div className="full-screen-loading">
        <div className="v-middle">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-4 col-md-4 offset-lg-4 offset-md-4 text-center">
                asdf
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoadingPane;
