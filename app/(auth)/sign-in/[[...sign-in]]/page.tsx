import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-xl flex items-center justify-center">
        <SignIn appearance={{
          elements: {
            card: 'bg-transparent border-0 shadow-none',
            headerTitle: 'text-zinc-100 font-extrabold',
            headerSubtitle: 'text-zinc-400',
            socialButtonsBlockButton: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700',
            socialButtonsBlockButtonText: 'text-zinc-200 font-medium',
            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg hover:shadow-indigo-500/20',
            formFieldLabel: 'text-zinc-300 font-medium',
            formFieldInput: 'bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:ring-indigo-500',
            footerActionText: 'text-zinc-400',
            footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-semibold',
            identityPreviewText: 'text-zinc-300',
            identityPreviewEditButton: 'text-indigo-400 hover:text-indigo-300',
          }
        }} />
      </div>
    </div>
  )
}
