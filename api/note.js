// const debug = require('debug')('app:api');
const express = require('express');
const joi = require('@hapi/joi');
const db = require('../db');

// define the schema for a valid note
const NOTE_SCHEMA = joi.object({
  _id: joi.objectId(),
  title: joi.string().required(),
  body: joi.string().required(),
});

// create router
const router = express.Router();

// middleware
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// route: get all notes from the database
// NOTE: the order/precedence of this route matters.
router.get('/', async (request, response, next) => {
  try {
    const notes = await db.getAllNotes();
    return response.json(notes);
  } catch (err) {
    next(err);
  }
});

// route: get a single note from the database
router.get('/:id', async (request, response, next) => {
  try {
    const id = request.params.id;
    if (!db.isValidId(id)) {
      return sendInvalidId(response);
    }

    const note = await db.findNoteById(id);
    return response.json(note);
  } catch (err) {
    next(err);
  }
});

// route: insert a new note into the database
router.post('/', async (request, response, next) => {
  try {
    const note = request.body;
    note._id = db.newId();

    await NOTE_SCHEMA.validateAsync(note);
    await db.insertOneNote(note);
    return response.json(note);
  } catch (err) {
    next(err);
  }
});

// route: update an existing note in the database
router.put('/:id', async (request, response, next) => {
  try {
    const id = request.params.id;
    if (!db.isValidId(id)) {
      return sendInvalidId(response);
    }

    const note = request.body;
    note._id = id;

    await NOTE_SCHEMA.validateAsync(note);
    await db.updateOneNote(note);
    return response.json(note);
  } catch (err) {
    next(err);
  }
});

// route: delete all notes from the database
// NOTE: the order/precedence of this route matters.
router.delete('/all', async (request, response, next) => {
  try {
    await db.deleteAllNotes();
    return response.type('text/plain').send('All notes deleted.');
  } catch (err) {
    next(err);
  }
});

// route: delete an existing note from the database
router.delete('/:id', async (request, response, next) => {
  try {
    const id = request.params.id;
    if (!db.isValidId(id)) {
      return sendInvalidId(response);
    }

    await db.deleteOneNote(id);
    return response.type('text/plain').send('Note deleted.');
  } catch (err) {
    next(err);
  }
});

/**
 * Send error message to client, telling it that the supplied ID is invalid.
 * @param {any} response
 * @return {any}
 */
function sendInvalidId(response) {
  return response.type('text/plain').status(400).send('id is invalid.');
}

// export router
module.exports = router;
