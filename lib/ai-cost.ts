import prisma from './prisma'

const DAILY_LIMIT = 50 // Max AI calls per user per day

/**
 * Checks if a user is within their daily AI usage limit.
 * If yes, increments the count and returns true. If no, returns false.
 */
export async function checkAndIncrementAiUsage(userId: string, limit: number = DAILY_LIMIT): Promise<{
  allowed: boolean
  remaining: number
  limit: number
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyAiCalls: true, dailyAiCallsResetAt: true },
  })

  if (!user) {
    return { allowed: false, remaining: 0, limit }
  }

  const now = new Date()
  const resetAt = new Date(user.dailyAiCallsResetAt)
  
  // Check if reset period (24 hours) has passed
  const isNewDay = now.getTime() - resetAt.getTime() >= 24 * 60 * 60 * 1000

  if (isNewDay) {
    // Reset usage for new day
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyAiCalls: 1,
        dailyAiCallsResetAt: now,
      },
    })
    return { allowed: true, remaining: limit - 1, limit }
  }

  if (user.dailyAiCalls >= limit) {
    return { allowed: false, remaining: 0, limit }
  }

  // Increment usage
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      dailyAiCalls: {
        increment: 1,
      },
    },
    select: { dailyAiCalls: true },
  })

  return {
    allowed: true,
    remaining: Math.max(0, limit - updatedUser.dailyAiCalls),
    limit,
  }
}
