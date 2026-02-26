import { Outlet, createRootRoute } from '@tanstack/react-router'
import { RoleProvider } from '../contexts/RoleContext'
import { KeySetupProvider } from '../contexts/KeySetupContext'
import { Toaster } from '@/components/ui/sonner'

function RootComponent() {
  return (
    <RoleProvider>
      <KeySetupProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Outlet />
          <Toaster richColors closeButton />
        </div>
      </KeySetupProvider>
    </RoleProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
