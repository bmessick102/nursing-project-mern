import { type RequestHandler } from 'express'
import NoteTemplate from '../../models/FileBasedNoteTemplate'

const deleteNoteTemplate: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string
    const ok = NoteTemplate.remove(id)
    if (!ok) return next({ statusCode: 404, message: 'Template not found' })
    res.status(200).json({ message: 'Template deleted', data: { _id: id } })
  } catch (error) {
    next(error)
  }
}

export default deleteNoteTemplate
