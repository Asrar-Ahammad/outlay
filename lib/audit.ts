import prisma from './prisma'
import { AuditAction } from '@prisma/client'

/**
 * Creates an audit log entry in the database.
 * Does not throw on failure to prevent breaking the main transaction flow.
 */
export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  oldValue = null,
  newValue = null,
}: {
  userId: string
  action: AuditAction
  entity: string
  entityId: string
  oldValue?: unknown
  newValue?: unknown
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldValue: oldValue !== undefined && oldValue !== null ? JSON.parse(JSON.stringify(oldValue)) : null,
        newValue: newValue !== undefined && newValue !== null ? JSON.parse(JSON.stringify(newValue)) : null,
      },
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}
