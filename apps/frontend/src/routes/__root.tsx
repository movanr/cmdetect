import { Outlet, createRootRoute } from '@tanstack/react-router'
import { RoleProvider } from '../contexts/RoleContext'
import { Toaster } from '@/components/ui/sonner'

function RootComponent() {
  return (
    <RoleProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
        <Toaster richColors closeButton />
      </div>
    </RoleProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
