'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  House, 
  Receipt, 
  ChatCircleDots, 
  ChartBar, 
  Gear 
} from '@phosphor-icons/react'

export function MobileNav() {
  const pathname = usePathname()

  const items = [
    { label: 'Home', href: '/', icon: House },
    { label: 'Txns', href: '/transactions', icon: Receipt },
    { label: 'AI Chat', href: '/chat', icon: ChatCircleDots, isMiddle: true },
    { label: 'Insights', href: '/insights', icon: ChartBar },
    { label: 'Settings', href: '/settings', icon: Gear },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-lg px-2 pb-safe-bottom">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          if (item.isMiddle) {
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/30 text-white transition-transform active:scale-95 duration-200"
              >
                <Icon size={28} weight="fill" />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-12 py-1 text-center transition-colors duration-200",
                isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon size={22} weight={isActive ? "fill" : "regular"} />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
