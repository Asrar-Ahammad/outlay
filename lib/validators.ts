import { z } from 'zod'

// Account schema
export const AccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50),
  type: z.enum(['CASH', 'CARD', 'UPI', 'WALLET']),
  balance: z.number().int('Balance must be an integer (paise/cents)'),
  encryptedRef: z.string().optional().nullable(),
})

// Transaction schema
export const TransactionSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  amount: z.number().int().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  categoryId: z.string().optional().nullable(),
  merchant: z.string().max(100).optional().nullable(),
  date: z.coerce.date(),
  notes: z.string().max(500).optional().nullable(),
  tags: z.array(z.string()).default([]),
  receiptUrl: z.string().url().optional().nullable(),
  mood: z.enum(['HAPPY', 'NEUTRAL', 'REGRET', 'IMPULSE', 'STRESSED']).optional().nullable(),
})

// Budget schema
export const BudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  monthlyLimit: z.number().int().positive('Limit must be positive'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
})

// Goal schema
export const GoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100),
  targetAmount: z.number().int().positive('Target must be positive'),
  currentAmount: z.number().int().nonnegative().default(0),
  deadline: z.coerce.date().optional().nullable(),
})

// Debt schema
export const DebtSchema = z.object({
  name: z.string().min(1, 'Debt name is required').max(100),
  type: z.enum(['LOAN', 'CREDIT_CARD']),
  balance: z.number().int().nonnegative('Balance must be positive'),
  interestRate: z.number().nonnegative('Interest rate must be positive'),
  minPayment: z.number().int().nonnegative('Minimum payment must be positive'),
  dueDay: z.number().int().min(1).max(31).optional().nullable(),
})

// AI parsed transaction schema
export const AiTransactionParseSchema = z.object({
  amount: z.number().int().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  merchant: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  confidence: z.number().min(0).max(1).optional().default(1.0),
})
