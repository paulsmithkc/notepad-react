import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';
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
    this.getAllNotes();
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
              className="btn btn-outline-primary mx-1"
              title="Refresh"
              onClick={() => this.getAllNotes()}
            >
              <i className="fa-fw fas fa-sync-alt"></i> Refresh
            </button>
            <button type="button" className="btn btn-outline-primary mx-1" title="Add Note">
              <i className="fa-fw fas fa-plus-circle"></i> Add Note
            </button>
            <button
              type="button"
              className="btn btn-outline-primary mx-1"
              title="Delete All Notes"
              onClick={() => this.deleteAllNotes()}
            >
              <i className="fa-fw fas fa-trash"></i> Delete All Notes
            </button>
          </div>
        </div>
        <hr></hr>
        <div>
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
    return this.state.error ? <h4 className="text-danger">{this.state.error}</h4> : null;
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
      <div className="row">
        {map(this.state.notes, (note) => (
          <ErrorBoundary key={note._id}>
            {note.isEdit ? (
              <NoteForm
                id={note._id}
                title={note.title}
                body={note.body}
                onCancel={(id) => this.endEdit(id)}
              />
            ) : (
              <NoteCard
                id={note._id}
                title={note.title}
                body={note.body}
                onEdit={(id) => this.beginEdit(id)}
              />
            )}
          </ErrorBoundary>
        ))}
      </div>
    );
  }
  /**
   * Start editing a note.
   * @param {string} id the id of the note
   */
  beginEdit(id) {
    const notes = map(this.state.notes, (note) => {
      if (note._id == id) {
        note.isEdit = true;
      }
      return note;
    });
    this.setState({ notes: notes });
  }
  /**
   * Stop editing a note.
   * @param {string} id the id of the note
   */
  endEdit(id) {
    const notes = map(this.state.notes, (note) => {
      if (note._id == id) {
        note.isEdit = false;
      }
      return note;
    });
    this.setState({ notes: notes });
  }
  /**
   * Get all of the notes from the database and display them.
   */
  getAllNotes() {
    this.setState({ notes: null, error: null });
    fetch('/api/note')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to get notes: ${response.status} ${response.statusText}`);
        } else {
          return response.json();
        }
      })
      .then((data) => this.setState({ notes: data, error: null }))
      .catch((err) => this.setState({ notes: [], error: err.message }));
  }
  /**
   * Delete all notes from the database.
   */
  deleteAllNotes() {
    fetch('/api/note/all', { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to delete all notes: ${response.status} ${response.statusText}`);
        }
      })
      .then(() => this.setState({ notes: [], error: null }))
      .catch((err) => this.setState({ error: err.message }));
  }
}

App.propTypes = {};

export default App;
