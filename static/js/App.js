// 
// Load CSS
// 
import bootstrap_style from '../css/bootstrap/bootstrap.css';
import custom_style from '../css/style.css'

//
// Load Javascript libraries
//   Some JS plugins have been loaded by ProvidePlugin settings from config
//
import './lib/bootstrap/bootstrap.min.js';

// 
// Load components
// 
import NavBar from './components/NavBar.js'

// 
// Constants
// 
const APP_PHASE_CLEAN_SLATE = 'clean_slate';
const APP_PHASE_OPEN = 'open';
const APP_PHASE_LOADING = 'loading';

// 
// App component
// 
class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      phase: APP_PHASE_CLEAN_SLATE
    };

    // this.clickHandler = this.clickHandler.bind(this);
  }

  // clickHandler() {
  //   this.setState({phase: APP_PHASE_OPEN});
  // }

  render() {
    switch(this.state.phase) {
      case APP_PHASE_CLEAN_SLATE:

        return (
          <NavBar />
          // <StartPanel />
        );

      case APP_PHASE_OPEN:
        return (
          <NavBar />
          // <StartPanel />
        );

      case APP_PHASE_LOADING:
        return (
          <NavBar />
          // <StartPanel />
        );
      
      default:
        return (
          <div>WHERE ARE YOU GOING?</div>
        );
    }

    // return <div onClick={this.clickHandler}>{this.state.phase}</div>;
  }
}

ReactDOM.render(<App />, $('#content')[0]);
