import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import find from 'lodash/find';
import assign from 'lodash/assign';

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
            <i className="fa-fw fas fa-clipboard"></i> Notepad w/ MongoDB &amp; React
          </h1>
          <div>
            <button
              type="button"
              className="btn btn-outline-primary mx-1"
              title="Refresh"
              onClick={(e) => this.getAllNotes()}
            >
              <i className="fa-fw fas fa-sync-alt"></i> Refresh
            </button>
            <button
              type="button"
              className="btn btn-outline-primary mx-1"
              title="Add Note"
              onClick={(e) => this.addNote()}
            >
              <i className="fa-fw fas fa-plus-circle"></i> Add Note
            </button>
            <button
              type="button"
              className="btn btn-outline-primary mx-1"
              title="Delete All Notes"
              onClick={(e) => this.deleteAllNotes()}
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
                title={note.newTitle}
                body={note.newBody}
                error={note.error}
                onTitleChange={(id, title) => this.updateNote({ _id: id, newTitle: title })}
                onBodyChange={(id, body) => this.updateNote({ _id: id, newBody: body })}
                onSave={(id) => this.saveNote(id)}
                onCancel={(id) => this.updateNote({ _id: id, isEdit: false })}
              />
            ) : (
              <NoteCard
                id={note._id}
                title={note.title}
                body={note.body}
                onEdit={(id, title, body) =>
                  this.updateNote({
                    _id: id,
                    isEdit: true,
                    newTitle: title,
                    newBody: body,
                    error: null,
                  })
                }
              />
            )}
          </ErrorBoundary>
        ))}
      </div>
    );
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
  /**
   * Update the properties a single note.
   * @param {object} values the new property values
   */
  updateNote(values) {
    const notes = map(this.state.notes, (note) => {
      if (note._id == values._id) {
        note = assign(note, values);
      }
      return note;
    });
    this.setState({ notes: notes });
  }
  /**
   *
   * @param {string} id the id of the note
   */
  saveNote(id) {
    const note = find(this.state.notes, (x) => x._id == id);
    if (note) {
      const requestData = {
        _id: id,
        title: note.newTitle,
        body: note.newBody,
      };
      const request = fetch('/api/note/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      request
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to save note: ${response.status} ${response.statusText}`);
          } else {
            return response.json();
          }
        })
        .then((data) =>
          this.updateNote({
            _id: id,
            isEdit: false,
            title: data.title,
            body: data.body,
            error: null,
          })
        )
        .catch((err) => this.updateNote({ _id: id, error: err.message }));
    }
  }
}

App.propTypes = {};

export default App;
