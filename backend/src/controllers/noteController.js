const Note = require("../models/Note");
const AppError = require("../utils/AppError");

const createNote = async (req, res) => {
  const note = await Note.create({ ...req.body, owner: req.user._id });
  return res.status(201).json({ status: "success", data: note });
};

const getNotes = async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { owner: req.user._id };
  const notes = await Note.find(filter).sort({ createdAt: -1 });
  return res.status(200).json({ status: "success", results: notes.length, data: notes });
};

const getNoteById = async (req, res, next) => {
  const note = await Note.findById(req.params.id);
  if (!note) return next(new AppError("Note not found", 404));
  if (req.user.role !== "admin" && `${note.owner}` !== `${req.user._id}`) {
    return next(new AppError("Forbidden", 403));
  }
  return res.status(200).json({ status: "success", data: note });
};

const updateNote = async (req, res, next) => {
  const note = await Note.findById(req.params.id);
  if (!note) return next(new AppError("Note not found", 404));
  if (req.user.role !== "admin" && `${note.owner}` !== `${req.user._id}`) {
    return next(new AppError("Forbidden", 403));
  }

  note.title = req.body.title;
  note.content = req.body.content;
  await note.save();

  return res.status(200).json({ status: "success", data: note });
};

const deleteNote = async (req, res, next) => {
  const note = await Note.findById(req.params.id);
  if (!note) return next(new AppError("Note not found", 404));
  if (req.user.role !== "admin" && `${note.owner}` !== `${req.user._id}`) {
    return next(new AppError("Forbidden", 403));
  }

  await Note.findByIdAndDelete(req.params.id);
  return res.status(200).json({ status: "success", message: "Note deleted" });
};

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };
