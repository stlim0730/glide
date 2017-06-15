// 
// TabbedEditors component
// 
class TabbedEditors extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileOpened: [],
      fileActive: null
    };

    // this._slugify = this._slugify.bind(this);
    this._getEditorId = this._getEditorId.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
  }

  // _slugify(str) {
  //   return str.toLowerCase()
  //     .replace(/\s+/g, '-') // Replace spaces with -
  //     .replace(/[^\w\-]+/g, '') // Remove all non-word chars
  //     .replace(/\-\-+/g, '-') // Replace multiple - with single -
  //     .replace(/^-+/, '') // Trim - from start of text
  //     .replace(/-+$/, '') // Trim - from end of text
  //     .trim();
  // }

  _getEditorId(fileObj) {
    let suffix = '_editor';
    return fileObj.sha + suffix;
  }

  handleTabClick(file, e) {
    let app = this.props.app;
    this.setState({
      fileActive: file
    }, function() {
      app.setState({
        fileActive: file
      });
    });
  }

  componentDidMount() {
    this.setState({
      fileOpened: this.props.fileOpened,
      fileActive: this.props.fileActive
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fileOpened: nextProps.fileOpened,
      fileActive: nextProps.fileActive
    });
  }

  render () {
    let tabClassNames = [];
    let editorClassNames = [];
    this.state.fileOpened.map(function(item, index) {
      let tabClassName = (item == this.state.fileActive ? "active" : "");
      let editorClassName = (this.state.fileActive == item ? "tab-pane fade active in" : "tab-pane fade");
      tabClassNames.push(tabClassName);
    });

    return (
      <div>
        <ul className="nav nav-tabs">
          {
            this.state.fileOpened.map(function(item, index) {
              return (
                <li key={item.path} className={tabClassNames[index]}>
                  <a href={"#" + this._getEditorId(item)} data-toggle="tab" onClick={this.handleTabClick.bind(this, item)}>
                    {item.name}
                  </a>
                </li>
              );
            }.bind(this))
          }
        </ul>
        <div className="tab-content">
          {
            this.state.fileOpened.map(function(item, index) {
              return (
                <div key={item.path} id={this._getEditorId(item)}
                  className={editorClassNames[index]}>
                </div>
              );
            }.bind(this))
          }
        </div>
      </div>
    );
  }
}

export default TabbedEditors
