import React from 'react';
import PropTypes from 'prop-types';

const NoteCard = (props) => (
  <div className="col-sm-6 col-md-4" data-id={props.id}>
    <div className="card mb-3">
      <div className="card-header d-flex flex-wrap align-items-center">
        <h3 className="card-title flex-grow-1 m-1">{props.title || ''}</h3>
        <div>
          <button
            type="button"
            className="btn btn-outline-primary m-1 px-2 py-1"
            title="Edit Note"
            onClick={() => props.onEdit(props.id, props.title, props.body)}
          >
            <i className="fa-fw fas fa-pen"></i>
            <span className="sr-only">Edit Note</span>
          </button>
          <button
            type="button"
            className="btn btn-outline-primary m-1 px-2 py-1"
            title="Delete Note"
            onClick={() => props.onDelete(props.id)}
          >
            <i className="fa-fw fas fa-trash"></i>
            <span className="sr-only">Delete Note</span>
          </button>
        </div>
      </div>
      <div className="card-body">
        <p>{props.body || ''}</p>
      </div>
    </div>
  </div>
);

NoteCard.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  body: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default NoteCard;
