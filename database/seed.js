// database/seed.js
// Run this once after docker-compose up to populate the database
// with demo accounts and sample vehicles.
// Usage: node database/seed.js

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb://root:localdevpassword@localhost:27017/nvr_db?authSource=admin'

const SEED_PASSWORD = process.env.SEED_PASSWORD
if (!SEED_PASSWORD) {
  console.error('❌ SEED_PASSWORD environment variable is not set.')
  console.error('   Create a .env.local file with SEED_PASSWORD=yourpassword')
  process.exit(1)
}

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String,
  role: String, isActive: { type: Boolean, default: true }
}, { timestamps: true })

const vehicleSchema = new mongoose.Schema({
  ownerName: String, nationalId: String, phone: String,
  address: String, make: String, model: String,
  year: Number, color: String, engineNumber: String,
  chassisNumber: String, status: { type: String, default: 'pending' },
  submittedBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
const Vehicle = mongoose.model('Vehicle', vehicleSchema)

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB for seeding...')

  await User.deleteMany({})
  await Vehicle.deleteMany({})
  console.log('Cleared existing data')

  const hashed = await bcrypt.hash(SEED_PASSWORD, 10)

  const staff = await User.create({
    name: 'Staff User', email: 'staff@nvr.gov',
    password: hashed, role: 'staff'
  })
  const admin = await User.create({
    name: 'Admin User', email: 'admin@nvr.gov',
    password: hashed, role: 'admin'
  })
  await User.create({
    name: 'Super Admin', email: 'superadmin@nvr.gov',
    password: hashed, role: 'superadmin'
  })

  console.log('✅ Created 3 users')

  await Vehicle.create([
    {
      ownerName: 'Emeka Okafor', nationalId: '11223344556',
      phone: '08011223344', address: '5 Broad Street, Lagos',
      make: 'Toyota', model: 'Camry', year: 2021,
      color: 'Silver', engineNumber: 'ENG-SEED-001',
      chassisNumber: 'CHS-SEED-001', status: 'pending',
      submittedBy: staff._id,
    },
    {
      ownerName: 'Ngozi Adeyemi', nationalId: '99887766554',
      phone: '08099887766', address: '12 Victoria Island, Lagos',
      make: 'Honda', model: 'Accord', year: 2020,
      color: 'Black', engineNumber: 'ENG-SEED-002',
      chassisNumber: 'CHS-SEED-002', status: 'pending',
      submittedBy: staff._id,
    },
    {
      ownerName: 'Chukwudi Eze', nationalId: '55443322110',
      phone: '08055443322', address: '9 Independence Avenue, Abuja',
      make: 'Mercedes', model: 'C-Class', year: 2022,
      color: 'White', engineNumber: 'ENG-SEED-003',
      chassisNumber: 'CHS-SEED-003', status: 'pending',
      submittedBy: admin._id,
    },
  ])

  console.log('✅ Created 3 sample vehicles in pending state')
  console.log('✅ Seed complete — check .env.local for credentials')

  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})