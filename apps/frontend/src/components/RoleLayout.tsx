import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useSession } from '../lib/auth'
import { useRole, type UserRole } from '../contexts/RoleContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft, 
  Shield, 
  Stethoscope, 
  UserCheck, 
  AlertTriangle
} from 'lucide-react'
import { DashboardLayout } from './Navigation'

interface RoleLayoutProps {
  requiredRole: UserRole
  title: string
  description: string
  navigationItems: Array<{
    label: string
    href: string
    active?: boolean
  }>
  children: React.ReactNode
}

const roleConfig = {
  org_admin: {
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeColor: 'bg-red-100 text-red-800',
    loadingColor: 'border-red-600',
  },
  physician: {
    icon: Stethoscope,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-100 text-green-800',
    loadingColor: 'border-green-600',
  },
  receptionist: {
    icon: UserCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800',
    loadingColor: 'border-blue-600',
  },
  unverified: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeColor: 'bg-amber-100 text-amber-800',
    loadingColor: 'border-amber-600',
  },
}

function LoadingState({ role }: { role: UserRole }) {
  const config = roleConfig[role]
  const Icon = config.icon
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Icon className={`h-8 w-8 ${config.color} animate-pulse`} />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </div>
      </div>
    </div>
  )
}

function AccessDeniedCard({ role, hasAuth }: { role: UserRole, hasAuth: boolean }) {
  const config = roleConfig[role]
  const Icon = config.icon

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className={`${config.borderColor} ${config.bgColor}`}>
          <CardContent className="p-6 text-center space-y-4">
            <Icon className={`h-12 w-12 ${config.color} mx-auto`} />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                {hasAuth ? 'Access Denied' : 'Authentication Required'}
              </h2>
              <p className="text-muted-foreground">
                {hasAuth 
                  ? `You don't have permission to access ${role.replace('_', ' ')} features.`
                  : `Please sign in to access ${role.replace('_', ' ')} features.`
                }
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function RoleLayout({ requiredRole, title, description, navigationItems, children }: RoleLayoutProps) {
  const { data: session } = useSession()
  const { activeRole, switchRole, hasRole, isLoading } = useRole()
  const config = roleConfig[requiredRole]
  const Icon = config.icon

  // Auto-switch to required role when accessing role routes
  useEffect(() => {
    if (session?.user && hasRole(requiredRole) && activeRole !== requiredRole) {
      console.log(`Auto-switching to ${requiredRole} role for ${requiredRole} routes`)
      switchRole(requiredRole)
    }
  }, [session, hasRole, activeRole, switchRole, requiredRole])

  // Show loading state while switching roles
  if (isLoading) {
    return <LoadingState role={requiredRole} />
  }

  // Check authentication and authorization
  if (!session?.user) {
    return <AccessDeniedCard role={requiredRole} hasAuth={false} />
  }

  if (!hasRole(requiredRole)) {
    return <AccessDeniedCard role={requiredRole} hasAuth={true} />
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Role Header */}
        <div className="border-b bg-background">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Icon className={`h-6 w-6 ${config.color}`} />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <Badge className={config.badgeColor}>
                {activeRole === requiredRole ? `${title} Mode` : 'Role Loading...'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {navigationItems.length > 0 && (
          <div className="border-b">
            <div className="container">
              <nav className="flex space-x-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      item.active
                        ? `border-primary text-primary`
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container pb-8">
          {children}
        </div>
      </div>
    </DashboardLayout>
  )
}

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: any
  title: string
  description: string
  action?: React.ReactNode 
}) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: any
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">{title}</h3>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          {(description || trend) && (
            <div className="flex items-center text-xs text-muted-foreground">
              {trend && (
                <span className={`mr-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
              {description && <span>{description}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}