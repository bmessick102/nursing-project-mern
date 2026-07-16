import { type RequestHandler } from 'express'
import NoteTemplate from '../../models/FileBasedNoteTemplate'

const listNoteTemplates: RequestHandler = async (req, res, next) => {
  try {
    const courseId = req.query.courseId as string | undefined

    const data =
      courseId !== undefined && courseId !== null && String(courseId) !== ''
        ? NoteTemplate.findUsable(String(courseId))
        : NoteTemplate.findAll().filter((t) => t.courseId === null)

    res.status(200).json({ message: 'Successfully retrieved note templates', data })
  } catch (error) {
    next(error)
  }
}

export default listNoteTemplates
