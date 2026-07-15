import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import Patient from '../../models/FileBasedPatient'
import Account from '../../models/FileBasedAccount'
import fileDb from '../../utils/fileDb'

// Admin-only: append an instructor comment to a single nursing note. The commenter's
// identity is resolved server-side from the authenticated account (never trusted from
// the client) so attribution can't be forged.
const addNoteComment: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        content: joi.instance.string().min(1).max(5000).required(),
      },
      req.body,
    )
    if (validationError) return next(validationError)

    const patient = Patient.findById(req.params.id as string)
    if (!patient) return next({ statusCode: 404, message: 'Patient not found' })

    const idx = patient.nursingNotes.findIndex((n) => n._id === req.params.noteId)
    if (idx === -1) return next({ statusCode: 404, message: 'Note not found' })

    const note = patient.nursingNotes[idx]
    if ((note.instructorComments || []).length >= 500) {
      return next({ statusCode: 400, message: 'Comment limit reached for this note.' })
    }

    // Resolve commenter identity from the authenticated account.
    const acct = req.auth?.uid ? Account.findById(req.auth.uid) : undefined
    const author =
      [acct?.firstName, acct?.lastName].filter(Boolean).join(' ').trim() ||
      acct?.username ||
      'Instructor'
    const authorRole =
      acct?.role === 'instructor'
        ? 'Instructor'
        : acct?.role === 'administrator' || acct?.role === 'admin'
          ? 'Administrator'
          : 'Instructor'

    const { content } = req.body || {}
    const comment = {
      _id: fileDb.generateId(),
      timestamp: new Date().toISOString(),
      author,
      authorRole,
      content: String(content),
    }

    patient.nursingNotes[idx] = {
      ...note,
      instructorComments: [...(note.instructorComments || []), comment],
    }

    const updated = Patient.update(req.params.id as string, patient)
    res.status(200).json({ message: 'Comment added', data: updated })
  } catch (error) {
    next(error)
  }
}

export default addNoteComment
