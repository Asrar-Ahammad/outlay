import prisma from './prisma'

const DAILY_LIMIT = 50 // Max AI calls per user per day

/**
 * Checks if a user is within their daily AI usage limit.
 * If yes, increments the count and returns true. If no, returns false.
 * Uses atomic updates (updateMany with filters) to prevent concurrency race conditions.
 */
export async function checkAndIncrementAiUsage(userId: string, limit: number = DAILY_LIMIT): Promise<{
  allowed: boolean
  remaining: number
  limit: number
}> {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // 1. Atomically reset if the daily reset period (24 hours) has passed
  const resetResult = await prisma.user.updateMany({
    where: {
      id: userId,
      dailyAiCallsResetAt: { lt: oneDayAgo },
    },
    data: {
      dailyAiCalls: 1,
      dailyAiCallsResetAt: now,
    },
  })

  let allowed = true

  // 2. If reset did not happen, try to atomically increment only if still below limit
  if (resetResult.count === 0) {
    const incrementResult = await prisma.user.updateMany({
      where: {
        id: userId,
        dailyAiCalls: { lt: limit },
      },
      data: {
        dailyAiCalls: { increment: 1 },
      },
    })

    // If no row was updated, it means the user either doesn't exist or is at/over the limit
    if (incrementResult.count === 0) {
      allowed = false
    }
  }

  // 3. Fetch current state to return exact remaining counts
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyAiCalls: true },
  })

  if (!user) {
    return { allowed: false, remaining: 0, limit }
  }

  return {
    allowed,
    remaining: Math.max(0, limit - user.dailyAiCalls),
    limit,
  }
}
