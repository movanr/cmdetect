import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "../graphql/execute";
import { createPatient } from "../queries/receptionist";
import type { Patient } from "./PatientSearch";
import type { CreatePatientMutationVariables, Patient_Insert_Input } from "../graphql/graphql";

interface CreatePatientProps {
  clinicId: string;
  onSuccess: (patient: Patient) => void;
  onCancel: () => void;
}

export function CreatePatient({ clinicId, onSuccess, onCancel }: CreatePatientProps) {
  const [formData, setFormData] = useState({
    first_name_encrypted: "",
    last_name_encrypted: "",
    date_of_birth_encrypted: "",
    gender_encrypted: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: Omit<Patient_Insert_Input, 'clinic_internal_id'>) => {
      const variables: CreatePatientMutationVariables = {
        patient: {
          clinic_internal_id: clinicId,
          ...patientData
        }
      };
      const result = await execute(createPatient, variables);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["searchPatient"] });
      if (data.insert_patient_one) {
        onSuccess(data.insert_patient_one as Patient);
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : "Failed to create patient");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.first_name_encrypted.trim() || 
        !formData.last_name_encrypted.trim() || 
        !formData.date_of_birth_encrypted.trim() || 
        !formData.gender_encrypted) {
      setError("All fields are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createPatientMutation.mutateAsync(formData);
    } catch (err) {
      // Error is handled by mutation onError
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Create New Patient
      </h3>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          No patient found with clinic ID: <span className="font-medium">{clinicId}</span>
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Create a new patient record to proceed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="clinic_id_display" className="block text-sm font-medium text-gray-700 mb-1">
            Clinic Internal ID
          </label>
          <input
            type="text"
            id="clinic_id_display"
            value={clinicId}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name_encrypted" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="first_name_encrypted"
              name="first_name_encrypted"
              value={formData.first_name_encrypted}
              onChange={handleChange}
              placeholder="Enter first name"
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="last_name_encrypted" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="last_name_encrypted"
              name="last_name_encrypted"
              value={formData.last_name_encrypted}
              onChange={handleChange}
              placeholder="Enter last name"
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="date_of_birth_encrypted" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            id="date_of_birth_encrypted"
            name="date_of_birth_encrypted"
            value={formData.date_of_birth_encrypted}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="gender_encrypted" className="block text-sm font-medium text-gray-700 mb-1">
            Gender *
          </label>
          <select
            id="gender_encrypted"
            name="gender_encrypted"
            value={formData.gender_encrypted}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> In production, personal information would be encrypted for security. 
            For testing purposes, this data is stored as placeholder values.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Patient...
              </div>
            ) : (
              "Create Patient"
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