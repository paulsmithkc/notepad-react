const debug = require('debug')('app:db');
const config = require('config');
const { MongoClient, Db, ObjectId } = require('mongodb');

const DB_NAME = config.get('db.name');
const DB_URI = config.get('db.uri');

/**
 * Note Entity
 */
class Note {
  /**
   * Create a new note entity.
   * @param {string} title title text of the note
   * @param {string} body body text of the note
   */
  constructor(title, body) {
    this._id = new ObjectId().toString();
    this.title = title;
    this.body = body;
  }
}

/**
 * Global database connection.
 * Do not user directly, call connect() when needed.
 * @type {Db}
 */
let databaseConnection = null;

/**
 * Open a connection to the database, if one is not already open.
 * Otherwise, reuse the existing connection.
 * @return {Promise<Db>}
 */
async function connect() {
  if (!databaseConnection) {
    debug('connecting to database...');
    const client = await MongoClient.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      poolSize: 10,
    });
    databaseConnection = client.db(DB_NAME);
    debug('connected.');
  }
  return databaseConnection;
}

/**
 * Returns all notes in the database as an array.
 * @return {Promise<Note[]>}
 */
async function getAllNotes() {
  const db = await connect();
  return db.collection('notes').find({}).sort({ title: 1 }).toArray();
}

/**
 * Returns a single note with the given ID.
 * @param {string} id the id of the note
 * @return {Promise<Note>}
 */
async function findNoteById(id) {
  id = new ObjectId(id);
  const db = await connect();
  return db.collection('notes').findOne({ _id: id });
}

/**
 * Insert a new note into the database.
 * @param {Note} note entity to be inserted
 * @return {Promise<any>}
 */
async function insertOneNote(note) {
  delete note._id;
  const db = await connect();
  return db.collection('notes').insertOne(note);
}

/**
 * Update an existing note in the database.
 * @param {Note} note entity to be updated
 * @return {Promise<any>}
 */
async function updateOneNote(note) {
  note._id = new ObjectId(note._id);
  const db = await connect();
  return db
    .collection('notes')
    .updateOne({ _id: note._id }, { $set: { title: note.title, body: note.body } });
}

/**
 * Deletes the note with the given ID.
 * @param {string} id the id of the note
 * @return {Promise<any>}
 */
async function deleteOneNote(id) {
  id = new ObjectId(id);
  const db = await connect();
  return db.collection('notes').deleteOne({ _id: id });
}

/**
 * Delete all notes from the database.
 * (This is permanent, use with caution.)
 * @return {Promise<any>}
 */
async function deleteAllNotes() {
  const db = await connect();
  return db.collection('notes').deleteMany({});
}

/**
 * Checks if a value is a valid ObjectId.
 * @param {string|ObjectId} id the id to validate
 * @return {boolean} return true if the value is a valid ObjectId, return false otherwise.
 */
function isValidId(id) {
  return ObjectId.isValid(id);
}

/**
 * Generate a new ObjectId.
 * @return {ObjectId}
 */
function newId() {
  return new ObjectId().toString();
}

module.exports.Note = Note;
module.exports.connect = connect;
module.exports.getAllNotes = getAllNotes;
module.exports.findNoteById = findNoteById;
module.exports.insertOneNote = insertOneNote;
module.exports.updateOneNote = updateOneNote;
module.exports.deleteOneNote = deleteOneNote;
module.exports.deleteAllNotes = deleteAllNotes;
module.exports.isValidId = isValidId;
module.exports.newId = newId;
