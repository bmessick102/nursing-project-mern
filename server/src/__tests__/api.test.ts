import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../utils/app'
import { registerRoutes } from '../routes'
import fileDb from '../utils/fileDb'
import Patient from '../models/FileBasedPatient'

beforeAll(() => {
  registerRoutes(app)
  fileDb.init()
})

// Helper: register a fresh student and return its bearer token.
const newStudentToken = async (): Promise<string> => {
  const res = await request(app)
    .post('/auth/register')
    .send({ username: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, password: 'a-very-strong-password' })
  return res.body.token
}

describe('API smoke tests', () => {
  it('GET /healthz returns 204', async () => {
    const res = await request(app).get('/healthz')
    expect(res.status).toBe(204)
  })

  it('rejects registration with a too-short password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'shortpw', password: 'short' })
    expect(res.status).toBe(400)
  })

  it('registers a valid user and returns a token', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'smokeuser', password: 'a-very-strong-password' })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    // Password must never be returned.
    expect(res.body.data?.password).toBeUndefined()
  })

  it('rejects login with wrong credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'smokeuser', password: 'definitely-wrong-pass' })
    expect([400, 401]).toContain(res.status)
  })

  it('blocks unauthenticated access to patients with 401', async () => {
    const res = await request(app).get('/patients')
    expect(res.status).toBe(401)
  })

  it('restricts the list-all-patients endpoint to administrators', async () => {
    const token = await newStudentToken()
    const res = await request(app).get('/patients').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('prevents a non-enrolled student from reading a patient by id (no IDOR)', async () => {
    // A patient bound to a course the student is not enrolled in.
    const patient = Patient.create({
      courseId: 'sec-course-not-enrolled',
      name: 'Security Fixture',
      age: 1,
      gender: 'Other',
      roomNumber: '000',
      diagnosis: [],
      allergies: [],
      medications: [],
    } as any)
    const token = await newStudentToken()
    const res = await request(app)
      .get(`/patients/${patient._id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('prevents a non-enrolled student from writing to a patient chart (no IDOR)', async () => {
    const patient = Patient.create({
      courseId: 'sec-course-not-enrolled',
      name: 'Security Fixture 2',
      age: 1,
      gender: 'Other',
      roomNumber: '000',
      diagnosis: [],
      allergies: [],
      medications: [],
    } as any)
    const token = await newStudentToken()
    const res = await request(app)
      .patch(`/patients/${patient._id}/vitals`)
      .set('Authorization', `Bearer ${token}`)
      .send({ temp: 99 })
    expect(res.status).toBe(403)
  })
})
