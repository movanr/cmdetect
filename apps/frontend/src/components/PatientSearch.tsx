import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { execute } from "../graphql/execute";
import { searchPatientsByClinicId } from "../queries/receptionist";
import type { SearchPatientsByClinicIdQuery } from "../graphql/graphql";

// Type for individual patient from search results
export type Patient = SearchPatientsByClinicIdQuery['patient'][0];

interface PatientSearchProps {
  onPatientFound: (patient: Patient) => void;
  onPatientNotFound: (clinicId: string) => void;
}

export function PatientSearch({ onPatientFound, onPatientNotFound }: PatientSearchProps) {
  const [clinicId, setClinicId] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["searchPatient", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return null;
      
      const result = await execute(searchPatientsByClinicId, {
        clinicInternalId: searchQuery
      });
      
      return result;
    },
    enabled: !!searchQuery,
    retry: false, // Don't retry failed searches
  });

  // Handle search results when data changes or error occurs
  useEffect(() => {
    if (!searchQuery) return;
    
    if (error) {
      // If there's an error, treat it as patient not found
      onPatientNotFound(searchQuery);
      setSearchQuery(null);
    } else if (data !== undefined) {
      if (data?.patient && data.patient.length > 0) {
        onPatientFound(data.patient[0] as Patient);
      } else {
        onPatientNotFound(searchQuery);
      }
      setSearchQuery(null); // Reset search query after handling results
    }
  }, [data, error, searchQuery, onPatientFound, onPatientNotFound]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clinicId.trim()) return;
    
    setSearchQuery(clinicId.trim());
  };

  const handleReset = () => {
    setClinicId("");
    setSearchQuery(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Search Patient
      </h3>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="clinicId" className="block text-sm font-medium text-gray-700 mb-1">
            Clinic Internal ID
          </label>
          <input
            type="text"
            id="clinicId"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            placeholder="Enter patient's clinic ID"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading || !clinicId.trim()}
            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </div>
            ) : (
              "Search Patient"
            )}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="text-sm">
            Error searching for patient: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}
    </div>
  );
}