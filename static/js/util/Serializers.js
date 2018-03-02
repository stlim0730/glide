// 
// Serializers component
// 
class Serializers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      //
    };
  }

  // static b64EncodeUnicode(unicodeStr) {
  //   // First use encodeURIComponent to get percent-encoded UTF-8,
  //   //   then convert the percent encodings into raw bytes which can be fed into btoa.
  //   // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
  //   return btoa(encodeURIComponent(unicodeStr).replace(/%([0-9A-F]{2})/g,
  //       function toSolidBytes(match, p1) {
  //           return String.fromCharCode('0x' + p1);
  //   }));
  // }

  static b64DecodeUnicode(base64Str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
    return decodeURIComponent(atob(base64Str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }
}

export default Serializers;
