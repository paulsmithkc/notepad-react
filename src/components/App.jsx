import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import 'bootstrap';
import bootbox from 'bootbox';

import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import map from 'lodash/map';
import find from 'lodash/find';
import assign from 'lodash/assign';
import concat from 'lodash/concat';

import NoteViewer from './NoteViewer';
import NoteEditor from './NoteEditor';
// const NoteViewer = React.lazy(() => import('./NoteViewer'));
// const NoteEditor = React.lazy(() => import('./NoteEditor'));

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
              onClick={(e) => this.confirmDeleteAllNotes()}
            >
              <i className="fa-fw fas fa-trash"></i> Delete All Notes
            </button>
          </div>
        </div>
        <hr></hr>
        <div>
          <ErrorBoundary>{this.renderError()}</ErrorBoundary>
          <ErrorBoundary>
            <React.Suspense fallback={<h4 className="text-muted">Loading notes, please wait...</h4>}>
              {this.renderNotes()}
            </React.Suspense>
          </ErrorBoundary>
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
      <h4 className="text-muted">Loading notes, please wait...</h4>
    ) : isEmpty(this.state.notes) ? (
      <h4>No notes found</h4>
    ) : (
      <div className="row">
        {map(this.state.notes, (note) => (
          <ErrorBoundary key={note._id}>
            {note.isEdit ? (
              <NoteEditor
                id={note._id}
                title={note.newTitle}
                body={note.newBody}
                error={note.error}
                onTitleChange={(id, title) => this.updateNote(id, { newTitle: title })}
                onBodyChange={(id, body) => this.updateNote(id, { newBody: body })}
                onCancel={(id) => this.updateNote(id, { isEdit: false, error: null })}
                onSave={(id) => this.saveNote(id)}
              />
            ) : (
              <NoteViewer
                id={note._id}
                title={note.title}
                body={note.body}
                error={note.error}
                onEdit={(id, title, body) =>
                  this.updateNote(id, { isEdit: true, newTitle: title, newBody: body, error: null })
                }
                onDelete={(id) => this.confirmDeleteNote(id)}
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
   * Displays a confirmation box, before delete all notes from the database.
   */
  confirmDeleteAllNotes() {
    bootbox.confirm({
      title: 'Warning',
      message: '<h5>Are you sure that you want to delete <u>ALL</u> notes?</h5><h6>(This is permanent.)</h6>',
      buttons: {
        confirm: { label: 'Yes, delete everything', className: 'btn-danger' },
        cancel: { label: 'Cancel', className: 'btn-outline-dark' },
      },
      closeButton: true,
      onEscape: true,
      backdrop: true,
      callback: (result) => {
        if (result) {
          this.deleteAllNotes();
        }
      },
    });
  }
  /**
   * Displays a confirmation box, before delete all notes from the database.
   * @param {string} id the id of the note
   */
  confirmDeleteNote(id) {
    bootbox.confirm({
      title: 'Warning',
      message: '<h5>Are you sure that you want to this note?</h5><h6>(This is permanent.)</h6>',
      buttons: {
        confirm: { label: 'Yes, delete it', className: 'btn-danger' },
        cancel: { label: 'Cancel', className: 'btn-outline-dark' },
      },
      closeButton: true,
      onEscape: true,
      backdrop: true,
      callback: (result) => {
        if (result) {
          this.deleteNote(id);
        }
      },
    });
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
   * Delete a note from the database.
   * @param {string} id the id of the note
   */
  deleteNote(id) {
    fetch('/api/note/' + id, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to delete note: ${response.status} ${response.statusText}`);
        }
      })
      .then(() => {
        const notes = filter(this.state.notes, (note) => note._id != id);
        this.setState({ notes: notes });
      })
      .catch((err) => this.updateNote(id, { error: err.message }));
  }
  /**
   * Update the properties a single note.
   * @param {string} id the id of the note
   * @param {object} values the new property values
   */
  updateNote(id, values) {
    let notes = map(this.state.notes, (note) => {
      if (note._id == id) {
        note = assign(note, values);
      }
      return note;
    });
    notes = filter(notes, (x) => !x.isNew || x.isEdit);
    this.setState({ notes: notes });
  }
  /**
   * Save a note to the database.
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
      const request = note.isNew
        ? fetch('/api/note/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        })
        : fetch('/api/note/' + id, {
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
          this.updateNote(id, {
            _id: data._id,
            title: data.title,
            body: data.body,
            isNew: false,
            isEdit: false,
            error: null,
          })
        )
        .catch((err) => this.updateNote(id, { error: err.message }));
    }
  }
  /**
   * Adds a new note editor.
   */
  addNote() {
    if (find(this.state.notes, (x) => x.isNew) == null) {
      const newNote = {
        _id: null,
        isNew: true,
        isEdit: true,
        newTitle: '',
        newBody: '',
        error: null,
      };
      const notes = concat([newNote], this.state.notes);
      this.setState({ notes: notes });
    }
  }
}

App.propTypes = {};

export default App;
