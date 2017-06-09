// 
// FileNode component
// 
class FileNode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // tree: {
        // folders: [],
        // files: []
        nodes: []
      // }
    };

    this._slugify = this._slugify.bind(this);
  }

  componentDidMount() {
    // 
    // This event seems to affect children nodes' behavior.
    //   Maybe, that's because recursively generated nodes are dynamic
    //   so that the state should update after being mounted.
    // 
    let orderedNodes = _.orderBy(this.props.nodes, ['type','name'], ['desc', 'asc']);
    this.setState({
      nodes: orderedNodes
    });
  }

  componentWillReceiveProps(nextProps) {
    // 
    // This event seems to affect the root node's behavior.
    //   Compared to children nodes, the root node is static
    //   so that the state is determined when it receives props.
    let orderedNodes = _.orderBy(nextProps.nodes, ['type','name'], ['desc', 'asc']);
    this.setState({
      nodes: orderedNodes
    });
  }

  _slugify(str) {
    return str.toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
      .trim();
  }

  render () {
    
    return (
      <div>
        {
          this.state.nodes && this.state.nodes.map(function(item, index) {

            if(item.type == 'tree') {
              return (
                <div key={index}>
                  <button href="#" className="btn btn-link file-node-folder" data-toggle="collapse"
                    data-target={"#" + this._slugify(item.path) + "-list-group"}>
                    {item.name}&emsp;
                    <span className="glyphicon glyphicon-menu-down" aria-hidden="true"></span>
                  </button>
                  <ul id={this._slugify(item.path) + "-list-group"}
                    className="list-group collapse">
                    <FileNode nodes={item.nodes} />
                  </ul>
                </div>
              );
            }
            else {
              return (
                <button key={index} className="list-group-item file-node-file" data-download-url={item.downloadUrl}>
                  {item.name}
                </button>
              );
            }

            // return (
              // <div key={index}>
              //   {
              //     item.type == 'tree'
              //     ?
              //     <div>
              //       <button href="#" className="btn btn-link" data-toggle="collapse"
              //         data-target={"#" + this._slugify(item.path) + "-list-group"}>
              //         {item.name}&emsp;
              //         <span className="glyphicon glyphicon-menu-down" aria-hidden="true"></span>
              //       </button>
              //       <ul id={this._slugify(item.path) + "-list-group"}
              //         className="list-group collapse">
              //         <FileNode nodes={item.nodes} />
              //       </ul>
              //     </div>
              //     :
              //     // item.name + ': ' + item.size
              //     <button className="list-group-item" data-download-url={item.downloadUrl}>
              //       {item.name}
              //     </button>
              //   }
              // </div>
            // );
          }.bind(this))
        }
        {
          // this.state.tree.files.map(function(item, index) {
          //   return (
          //     <div key={item.path}>
          //       {item.name}: {item.size}
          //     </div>
          //   );
          // })
        }
      </div>
    );
  }
}

export default FileNode
