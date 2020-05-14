const noteContainer = $('#Note-container');
getAllNotes();

$('.Note-refresh-btn').click((e) => {
  console.log('refresh clicked');
  getAllNotes();
});

$('.Note-add-btn').click((e) => {
  console.log('add clicked');
  if (noteContainer.find('.Note-new').length == 0) {
    const noteForm = buildNoteForm({});
    noteForm.addClass('Note-new');
    noteContainer.prepend(noteForm);
  }
});

$('.Note-delete-all-btn').click((e) => {
  console.log('delete all clicked');
  bootbox.confirm({
    title: 'Warning',
    message:
      '<h5>Are you sure that you want to delete <u>all</u> notes?</h5><h6>(This is permanent.)</h6>',
    buttons: {
      confirm: { label: 'Yes, delete everything', className: 'btn-danger' },
      cancel: { label: 'Cancel', className: 'btn-outline-dark' },
    },
    closeButton: true,
    onEscape: true,
    backdrop: true,
    callback: (result) => {
      if (result) {
        deleteAllNotes();
      }
    },
  });
});

/**
 * Get all of the notes from the database and display them.
 */
function getAllNotes() {
  $.get('/api/note')
    .done((data) => {
      noteContainer.html('');
      data.forEach((note) => noteContainer.append(buildNoteCard(note)));
    })
    .fail((err) => {
      console.error(err);
      noteContainer.html(
        `<h4 class="text-danger">Failed to load notes from database:<br/>${err.responseText}</h4>`
      );
    });
}

/**
 * Delete all notes from the database.
 */
function deleteAllNotes() {
  $.ajax({ url: '/api/note/all', method: 'DELETE' })
    .done((data) => {
      noteContainer.html('');
      console.log('All notes deleted.');
    })
    .fail((err) => {
      console.error(err);
      alert(err);
    });
}

/**
 * Delete a note from the database.
 * @param {string} id the id of the note
 */
function deleteNote(id) {
  $.ajax({ url: '/api/note/' + id, method: 'DELETE' })
    .done((data) => {
      $(`.Note[data-id="${id}"]`).remove();
      console.log('Note deleted.');
    })
    .fail((err) => {
      console.error(err);
      alert(err);
    });
}

/**
 * Create a new note element.
 * @param {any} note note object
 * @return {any} note element
 */
function buildNoteCard(note) {
  const id = note._id || '';

  const noteCard = $(
    `<div class="Note col-sm-6 col-md-4" data-id="${id}">
      <div class="card mb-3">
        <div class="card-header d-flex flex-wrap align-items-center">
          <h3 class="Note-title card-title flex-grow-1 m-1">${note.title || ''}</h3>
          <div>
            <button type="button" class="Note-edit-btn btn btn-outline-primary m-1 px-2 py-1" title="Edit Note">
              <i class="fa-fw fas fa-pen"></i>
              <span class="sr-only">Edit Note</span>
            </button>
            <button type="button" class="Note-delete-btn btn btn-outline-primary m-1 px-2 py-1" title="Delete Note">
              <i class="fa-fw fas fa-trash"></i>
              <span class="sr-only">Delete Note</span>
            </button>
          </div>
        </div>
        <div class="Note-body card-body">
          <p>${note.body || ''}</p>
        </div>
      </div>
    </div>`
  );

  noteCard.find('.Note-delete-btn').click((e) => {
    console.log('delete clicked');
    bootbox.confirm({
      title: 'Warning',
      message: 'Are you sure that you want to this note?',
      buttons: {
        confirm: { label: 'Yes, delete it', className: 'btn-danger' },
        cancel: { label: 'Cancel', className: 'btn-outline-dark' },
      },
      closeButton: true,
      onEscape: true,
      backdrop: true,
      callback: (result) => {
        if (result) {
          deleteNote(id);
        }
      },
    });
  });
  noteCard.find('.Note-edit-btn').click((e) => {
    console.log('edit clicked');
    noteCard.replaceWith(buildNoteForm(note));
  });

  return noteCard;
}

/**
 * Create a new note element.
 * @param {any} note note object
 * @return {any} note element
 */
function buildNoteForm(note) {
  const id = note._id || '';

  const noteForm = $(
    `<form class="Note Note-form col-sm-6 col-md-4" method="POST" action="/api/note" data-id="${id}">
      <div class="card mb-3">
        <div class="card-header d-flex flex-wrap align-items-center">
          <h3 class="Note-title card-title flex-grow-1 m-1">${id ? 'Edit Note' : 'Add Note'}</h3>
          <div>
            <button type="submit" class="Note-save-btn btn btn-outline-primary m-1 px-2 py-1" title="Save">
              <i class="fa-fw fas fa-save"></i>
              <span class="sr-only">Save</span>
            </button>
            <button type="button" class="Note-cancel-btn btn btn-outline-primary m-1 px-2 py-1" title="Cancel">
              <i class="fa-fw fas fa-ban"></i>
              <span class="sr-only">Cancel</span>
            </button>
          </div>
        </div>
        <div class="Note-body card-body">
          <input type="hidden" name="_id" value="${id}" />
          <div class="form-group">
            <label for="Note-title">Title</label>
            <input class="form-control" 
                   type="text" id="Note-title" name="title" value="${note.title || ''}" />
          </div>
          <div class="form-group">
            <label for="Note-body">Body</label>
            <textarea class="form-control" 
                      rows="7" id="Note-body" name="body">${note.body || ''}</textarea>
          </div>
          <output class="Note-output"></output>
        </div>
      </div>
    </form>`
  );

  noteForm.find('.Note-cancel-btn').click((e) => {
    console.log('cancel clicked');
    if (id) {
      noteForm.replaceWith(buildNoteCard(note));
    } else {
      noteForm.remove();
    }
  });
  noteForm.submit((e) => {
    e.preventDefault();
    console.log('save clicked');
    const formData = noteForm.serialize();
    const request = id
      ? $.ajax({ url: '/api/note/' + id, method: 'PUT', data: formData })
      : $.ajax({ url: '/api/note/', method: 'POST', data: formData });
    request
      .done((data) => {
        noteForm.replaceWith(buildNoteCard(data));
        console.log('Note saved.');
      })
      .fail((err) => {
        console.error(err);
        noteForm.find('.Note-output').html(`<h6 class="text-danger">${err.responseText}</h6>`);
      });
  });

  return noteForm;
}
