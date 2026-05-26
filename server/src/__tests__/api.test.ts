import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../utils/app'
import { registerRoutes } from '../routes'
import fileDb from '../utils/fileDb'

beforeAll(() => {
  registerRoutes(app)
  fileDb.init()
})

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
})
