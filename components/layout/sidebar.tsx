'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  House, 
  CreditCard, 
  Receipt, 
  ChartPieSlice,
  Flag, 
  Bank, 
  ChatCircleDots, 
  ChartBar, 
  Gear,
  SignOut,
  Sparkle
} from '@phosphor-icons/react'
import { SignOutButton } from '@clerk/nextjs'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard', href: '/', icon: House },
    { label: 'Accounts', href: '/accounts', icon: CreditCard },
    { label: 'Transactions', href: '/transactions', icon: Receipt },
    { label: 'Budgets', href: '/budgets', icon: ChartPieSlice },
    { label: 'Goals', href: '/goals', icon: Flag },
    { label: 'Debts', href: '/debts', icon: Bank },
    { label: 'AI Insights', href: '/insights', icon: ChartBar },
    { label: 'Settings', href: '/settings', icon: Gear },
  ]

  return (
    <aside className={cn(
      "hidden md:flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-200",
      className
    )}>
      {/* Brand logo header */}
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/30">
          <Sparkle size={20} weight="fill" className="text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">Outlay</h1>
          <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">AI Expense Tracker</p>
        </div>
      </div>

      {/* Primary Navigation links */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-zinc-800 text-white shadow-sm" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              )}
            >
              <Icon 
                size={20} 
                weight={isActive ? "fill" : "regular"} 
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400"
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Floating AI Chat Trigger */}
      <div className="px-4 py-2">
        <Link href="/chat">
          <Button 
            variant="default"
            className={cn(
              "w-full flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg hover:shadow-indigo-500/20 py-5 transition-all duration-300",
              pathname === '/chat' && "ring-2 ring-indigo-400"
            )}
          >
            <ChatCircleDots size={20} weight="fill" />
            <span>Ask Outlay AI</span>
          </Button>
        </Link>
      </div>

      {/* Sidebar Footer with Sign Out */}
      <div className="border-t border-zinc-800 p-4">
        <SignOutButton>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-900 hover:text-rose-400 transition-all duration-200">
            <SignOut size={20} />
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  )
}
