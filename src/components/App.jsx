import React from 'react';
import ErrorBoundary from './ErrorBoundary';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { notes: null };
  }
  render() {
    return (
      <ErrorBoundary>
        <h1>hello</h1>
      </ErrorBoundary>
    );
  }
}

export default App;
