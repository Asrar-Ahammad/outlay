import prisma from '../lib/prisma'
import { DEFAULT_CATEGORIES } from '../lib/categories'

async function main() {
  console.log('Seeding default categories...')

  // Create or retrieve system user to hold global system-default templates
  const systemUser = await prisma.user.upsert({
    where: { clerkId: 'system' },
    update: {},
    create: {
      clerkId: 'system',
      email: 'system@outlay.local',
      name: 'System User',
    },
  })

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: systemUser.id,
        name: cat.name,
      },
    })

    if (!existing) {
      await prisma.category.create({
        data: {
          userId: systemUser.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
        },
      })
      console.log(`Created default category: ${cat.name}`)
    }
  }

  console.log(`Default categories seeding completed.`)
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
