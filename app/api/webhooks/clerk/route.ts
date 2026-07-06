import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { DEFAULT_CATEGORIES } from '@/lib/categories'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // Retrieve the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable')
    return new Response('Webhook Secret is not configured', {
      status: 500,
    })
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Apply rate limiting based on svix event ID to prevent DDoS or spam
  const rateLimitResult = await rateLimit(`clerk-webhook-${svix_id}`, 5, 60)
  if (!rateLimitResult.success) {
    return new Response('Too many requests for this event', { status: 429 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured during signature verification', {
      status: 400,
    })
  }

  // Get the ID and type
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Clerk Webhook received for event type: ${eventType} (User ID: ${id})`)

  try {
    if (eventType === 'user.created') {
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data
      const primaryEmailObj = email_addresses.find((email) => email.id === evt.data.primary_email_address_id)
      const email = primaryEmailObj ? primaryEmailObj.email_address : email_addresses[0]?.email_address

      if (!email) {
        return new Response('No email address found for user', { status: 400 })
      }

      const fullName = first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null

      // Create or update the user and their default categories inside a database transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
          where: { clerkId },
          update: {
            email,
            name: fullName,
            imageUrl: image_url || null,
          },
          create: {
            clerkId,
            email,
            name: fullName,
            imageUrl: image_url || null,
          },
        })

        // Idempotently create default categories for the user
        for (const cat of DEFAULT_CATEGORIES) {
          const existing = await tx.category.findFirst({
            where: {
              userId: user.id,
              name: cat.name,
            },
          })
          if (!existing) {
            await tx.category.create({
              data: {
                userId: user.id,
                name: cat.name,
                icon: cat.icon,
                color: cat.color,
                isDefault: true,
              },
            })
          }
        }
      })

      console.log(`Successfully synced user ${clerkId} to local DB (idempotent upsert).`)
    }

    if (eventType === 'user.updated') {
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data
      const primaryEmailObj = email_addresses.find((email) => email.id === evt.data.primary_email_address_id)
      const email = primaryEmailObj ? primaryEmailObj.email_address : email_addresses[0]?.email_address
      
      const fullName = first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null

      await prisma.user.upsert({
        where: { clerkId },
        update: {
          email: email || undefined,
          name: fullName,
          imageUrl: image_url || null,
        },
        create: {
          clerkId,
          email: email || '',
          name: fullName,
          imageUrl: image_url || null,
        },
      })
      console.log(`Successfully updated/upserted user ${clerkId} in local DB.`)
    }

    if (eventType === 'user.deleted') {
      const { id: clerkId } = evt.data
      
      // Check if user exists before deleting to make it idempotent
      const existingUser = await prisma.user.findUnique({
        where: { clerkId },
      })
      
      if (existingUser) {
        // Cascade delete is handled by database/Prisma constraint (onDelete: Cascade)
        await prisma.user.delete({
          where: { clerkId },
        })
        console.log(`Successfully deleted user ${clerkId} from local DB.`)
      } else {
        console.log(`User ${clerkId} already deleted or not found.`)
      }
    }

    return new Response('Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error('Error executing database operation inside webhook:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
