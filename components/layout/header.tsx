'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { Bell, List } from '@phosphor-icons/react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'
import { usePathname } from 'next/navigation'

export function Header() {
  const { user } = useUser()
  const pathname = usePathname()

  // Dynamic Page Title
  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard'
    if (pathname.startsWith('/accounts')) return 'Accounts'
    if (pathname.startsWith('/transactions')) return 'Transactions'
    if (pathname.startsWith('/budgets')) return 'Budgets'
    if (pathname.startsWith('/goals')) return 'Goals'
    if (pathname.startsWith('/debts')) return 'Debts'
    if (pathname.startsWith('/insights')) return 'Insights & Analytics'
    if (pathname.startsWith('/chat')) return 'Conversational AI'
    if (pathname.startsWith('/settings')) return 'Settings'
    return 'Outlay'
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <Sheet>
          <SheetTrigger
            render={
              <button aria-label="Open navigation menu" className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 md:hidden transition-colors">
                <List size={24} />
              </button>
            }
          />
          <SheetContent side="left" className="w-64 p-0 border-r border-zinc-800 bg-zinc-950">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <Sidebar className="flex" />
          </SheetContent>
        </Sheet>

        <h2 className="text-lg font-semibold text-white tracking-tight md:text-xl">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Bell notification icon */}
        <button aria-label="View notifications" className="relative rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors">
          <Bell size={20} />
          {/* Notifications dot */}
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-zinc-950" />
        </button>

        {/* User profile section */}
        <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
          <div className="hidden flex-col items-end text-right md:flex">
            <span className="text-xs font-semibold text-zinc-200">{user?.fullName || 'User'}</span>
            <span className="text-[10px] font-medium text-zinc-500">Premium Account</span>
          </div>
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: 'h-8 w-8 border border-zinc-700 hover:scale-105 transition-transform duration-200',
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}
