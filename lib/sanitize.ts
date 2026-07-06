import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitizes user input to prevent HTML/XSS injection.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags entirely
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitizes user input to mitigate LLM prompt injection risk.
 * Strips common injection patterns, system overrides, and characters.
 */
export function sanitizeLlmPrompt(input: string): string {
  if (!input) return ''
  
  // 1. Strip HTML/XML elements
  let cleaned = sanitizeHtml(input)
  
  // 2. Normalize whitespace and strip weird control characters
  cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '')
  
  // 3. Detect and neutralize common prompt injection vectors
  const injectionPatterns = [
    /ignore\s+(any\s+)?previous\s+instructions/gi,
    /system\s+prompt/gi,
    /you\s+are\s+now\s+a/gi,
    /new\s+role/gi,
    /override\s+rules/gi,
    /forget\s+everything/gi,
    /stop\s+being\s+an\s+assistant/gi,
  ]
  
  for (const pattern of injectionPatterns) {
    cleaned = cleaned.replace(pattern, '[neutralized directive]')
  }
  
  return cleaned.trim()
}
