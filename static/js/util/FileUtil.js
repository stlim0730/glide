// 
// FileUtil component
// 
class FileUtil extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //
    };
  }

  static validateFileName(fileName) {
    // Validate the file name
    // TODO: Allow unicode word characters
    let fileNameRegex = /^([\w\s\.-]+)$/i;
    if(fileNameRegex.test(fileName)) {
      return true;
    }
    else {
      return false;
    }
  }

  static isText(fileObj) {
    const regexes = {
      'textFileRegex'      : /\.txt$/i,
      'htmlFileRegex'      : /\.(htm|html)$/i,
      'webDevFileRegex'    : /\.(js|css|sass|less)$/i,
      'templateFisleRegex'  : /\.(swig|ejs|pug|haml|jade|mustache|handlebars|dust)$/i,
      'dataFileRegex'      : /\.(yaml|yml|json|csv)$/i,
      'markdownFileRegex'  : /\.(md|markdown|mdown|mkdn|mkd)$/i,
      'miscAppFileRegex'   : /\.(log|sh)$/i,
      'sourceCodeFileRegex': /\.(py|java|c|h|cpp|php|cs|r|pl|rb|m|latex|tex)$/i
    };

    for(let key in regexes) {
      let regex = regexes[key];
      if(regex.test(fileObj.name)) {
        return true;
      }
    }

    return false;
  }

  static isImage(fileObj) {
    const imgFileRegex = /\.(jpg|jpeg|gif|png|svg|bmp|ico)$/i;
    if(imgFileRegex.test(fileObj.name)) {
      return true;
    }
    else {
      return false;
    }
  }

  static isBinary(fileObj) {
    return !FileUtil.isText(fileObj);
  }
}

export default FileUtil;
