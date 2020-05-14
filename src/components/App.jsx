import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Root component for the react application.
 */
class App extends React.Component {
  /**
   * Construct an instance of this component
   * @param {any} props attributes applied to component
   */
  constructor(props) {
    super(props);
    this.state = { notes: null };
  }
  /**
   * Render this component
   * @return {React.Component}
   */
  render() {
    return (
      <ErrorBoundary>
        <h1>hello</h1>
      </ErrorBoundary>
    );
  }
}

App.propTypes = {};

export default App;
