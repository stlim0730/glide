import spinner_style from '../../css/spinner.css';
// Reference: http://tobiasahlin.com/spinkit/

// 
// LoadingPane component
// 
class LoadingPane extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: {}
    };
  }

  _reset() {
    this.setState({
      messages: {}
    });
  }

  componentDidMount() {
    this.setState({
      messages: this.props.messages
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      messages: nextProps.messages
    });
  }

  render () {
    let loadingPaneClassName = _.size(this.state.messages) > 0 ?
      "full-screen-loading" :
      "full-screen-loading invisible";
    let messageKeys = _.keys(this.state.messages).sort();

    return (
      <div className={loadingPaneClassName}>
        <div className="v-middle">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-6 col-md-6 offset-lg-3 offset-md-3 text-center">
                <div>
                  {
                    messageKeys.map(function(item, index) {
                      return (
                        <h3 key={index}>
                          <i className="icon-glide"
                            style={{fontSize: '40%', verticalAlign: '0.4em'}}></i> {this.state.messages[item]}
                        </h3>
                      );
                    }.bind(this))
                  }
                </div>

                <div className="spinner">
                  <div className="cube1"></div>
                  <div className="cube2"></div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoadingPane;
