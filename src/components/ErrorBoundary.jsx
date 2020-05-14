import React from 'react';
import PropTypes from 'prop-types';

/**
 * Provides a boundary for propagating errors in components.
 */
class ErrorBoundary extends React.Component {
  /**
   * Construct an instance of this component
   * @param {any} props attributes applied to component
   */
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }
  /**
   * Handle uncaught exceptions in child components
   * @param {Error} error thrown error
   * @param {any} errorInfo more info about the error
   */
  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({ error, errorInfo });
    // You can also log error messages to an error reporting service here
  }
  /**
   * Render this component
   * @return {React.Component}
   */
  render() {
    if (this.state.errorInfo) {
      return (
        <div className="bg-light text-danger p-3">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.element,
};

export default ErrorBoundary;
