import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';

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
    this.state = { notes: null, error: null };
  }
  /**
   * Called after the component is mounted.
   */
  componentDidMount() {
    this.getAllNotesFromAPI();
  }
  /**
   * Render this component
   * @return {React.Component}
   */
  render() {
    return (
      <React.Fragment>
        <div className="d-flex flex-wrap align-items-center">
          <h1 className="flex-grow-1 m-3">
            <i className="fa-fw fas fa-clipboard"></i> Notepad w/ MongoDB & React
          </h1>
          <div>
            <button
              type="button"
              className="Note-refresh-btn btn btn-outline-primary mx-1"
              title="Refresh"
              onClick={() => this.getAllNotesFromAPI()}
            >
              <i className="fa-fw fas fa-sync-alt"></i> Refresh
            </button>
            <button
              type="button"
              className="Note-add-btn btn btn-outline-primary mx-1"
              title="Add Note"
            >
              <i className="fa-fw fas fa-plus-circle"></i> Add Note
            </button>
            <button
              type="button"
              className="Note-delete-all-btn btn btn-outline-primary mx-1"
              title="Delete All Notes"
              onClick={() => this.deleteAllNotes()}
            >
              <i className="fa-fw fas fa-trash"></i> Delete All Notes
            </button>
          </div>
        </div>
        <hr></hr>
        <div id="Note-container">
          <ErrorBoundary>{this.renderError()}</ErrorBoundary>
          <ErrorBoundary>{this.renderNotes()}</ErrorBoundary>
        </div>
      </React.Fragment>
    );
  }
  /**
   * Render the most recent error message.
   * @return {React.Component}
   */
  renderError() {
    return this.state.error ? <h4 className="text-error">{this.state.error.message}</h4> : null;
  }
  /**
   * Render the all notes.
   * @return {React.Component}
   */
  renderNotes() {
    return this.state.notes == null ? (
      <h4>Loading notes, please wait...</h4>
    ) : isEmpty(this.state.notes) ? (
      <h4>No notes found</h4>
    ) : (
      <div>
        {map(this.state.notes, (note) => (
          <div key={note._id} className="card">
            {note.title}
          </div>
        ))}
      </div>
    );
  }
  /**
   * Get all of the notes from the database and display them.
   */
  getAllNotesFromAPI() {
    this.setState({ notes: null, error: null });
    fetch('/api/note')
      .then((response) => response.json())
      .then((data) => this.setState({ notes: data, error: null }))
      .catch((err) => this.setState({ notes: [], error: err }));
  }
  /**
   * Delete all notes from the database.
   */
  deleteAllNotes() {
    fetch('/api/note/all', { method: 'DELETE' })
      .then(() => this.setState({ notes: [], error: null }))
      .catch((err) => this.setState({ notes: [], error: err }));
  }
}

App.propTypes = {};

export default App;
