import fileDb from '../utils/fileDb'

const COLLECTION = 'noteTemplates'

export interface NoteTemplate {
  _id: string
  name: string
  courseId: string | null // null = global (all courses)
  format: 'freetext' | 'soap'
  content?: string
  soap?: { subjective?: string; objective?: string; assessment?: string; plan?: string }
  defaultRole?: string // e.g. 'RN', 'Physician (MD)'
  defaultType?: string // e.g. 'Progress Note'
  createdBy: string
  createdAt: string
  updatedAt: string
}

const readAll = (): NoteTemplate[] => fileDb.readCollection(COLLECTION) as NoteTemplate[]

const findAll = (): NoteTemplate[] => readAll()

const findById = (id: string): NoteTemplate | undefined => {
  return readAll().find((t) => t._id === id)
}

const findUsable = (courseId: string): NoteTemplate[] => {
  return readAll().filter((t) => t.courseId === null || t.courseId === courseId)
}

const create = (
  data: Omit<NoteTemplate, '_id' | 'createdAt' | 'updatedAt'>,
): NoteTemplate => {
  const templates = readAll()
  const now = new Date().toISOString()
  const newTemplate: NoteTemplate = {
    ...data,
    _id: fileDb.generateId(),
    createdAt: now,
    updatedAt: now,
  }
  templates.push(newTemplate)
  fileDb.writeCollection(COLLECTION, templates)
  return newTemplate
}

const update = (id: string, patch: Partial<NoteTemplate>): NoteTemplate | undefined => {
  const templates = readAll()
  const idx = templates.findIndex((t) => t._id === id)
  if (idx === -1) return undefined
  templates[idx] = {
    ...templates[idx],
    ...patch,
    _id: templates[idx]._id,
    createdAt: templates[idx].createdAt,
    updatedAt: new Date().toISOString(),
  }
  fileDb.writeCollection(COLLECTION, templates)
  return templates[idx]
}

const remove = (id: string): boolean => {
  const templates = readAll()
  const filtered = templates.filter((t) => t._id !== id)
  const existed = filtered.length !== templates.length
  fileDb.writeCollection(COLLECTION, filtered)
  return existed
}

export default {
  findAll,
  findById,
  findUsable,
  create,
  update,
  remove,
}
