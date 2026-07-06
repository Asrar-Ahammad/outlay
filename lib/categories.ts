export interface DefaultCategory {
  name: string
  icon: string
  color: string
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
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
