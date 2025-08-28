import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRole } from "../contexts/RoleContext";
import { useSession } from "../lib/auth";
import { PatientSearch, type Patient } from "../components/PatientSearch";
import { CreatePatientRecord } from "../components/CreatePatientRecord";
import { CreatePatient } from "../components/CreatePatient";

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
          <ReceptionistDashboard />
          
          {/* Nested routes will render here */}
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

function ReceptionistDashboard() {
  const [currentView, setCurrentView] = useState<'search' | 'createRecord' | 'createPatient'>('search');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [lastSearchedClinicId, setLastSearchedClinicId] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePatientFound = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('createRecord');
    setSuccessMessage(null);
  };

  const handlePatientNotFound = (clinicId: string) => {
    setLastSearchedClinicId(clinicId);
    setCurrentView('createPatient');
    setSuccessMessage(null);
  };

  const handlePatientCreated = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView('createRecord');
    setSuccessMessage(`Patient "${patient.first_name_encrypted} ${patient.last_name_encrypted}" created successfully!`);
  };

  const handlePatientRecordCreated = (patientRecord: any) => {
    setCurrentView('search');
    setSelectedPatient(null);
    setLastSearchedClinicId('');
    setSuccessMessage(`Patient record created successfully and assigned to ${patientRecord.user?.name || 'physician'}!`);
  };

  const handleCancel = () => {
    setCurrentView('search');
    setSelectedPatient(null);
    setLastSearchedClinicId('');
    setSuccessMessage(null);
  };

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-700 hover:text-green-800"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'search' && (
        <PatientSearch
          onPatientFound={handlePatientFound}
          onPatientNotFound={handlePatientNotFound}
        />
      )}

      {currentView === 'createRecord' && selectedPatient && (
        <CreatePatientRecord
          patient={selectedPatient}
          onSuccess={handlePatientRecordCreated}
          onCancel={handleCancel}
        />
      )}

      {currentView === 'createPatient' && lastSearchedClinicId && (
        <CreatePatient
          clinicId={lastSearchedClinicId}
          onSuccess={handlePatientCreated}
          onCancel={handleCancel}
        />
      )}

      {/* Help Text */}
      {currentView === 'search' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Patient Record Management
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Step 1:</strong> Enter the patient's clinic internal ID to search for existing records.
            </p>
            <p>
              <strong>Step 2:</strong> If the patient exists, you can create a new case and assign it to a physician.
            </p>
            <p>
              <strong>Step 3:</strong> If no patient is found, you'll be prompted to create a new patient record first.
            </p>
          </div>
          <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
            <p className="text-sm text-purple-700">
              All patient records are automatically scoped to your organization and tracked for audit purposes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}