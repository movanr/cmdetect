import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { RoleProvider } from '../contexts/RoleContext'

function RootComponent() {
  return (
    <RoleProvider>
      <div className="min-h-screen bg-gray-100">
        <Outlet />
        <TanStackRouterDevtools />
      </div>
    </RoleProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
