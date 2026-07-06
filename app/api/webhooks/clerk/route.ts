import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { DEFAULT_CATEGORIES } from '@/lib/categories'

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

      // Create the user and their default categories inside a database transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            clerkId,
            email,
            name: fullName,
            imageUrl: image_url || null,
          },
        })

        // Bulk insert user-specific default categories
        await tx.category.createMany({
          data: DEFAULT_CATEGORIES.map((cat) => ({
            userId: user.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            isDefault: true,
          })),
        })
      })

      console.log(`Successfully synced user ${clerkId} to local DB and created default categories.`)
    }

    if (eventType === 'user.updated') {
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data
      const primaryEmailObj = email_addresses.find((email) => email.id === evt.data.primary_email_address_id)
      const email = primaryEmailObj ? primaryEmailObj.email_address : email_addresses[0]?.email_address
      
      const fullName = first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null

      await prisma.user.update({
        where: { clerkId },
        data: {
          email: email || undefined,
          name: fullName,
          imageUrl: image_url || null,
        },
      })
      console.log(`Successfully updated user ${clerkId} in local DB.`)
    }

    if (eventType === 'user.deleted') {
      const { id: clerkId } = evt.data
      
      // Cascade delete is handled by database/Prisma constraint (onDelete: Cascade)
      await prisma.user.delete({
        where: { clerkId },
      })
      console.log(`Successfully deleted user ${clerkId} from local DB.`)
    }

    return new Response('Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error('Error executing database operation inside webhook:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
