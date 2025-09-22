import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { RoleProvider } from '../contexts/RoleContext'
import { Toaster } from '@/components/ui/sonner'

function RootComponent() {
  return (
    <RoleProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
        <Toaster richColors closeButton />
        <TanStackRouterDevtools />
      </div>
    </RoleProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
