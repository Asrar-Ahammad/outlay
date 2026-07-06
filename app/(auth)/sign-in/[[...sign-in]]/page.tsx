import { SignIn } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { clerkAppearance } from '@/lib/clerk-theme'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-4">
      <Card className="w-full max-w-md overflow-hidden border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-6 flex items-center justify-center">
          <SignIn appearance={clerkAppearance} />
        </CardContent>
      </Card>
    </div>
  )
}
