import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRole } from "../contexts/RoleContext";
import { useSession } from "../lib/auth";

export const Route = createFileRoute("/receptionist")({
  beforeLoad: ({ context }) => {
    // This will be called before the component loads
    // We can use this for role validation
  },
  component: ReceptionistLayout,
});

function ReceptionistLayout() {
  const { data: session } = useSession();
  const { activeRole, switchRole, hasRole, isLoading } = useRole();

  // Automatically switch to receptionist role when accessing receptionist routes
  useEffect(() => {
    if (session?.user && hasRole('receptionist') && activeRole !== 'receptionist') {
      console.log('Auto-switching to receptionist role for receptionist routes');
      switchRole('receptionist');
    }
  }, [session, hasRole, activeRole, switchRole]);

  // Show loading state while switching roles
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Switching to receptionist mode...</p>
        </div>
      </div>
    );
  }

  // Check if user has access to receptionist routes
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access receptionist features.</p>
        </div>
      </div>
    );
  }

  if (!hasRole('receptionist')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access receptionist features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Receptionist Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Reception Desk</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {activeRole === 'receptionist' ? 'Receptionist Mode' : 'Role Loading...'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {session.user?.name || session.user?.email || 'User'}
            </div>
          </div>
        </div>
      </header>

      {/* Receptionist Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            <a href="#" className="text-gray-900 hover:text-purple-600 font-medium">
              New Patient
            </a>
            <a href="#" className="text-gray-600 hover:text-purple-600">
              Patient Records
            </a>
            <a href="#" className="text-gray-600 hover:text-purple-600">
              Appointments
            </a>
            <a href="#" className="text-gray-600 hover:text-purple-600">
              Assignments
            </a>
          </div>
        </div>
      </nav>

      {/* Receptionist Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Reception Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Current Role: <span className="font-medium text-gray-900">{activeRole}</span>
            </p>
            <p className="text-gray-600">
              This is the receptionist interface. Here you can create new patient records, 
              manage appointments, and handle case assignments to physicians.
            </p>
            
            {/* Nested routes will render here */}
            <div className="mt-6">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}