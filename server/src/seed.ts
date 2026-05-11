import crypt from './utils/crypt'
import fileDb from './utils/fileDb'

const seedAccounts = async () => {
  console.log('🌱 Seeding test accounts...')

  const testAccounts = [
    { username: 'student1', password: 'password123', role: 'user' as const },
    { username: 'nurse_test', password: 'test123', role: 'user' as const },
    { username: 'instructor', password: 'instructor123', role: 'admin' as const },
  ]

  const accounts = []

  for (const account of testAccounts) {
    const hashedPassword = await crypt.hash(account.password)
    accounts.push({
      _id: fileDb.generateId(),
      username: account.username,
      password: hashedPassword,
      role: account.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  fileDb.writeCollection('accounts', accounts)
  console.log('✅ Test accounts created:')
  testAccounts.forEach((acc) => {
    console.log(`   - ${acc.username} / ${acc.password}`)
  })
}

seedAccounts()
  .then(() => {
    console.log('✅ Seeding complete!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  })
