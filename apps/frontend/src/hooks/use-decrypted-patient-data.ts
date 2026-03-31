import { useEffect, useState } from "react";
import { decryptPatientData, loadPrivateKey } from "@/crypto";
import type { PatientPII } from "@/crypto/types";
import { getDemoPatientName } from "@/features/patient-records/demo-patient-names";

interface UseDecryptedPatientDataOptions {
  isDemo?: boolean;
  clinicInternalId?: string;
}

export function useDecryptedPatientData(
  firstNameEncrypted: string | null | undefined,
  options?: UseDecryptedPatientDataOptions
): {
  decryptedData: PatientPII | null;
  isDecrypting: boolean;
} {
  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const isDemo = options?.isDemo ?? false;
  const clinicInternalId = options?.clinicInternalId ?? "";

  useEffect(() => {
    // Try decryption first (works for both real and demo-invite cases)
    if (firstNameEncrypted) {
      // fall through to decrypt below
    } else if (isDemo) {
      // Preset demo cases have no encrypted PII — use hardcoded name
      setDecryptedData(getDemoPatientName(clinicInternalId));
      return;
    } else {
      return;
    }

    const encryptedValue = firstNameEncrypted;
    setIsDecrypting(true);
    async function decrypt() {
      try {
        const privateKeyPem = await loadPrivateKey();
        if (!privateKeyPem) {
          console.warn("No private key found");
          return;
        }
        const patientData = await decryptPatientData(encryptedValue, privateKeyPem);
        setDecryptedData(patientData);
      } catch (error) {
        console.error("Failed to decrypt patient data:", error);
      } finally {
        setIsDecrypting(false);
      }
    }
    decrypt();
  }, [firstNameEncrypted, isDemo, clinicInternalId]);

  return { decryptedData, isDecrypting };
}
