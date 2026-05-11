import fileDb from '../utils/fileDb'

export interface Course {
  _id: string
  name: string
  code: string
  instructor: string
  description: string
  createdAt: string
  updatedAt: string
}

const COLLECTION = 'courses'

const findAll = (): Course[] => {
  return fileDb.readCollection(COLLECTION) as Course[]
}

const findById = (id: string): Course | undefined => {
  const courses = fileDb.readCollection(COLLECTION) as Course[]
  return courses.find((c: Course) => c._id === id)
}

const create = (data: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>) => {
  const courses = fileDb.readCollection(COLLECTION)
  const newCourse: Course = {
    ...data,
    _id: fileDb.generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  courses.push(newCourse)
  fileDb.writeCollection(COLLECTION, courses)
  return newCourse
}

const initializeDefaultCourses = () => {
  const courses = fileDb.readCollection(COLLECTION)
  if (courses.length === 0) {
    console.log('Initializing default courses...')
    const defaultCourses = [
      {
        name: 'Adult Health Nursing',
        code: 'NURS201',
        instructor: 'Dr. Jane Smith',
        description: 'Medical-surgical nursing for adults',
      },
      {
        name: 'Pediatric Nursing',
        code: 'NURS202',
        instructor: 'Dr. John Doe',
        description: 'Nursing care for children and adolescents',
      },
      {
        name: 'Critical Care Nursing',
        code: 'NURS301',
        instructor: 'Dr. Emily Johnson',
        description: 'Intensive care unit nursing',
      },
    ]
    defaultCourses.forEach((course) => create(course))
  }
}

export default {
  findAll,
  findById,
  create,
  initializeDefaultCourses,
}
