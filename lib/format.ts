// Mapping of currencies to their standard locales for formatting
const CURRENCY_LOCALE_MAP: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CAD: 'en-CA',
  AUD: 'en-AU',
}

/**
 * Format base units (paise/cents) to decimal currency display
 * @param amountInBaseUnits Number of base units (e.g. 100 paise = 1 Rupee)
 * @param currencyCode Three-letter currency code (e.g., 'INR', 'USD')
 */
export function formatCurrency(amountInBaseUnits: number, currencyCode: string = 'INR'): string {
  let cleanCurrency = (currencyCode || 'INR').toUpperCase().trim()
  if (cleanCurrency.length !== 3) {
    cleanCurrency = 'INR'
  }

  const locale = CURRENCY_LOCALE_MAP[cleanCurrency] || 'en-US'
  
  // Note: JPY does not have fractional subunits (like cents).
  // But our DB stores base units as if everything has 100 subunits for consistency,
  // or we can handle zero-decimal currencies. Standard is that for zero-decimal
  // currencies, 1 base unit = 1 currency unit. Let's check JPY.
  const isZeroDecimal = ['JPY', 'KRW', 'VND'].includes(cleanCurrency)
  const divisor = isZeroDecimal ? 1 : 100
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cleanCurrency,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(amountInBaseUnits / divisor)
  } catch (error) {
    console.error(`Intl.NumberFormat failed for locale ${locale} and currency ${cleanCurrency}:`, error)
    // Fallback to INR
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountInBaseUnits / 100)
  }
}

/**
 * Parse a decimal currency string input to integer base units (paise/cents)
 * @param input Text input e.g. "12.50" or "12"
 * @param currencyCode Three-letter currency code
 */
export function parseToBaseUnits(input: string | number, currencyCode: string = 'INR'): number {
  if (typeof input === 'number') {
    return Math.round(input)
  }
  
  const cleanInput = input.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleanInput)
  if (isNaN(parsed)) return 0
  
  const isZeroDecimal = ['JPY', 'KRW', 'VND'].includes(currencyCode.toUpperCase())
  const multiplier = isZeroDecimal ? 1 : 100
  
  return Math.round(parsed * multiplier)
}

/**
 * Formats a date to standard display formats
 */
export function formatDate(date: Date | string, formatStyle: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  if (formatStyle === 'relative') {
    const diffMs = Date.now() - d.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
  }
  
  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: formatStyle === 'long' ? 'long' : 'short',
    year: 'numeric',
  })
  
  return formatter.format(d)
}
