/**
 * Helper to check if a navigation item is currently active based on the current pathname.
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/'
  }
  return pathname === href || pathname.startsWith(href)
}
