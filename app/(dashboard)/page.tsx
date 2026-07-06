import { currentUser } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Sparkle,
  Plus,
  ChatCircleDots,
  HandWaving
} from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await currentUser()

  // Dummy statistics for the dashboard shell (will be replaced with actual DB calls in Phase 2)
  const stats = [
    {
      title: 'Net Balance',
      amount: '₹0.00',
      description: 'Across all accounts',
      icon: Wallet,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Monthly Income',
      amount: '₹0.00',
      description: 'This month',
      icon: ArrowUpRight,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Monthly Expenses',
      amount: '₹0.00',
      description: 'This month',
      icon: ArrowDownLeft,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome header with active layout animations */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-2">
            Welcome back, {user?.firstName || 'Friend'} 
            <span className="inline-block animate-bounce origin-bottom">
              <HandWaving size={28} className="text-amber-400" />
            </span>
          </h1>
          <p className="text-sm text-zinc-400 font-medium">
            Here&apos;s a breakdown of your finances and budget statuses.
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/transactions?add=true">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/20 flex items-center gap-1.5 font-medium transition-all duration-200">
              <Plus size={18} weight="bold" />
              <span>Add Transaction</span>
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 font-medium transition-all duration-200">
              <Sparkle size={18} weight="fill" className="text-indigo-400" />
              <span>Ask AI Advisor</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl hover:border-zinc-700/80 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-semibold text-zinc-400 tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg border ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-white tracking-tight md:text-3xl">
                  {stat.amount}
                </div>
                <p className="text-xs font-medium text-zinc-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Dashboard Widgets split */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Transactions placeholder widget */}
        <Card className="col-span-2 border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-white tracking-tight">
                Recent Transactions
              </CardTitle>
              <p className="text-xs text-zinc-500 font-medium">Your last recorded activities.</p>
            </div>
            <Link href="/transactions">
              <Button variant="link" className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold p-0">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="h-[250px] flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-full bg-zinc-800/50 text-zinc-500 mb-3 border border-zinc-700/50">
              <Plus size={24} />
            </div>
            <h3 className="text-sm font-bold text-zinc-300">No transactions recorded yet</h3>
            <p className="text-xs text-zinc-500 max-w-[250px] mt-1 font-medium">
              Create an account and start tracking your expenses manually or using natural language.
            </p>
          </CardContent>
        </Card>

        {/* AI Copilot mini widget */}
        <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkle size={16} weight="fill" />
              </div>
              <CardTitle className="text-base font-bold text-white tracking-tight">
                Outlay AI Copilot
              </CardTitle>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">Your personalized financial advisor.</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <p className="text-xs text-zinc-400 italic bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/80 leading-relaxed font-medium">
              &quot;Hi! I can help you analyze your spends, verify prices, predict cash flow, and split bills. Try asking me: &apos;How much did I spend on food?&apos;&quot;
            </p>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/chat">
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 font-medium text-xs py-5 transition-all duration-200 flex items-center justify-center gap-1.5">
                <ChatCircleDots size={16} />
                <span>Start Chatting</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
