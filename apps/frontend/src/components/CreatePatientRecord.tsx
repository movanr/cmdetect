import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "../graphql/execute";
import { getOrganizationPhysicians, createPatientRecord } from "../queries/receptionist";
import type { Patient } from "./PatientSearch";
import type { CreatePatientRecordMutationVariables } from "../graphql/graphql";


interface CreatePatientRecordProps {
  patient: Patient;
  onSuccess: (patientRecord: any) => void;
  onCancel: () => void;
}

export function CreatePatientRecord({ patient, onSuccess, onCancel }: CreatePatientRecordProps) {
  const [selectedPhysician, setSelectedPhysician] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch organization physicians for assignment dropdown using useQuery
  const {
    data: physiciansData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["organizationPhysicians"],
    queryFn: () => execute(getOrganizationPhysicians),
  });

  const physicians = physiciansData?.user || [];


  // Create patient record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: { patient_id: string; assigned_to: string; notes: string }) => {
      const variables: CreatePatientRecordMutationVariables = {
        patientRecord: {
          patient_id: data.patient_id,
          assigned_to: data.assigned_to,
          notes: data.notes
        }
      };
      const result = await execute(createPatientRecord, variables);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["organizationPhysicians"] });
      onSuccess(data.insert_patient_record_one);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : "Failed to create patient record");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPhysician || !notes.trim()) {
      setError("Please select a physician and enter notes");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createRecordMutation.mutateAsync({
        patient_id: patient.id,
        assigned_to: selectedPhysician,
        notes: notes.trim()
      });
    } catch (err) {
      // Error is handled by mutation onError
    } finally {
      setIsSubmitting(false);
    }
  };

  if (usersLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading physicians...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Create Patient Record
      </h3>
      
      {/* Patient Information Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Clinic ID:</span>
            <span className="ml-2 font-medium">{patient.clinic_internal_id}</span>
          </div>
          <div>
            <span className="text-gray-600">Name:</span>
            <span className="ml-2 font-medium">
              {patient.first_name_encrypted} {patient.last_name_encrypted}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Date of Birth:</span>
            <span className="ml-2 font-medium">{patient.date_of_birth_encrypted}</span>
          </div>
          <div>
            <span className="text-gray-600">Gender:</span>
            <span className="ml-2 font-medium">{patient.gender_encrypted}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="physician" className="block text-sm font-medium text-gray-700 mb-1">
            Assign to Physician *
          </label>
          <select
            id="physician"
            value={selectedPhysician}
            onChange={(e) => setSelectedPhysician(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
          >
            <option value="">Select a physician</option>
            {physicians.map((physician) => (
              <option key={physician.id} value={physician.id}>
                {physician.firstName && physician.lastName 
                  ? `${physician.firstName} ${physician.lastName}` 
                  : physician.email} ({physician.email})
              </option>
            ))}
          </select>
          {physicians.length === 0 && !usersLoading && (
            <p className="mt-1 text-sm text-amber-600">
              No physicians found in this organization
            </p>
          )}
          {usersError && (
            <p className="mt-1 text-sm text-red-600">
              Error loading physicians: {usersError instanceof Error ? usersError.message : "Failed to load physicians"}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Case Notes *
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter initial case notes or reason for consultation..."
            required
            rows={4}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !selectedPhysician || !notes.trim()}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Record...
              </div>
            ) : (
              "Create Patient Record"
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}