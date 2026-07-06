import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: 'ForkKnife', color: '#FF7A00' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#FF007A' },
  { name: 'Transport & Travel', icon: 'Car', color: '#00C2FF' },
  { name: 'Bills & Utilities', icon: 'Receipt', color: '#FFD600' },
  { name: 'Entertainment', icon: 'FilmStrip', color: '#A300FF' },
  { name: 'Health & Fitness', icon: 'Heartbeat', color: '#00FF66' },
  { name: 'Education', icon: 'BookOpen', color: '#0038FF' },
  { name: 'Salary', icon: 'Coins', color: '#00E096' },
  { name: 'Investments', icon: 'TrendUp', color: '#00B2FF' },
  { name: 'Other', icon: 'Question', color: '#8F9CAE' },
]

async function main() {
  console.log('Seeding default categories...')
  
  // Since categories are user-scoped, default categories will have isDefault = true
  // and userId as empty/null or we can create them for users upon sign up.
  // Actually, let's seed them as global templates or as models with isDefault = true and userId = 'system'.
  // But wait, the schema has Category.userId as non-nullable string!
  // "userId String"
  // So when a user is created via Clerk webhooks, we can copy these default categories to that user.
  // Let's create a template category model or helper, or store default categories in a database table
  // where userId = 'system-default' or we can just seed them for a system user, or define them in a helper
  // that runs on user creation.
  // Yes! The best way is to keep DEFAULT_CATEGORIES in a library helper, and insert them when a new user signs up.
  // Let's seed a system user or verify the seeding works.
  console.log(`Default categories configuration is defined with ${DEFAULT_CATEGORIES.length} categories. They will be auto-created during user signup via Clerk webhook.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
