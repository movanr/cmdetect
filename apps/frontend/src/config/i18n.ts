/**
 * Internationalization (i18n) configuration
 *
 * This file contains all user-facing text strings used throughout the application.
 * To add support for additional languages, create a new language object following
 * the same structure as `en`.
 */

import { roles } from "@cmdetect/config";

export type Language = "en" | "de";

export interface I18nStrings {
  // Roles
  roles: {
    [roles.ORG_ADMIN]: {
      title: string;
    };
    [roles.PHYSICIAN]: {
      title: string;
    };
    [roles.ASSISTANT]: {
      title: string;
    };
    [roles.RECEPTIONIST]: {
      title: string;
    };
    [roles.UNVERIFIED]: {
      title: string;
    };
  };

  // Navigation
  nav: {
    appName: string;
    signOut: string;
    switchRole: string;
    invites: string;
    cases: string;
    patients: string;
    team: string;
    settings: string;
    admin: string;
  };

  // Table columns (shared across views)
  columns: {
    submitted: string;
    patientName: string;
    dob: string;
    firstViewed: string;
    lastViewed: string;
    lastViewedBy: string;
    status: string;
    actions: string;
    created: string;
    createdBy: string;
    internalId: string;
    inviteUrl: string;
    expires: string;
    name: string;
    email: string;
    role: string;
  };

  // Common values (shared across views)
  commonValues: {
    encrypted: string;
    noId: string;
    notViewed: string;
    never: string;
    system: string;
    verified: string;
    unverified: string;
  };

  // Status values
  status: {
    pending: string;
    submitted: string;
    viewed: string;
    expired: string;
    consent_denied: string;
    new: string;
  };

  // Empty states (shared across views)
  emptyStates: {
    cases: {
      title: string;
      description: string;
    };
    invites: {
      title: string;
      description: string;
    };
    team: {
      title: string;
      description: string;
    };
  };

  // Actions (shared across views)
  actions: {
    createNewInvite: string;
    createNewUser: string;
    openPatientRecord: string;
    deletePatientRecord: string;
    editUser: string;
    deleteUser: string;
    copyInviteUrl: string;
    openInvite: string;
    deleteInvite: string;
  };

  // Messages
  messages: {
    noRolesAssigned: {
      title: string;
      description: string;
    };
    accountVerificationRequired: {
      title: string;
      description: string;
    };
    roleSwitched: string;
    roleSwitchFailed: string;
    signOutFailed: string;
    copiedToClipboard: string;
    deletedSuccessfully: string;
  };

  // Auth
  auth: {
    pleaseSignIn: string;
    signIn: string;
  };

  // Common
  common: {
    loading: string;
    user: string;
    unknown: string;
    active: string;
    by: string; // "by" as in "viewed by [user]"
  };

  // Loading states
  loadingStates: {
    decrypting: string;
    deleting: string;
    verifying: string;
  };

  // Search and filters
  search: {
    searchByInternalId: string;
    searchByIdOrName: string;
    clear: string;
    noResultsFound: string; // "No cases found matching {query}"
    noResultsForFilter: string; // "No results for the selected filter"
  };

  // Indicators
  indicators: {
    newSubmission: string;
  };

  // Password confirmation dialog
  passwordConfirmation: {
    title: string;
    description: string; // "Please enter your password to switch to role {role}"
    passwordLabel: string;
    passwordPlaceholder: string;
    cancel: string;
    confirm: string;
    verifying: string;
    incorrectPassword: string;
    verificationError: string;
  };

  // Page descriptions
  pageDescriptions: {
    cases: string;
    invites: string;
    patients: string;
    team: string;
    settings: string;
  };

  // Settings sections
  settingsSections: {
    profile: string;
    security: string;
    organization: string;
  };

  // Access control messages
  accessControl: {
    accessDenied: string;
    adminPrivilegesRequired: string;
    clinicalRoleRequired: string;
    clinicalRoleRequiredCanSwitch: string;
  };

  // Create invite page
  createInvite: {
    title: string;
    description: string;
    patientInternalId: string;
    patientInternalIdPlaceholder: string;
    patientInternalIdHint: string;
    patientInternalIdRequired: string;
    createButton: string;
    creating: string;
    cancel: string;
    successMessage: string;
    failedToCreate: string;
    copy: string;
    copyEmailText: string;
    emailTemplateLabel: string;
    emailTemplate: string;
    backToInvites: string;
    createAnother: string;
  };

  // Demo case
  demoCase: {
    badge: string;
    resetTooltip: string;
    resetSuccess: string;
  };

  // Examination
  examination: {
    behandlerLabel: string;
    selectBehandler: string;
    selectBehandlerGate: string;
  };

  // Key setup
  keySetup: {
    // Loading
    loading: string;

    // Admin generate step
    adminTitle: string;
    adminDescription: string;
    generateButton: string;
    generatingButton: string;

    // Download substep
    downloadTitle: string;
    downloadDescription: string;
    downloadWarning: string;
    downloadButton: string;

    // Mnemonic substep
    mnemonicTitle: string;
    mnemonicDescription: string;
    mnemonicWarning: string;
    revealButton: string;
    copyButton: string;
    completeSetupButton: string;
    completingSetupButton: string;

    // Recovery step
    recoveryTitle: string;
    recoveryDescription: string;
    recoverFromMnemonicTitle: string;
    recoverFromMnemonicPlaceholder: string;
    recoverFromMnemonicButton: string;
    recoverFromFileTitle: string;
    recoverFromFileHint: string;
    orDivider: string;
    mismatchWarning: string;

    // Waiting step
    waitingTitle: string;
    waitingDescription: string;
    waitingAlert: string;
    waitingAlertSwitchRole: string;
    waitingAdminInstructions: string;
    waitingAdminStep1: string;
    waitingAdminStep2: string;
    waitingAdminStep3: string;
    checkAgainButton: string;

    // Error step
    errorTitle: string;
    errorDescription: string;
    retryButton: string;
    revalidateButton: string;
    deleteKeyButton: string;
    deletingKeyButton: string;
    startRecoveryButton: string;
    checkKeysButton: string;

    // Key overwrite confirmation
    overwriteWarning: string;
    overwriteConfirmPrompt: string;

    // Toast messages
    toastKeysGenerated: string;
    toastKeysFailed: string;
    toastRecoveryDownloaded: string;
    toastRecoveryDownloadFailed: string;
    toastMnemonicCopied: string;
    toastMnemonicCopyFailed: string;
    toastSetupComplete: string;
    toastSetupFailed: string;
    toastKeyDeleted: string;
    toastKeyDeleteFailed: string;
    toastRecoveredFromMnemonic: string;
    toastRecoveredFromFile: string;
    toastRecoveryFailed: string;
    toastValidationFailed: string;
    toastKeyMismatch: string;
    toastOrgKeyMissing: string;
    toastEmptyMnemonic: string;

    // Org-load error step (network/GraphQL failure fetching organization key)
    orgLoadErrorTitle: string;
    orgLoadErrorDescription: string;
    orgLoadErrorRetry: string;
  };

  // Case workflow steps
  caseSteps: {
    caseLabel: string;
    patientIdLabel: string;
    closeCase: string;
    anamnesis: string;
    examination: string;
    evaluation: string;
    documentation: string;
  };
}

export const translations: Record<Language, I18nStrings> = {
  en: {
    nav: {
      appName: "CMDetect",
      signOut: "Sign Out",
      switchRole: "Switch Role",
      invites: "Invites",
      cases: "Cases",
      patients: "Patients",
      team: "Team",
      settings: "Settings",
      admin: "Admin",
    },

    roles: {
      [roles.ORG_ADMIN]: {
        title: "Organization Admin",
      },
      [roles.PHYSICIAN]: {
        title: "Practitioner",
      },
      [roles.ASSISTANT]: {
        title: "Assistant",
      },
      [roles.RECEPTIONIST]: {
        title: "Receptionist",
      },
      [roles.UNVERIFIED]: {
        title: "Unverified",
      },
    },

    columns: {
      submitted: "Submitted",
      patientName: "Name",
      dob: "DOB",
      firstViewed: "First Viewed",
      lastViewed: "Last Viewed",
      lastViewedBy: "Last Viewed By",
      status: "Status",
      actions: "",
      created: "Created",
      createdBy: "Created By",
      internalId: "Internal ID",
      inviteUrl: "Invite URL",
      expires: "Expires",
      name: "Name",
      email: "Email",
      role: "Role",
    },

    commonValues: {
      encrypted: "Encrypted",
      noId: "No ID",
      notViewed: "Not viewed",
      never: "Never",
      system: "System",
      verified: "Verified",
      unverified: "Unverified",
    },

    status: {
      pending: "pending",
      consent_denied: "consent denied",
      submitted: "submitted",
      viewed: "viewed",
      expired: "expired",
      new: "new",
    },

    emptyStates: {
      cases: {
        title: "No cases found",
        description: "Patient cases will appear here when patients submit their questionnaires.",
      },
      invites: {
        title: "No invites found",
        description: "Patient invites will appear here. Create a new invite to get started.",
      },
      team: {
        title: "No team members found",
        description: "Team members will appear here. Add a new team member to get started.",
      },
    },

    actions: {
      createNewInvite: "Create New Invite",
      createNewUser: "Add Team Member",
      openPatientRecord: "Open Patient Record",
      deletePatientRecord: "Delete case",
      editUser: "Edit Team Member",
      deleteUser: "Remove Team Member",
      copyInviteUrl: "Copy Invite URL",
      openInvite: "Open Invite",
      deleteInvite: "Delete Invite",
    },

    messages: {
      noRolesAssigned: {
        title: "No Roles Assigned",
        description: "Contact your administrator to get role access.",
      },
      accountVerificationRequired: {
        title: "Account Verification Required",
        description: "Please verify your email address to access the application.",
      },
      roleSwitched: "Switched to {role}",
      roleSwitchFailed: "Failed to switch role",
      signOutFailed: "Failed to sign out",
      copiedToClipboard: "Copied to clipboard",
      deletedSuccessfully: "Deleted successfully",
    },

    auth: {
      pleaseSignIn: "Please sign in to continue",
      signIn: "Sign In",
    },

    common: {
      loading: "Loading...",
      user: "User",
      unknown: "Unknown",
      active: "Active",
      by: "by",
    },

    loadingStates: {
      decrypting: "Decrypting...",
      deleting: "Deleting...",
      verifying: "Verifying...",
    },

    search: {
      searchByInternalId: "Search by internal ID...",
      searchByIdOrName: "Search by internal ID or name...",
      clear: "Clear",
      noResultsFound: 'No cases found matching "{query}"',
      noResultsForFilter: "No results for the selected filter",
    },

    indicators: {
      newSubmission: "New submission",
    },

    passwordConfirmation: {
      title: "Confirm Password",
      description: 'Please enter your password to switch to role "{role}".',
      passwordLabel: "Password",
      passwordPlaceholder: "Enter password",
      cancel: "Cancel",
      confirm: "Confirm",
      verifying: "Verifying...",
      incorrectPassword: "Incorrect password",
      verificationError: "Password verification error",
    },

    pageDescriptions: {
      cases: "Review patient submissions and manage cases",
      invites: "Manage patient invitations and track their status",
      team: "Manage team members and their roles",
      patients: "Manage patient cases and invites",
      settings: "Manage your account settings and preferences",
    },

    settingsSections: {
      profile: "Profile",
      security: "Security",
      organization: "Organization",
    },

    accessControl: {
      accessDenied: "Access Denied",
      adminPrivilegesRequired: "You need administrator privileges to access team management.",
      clinicalRoleRequired: "Case details are only accessible to the \"Practitioner\" and \"Assistant\" roles.",
      clinicalRoleRequiredCanSwitch: "Case details are only accessible to the \"Practitioner\" and \"Assistant\" roles. You can switch your role in the menu.",
    },

    createInvite: {
      title: "Create New Invite",
      description: "Generate a new patient invitation link",
      patientInternalId: "Patient Internal ID",
      patientInternalIdPlaceholder: "e.g., PAT-2024-001",
      patientInternalIdHint: "A unique identifier for this patient in your clinic system",
      patientInternalIdRequired: "Patient internal ID is required",
      createButton: "Create Invite",
      creating: "Creating...",
      cancel: "Cancel",
      successMessage: "Invite created successfully",
      failedToCreate: "Failed to create invite",
      copy: "Copy",
      copyEmailText: "Copy Email Text",
      emailTemplateLabel: "Email text for patient",
      emailTemplate:
        "Sehr geehrte Patientin, sehr geehrter Patient,\n\nim Rahmen Ihres Termins in unserer Praxis bitten wir Sie, vorab einen Online-Fragebogen auszufüllen. Bitte klicken Sie dazu auf den folgenden Link:\n\n{url}\n\nBitte füllen Sie den Fragebogen möglichst vor Ihrem Termin aus. Ihre Angaben werden verschlüsselt übertragen und vertraulich behandelt.\n\nBei Fragen wenden Sie sich gerne an unser Praxisteam.\n\nMit freundlichen Grüßen\nIhr Praxisteam",
      backToInvites: "Back to Invites",
      createAnother: "Create Another",
    },

    demoCase: {
      badge: "Demo",
      resetTooltip: "Reset demo case (delete examination & evaluation data)",
      resetSuccess: "Demo case reset successfully",
    },

    examination: {
      behandlerLabel: "Examiner",
      selectBehandler: "Select examiner",
      selectBehandlerGate:
        "Please select the examining practitioner before starting the examination.",
    },

    keySetup: {
      loading: "Checking encryption setup…",

      adminTitle: "Encryption Setup",
      adminDescription: "Generate encryption keys for {org} to protect patient data.",
      generateButton: "Generate Keys",
      generatingButton: "Generating keys…",

      downloadTitle: "Download Recovery File",
      downloadDescription: "Save your encryption keys securely before proceeding.",
      downloadWarning:
        "You must download your recovery file before proceeding. This is the only way to recover your keys if you lose access to this device.",
      downloadButton: "Download Recovery File",

      mnemonicTitle: "Backup Recovery Phrase",
      mnemonicDescription: "Write down this 12-word phrase and store it securely.",
      mnemonicWarning:
        "This recovery phrase can be used to restore your keys. Store it in a secure location separate from your recovery file.",
      revealButton: "Reveal Recovery Phrase",
      copyButton: "Copy to Clipboard",
      completeSetupButton: "Complete Setup",
      completingSetupButton: "Completing setup…",

      recoveryTitle: "Recover Your Private Key",
      recoveryDescription: "Restore your private encryption key to access the application.",
      recoverFromMnemonicTitle: "Recover from Recovery Phrase",
      recoverFromMnemonicPlaceholder: "Enter your 12-word recovery phrase",
      recoverFromMnemonicButton: "Recover from Phrase",
      recoverFromFileTitle: "Recover from Recovery File",
      recoverFromFileHint: "Select the JSON recovery file downloaded during initial setup.",
      orDivider: "Or",
      mismatchWarning:
        "Your local private key doesn't match the organization's public key. Please recover the correct private key.",

      waitingTitle: "Setup Required by Administrator",
      waitingDescription: "Encryption has not been configured for {org}.",
      waitingAlert:
        "Your organization administrator needs to complete the initial encryption setup before you can access the application. Please contact your administrator.",
      waitingAlertSwitchRole:
        "You have administrator privileges. Switch to the administrator role to set up encryption.",
      waitingAdminInstructions: "What your administrator needs to do:",
      waitingAdminStep1: "Log in with admin privileges",
      waitingAdminStep2: "Complete the encryption setup",
      waitingAdminStep3: "Generate and secure the organization keys",
      checkAgainButton: "Check Again",

      errorTitle: "Setup Error",
      errorDescription: "An error occurred during the encryption setup process.",
      retryButton: "Retry Setup",
      revalidateButton: "Revalidate Keys",
      deleteKeyButton: "Delete Private Key",
      deletingKeyButton: "Deleting…",
      startRecoveryButton: "Start Key Recovery",
      checkKeysButton: "Check Keys Again",

      overwriteWarning:
        "This organization already has encryption keys set up.\n\nOverwriting existing keys will:\n• Break key recovery for users on new devices\n• Create encryption inconsistencies for new data\n• Require all users to set up new keys\n• Potentially cause data synchronization issues\n\nAre you sure you want to replace the existing keys?",
      overwriteConfirmPrompt:
        'Type "REPLACE" to confirm you want to replace the existing encryption keys:',

      toastKeysGenerated: "Organization keys generated successfully",
      toastKeysFailed: "Failed to generate keys",
      toastRecoveryDownloaded: "Recovery file downloaded successfully",
      toastRecoveryDownloadFailed: "Failed to download recovery file",
      toastMnemonicCopied: "Recovery phrase copied to clipboard",
      toastMnemonicCopyFailed: "Failed to copy recovery phrase",
      toastSetupComplete: "Encryption setup completed",
      toastSetupFailed: "Failed to complete setup",
      toastKeyDeleted: "Private key deleted successfully",
      toastKeyDeleteFailed: "Failed to delete private key",
      toastRecoveredFromMnemonic: "Keys recovered successfully from phrase",
      toastRecoveredFromFile: "Keys recovered successfully from file",
      toastRecoveryFailed: "Failed to recover keys",
      toastValidationFailed: "Failed to validate recovered key",
      toastKeyMismatch: "Recovered key does not match the organization's public key",
      toastOrgKeyMissing: "Organization public key not found. Please contact your administrator.",
      toastEmptyMnemonic: "Please enter a recovery phrase",

      orgLoadErrorTitle: "Couldn't load encryption setup",
      orgLoadErrorDescription:
        "We couldn't reach the server to check your organization's encryption keys. This is usually a temporary network issue, not a missing setup.",
      orgLoadErrorRetry: "Retry",
    },

    caseSteps: {
      caseLabel: "Case",
      patientIdLabel: "Patient ID",
      closeCase: "Close Case",
      anamnesis: "Anamnesis",
      examination: "Examination",
      evaluation: "Evaluation",
      documentation: "Documentation",
    },
  },

  de: {
    nav: {
      appName: "CMDetect",
      signOut: "Abmelden",
      switchRole: "Rolle wechseln",
      invites: "Einladungen",
      cases: "Fälle",
      patients: "Patienten",
      team: "Team",
      settings: "Einstellungen",
      admin: "Admin",
    },

    roles: {
      [roles.ORG_ADMIN]: {
        title: "Administrator",
      },
      [roles.PHYSICIAN]: {
        title: "Behandler",
      },
      [roles.ASSISTANT]: {
        title: "MFA",
      },
      [roles.RECEPTIONIST]: {
        title: "Empfang",
      },
      [roles.UNVERIFIED]: {
        title: "Nicht verifiziert",
      },
    },

    columns: {
      submitted: "Eingereicht",
      patientName: "Name",
      dob: "Geburtsdatum",
      firstViewed: "Erstmals angesehen",
      lastViewed: "Zuletzt angesehen",
      lastViewedBy: "Zuletzt angesehen von",
      status: "Status",
      actions: "",
      created: "Erstellt",
      createdBy: "Erstellt von",
      internalId: "Interne ID",
      inviteUrl: "Einladungs-URL",
      expires: "Läuft ab",
      name: "Name",
      email: "E-Mail",
      role: "Rolle",
    },

    commonValues: {
      encrypted: "Verschlüsselt",
      noId: "Keine ID",
      notViewed: "Nicht angesehen",
      never: "Nie",
      system: "System",
      verified: "Verifiziert",
      unverified: "Nicht verifiziert",
    },

    status: {
      pending: "ausstehend",
      expired: "abgelaufen",
      submitted: "eingereicht",
      viewed: "angesehen",
      consent_denied: "Einwilligung abgelehnt",
      new: "neu",
    },

    emptyStates: {
      cases: {
        title: "Keine Fälle gefunden",
        description: "Patientenfälle erscheinen hier, wenn Patienten ihre Fragebögen einreichen.",
      },
      invites: {
        title: "Keine Einladungen gefunden",
        description:
          "Patienteneinladungen erscheinen hier. Erstellen Sie eine neue Einladung, um zu beginnen.",
      },
      team: {
        title: "Keine Teammitglieder gefunden",
        description:
          "Teammitglieder erscheinen hier. Fügen Sie ein neues Teammitglied hinzu, um zu beginnen.",
      },
    },

    actions: {
      createNewInvite: "Neue Einladung erstellen",
      createNewUser: "Teammitglied hinzufügen",
      openPatientRecord: "Fall öffnen",
      deletePatientRecord: "Fall löschen",
      editUser: "Teammitglied bearbeiten",
      deleteUser: "Teammitglied entfernen",
      copyInviteUrl: "Einladungs-URL kopieren",
      openInvite: "Einladung öffnen",
      deleteInvite: "Einladung löschen",
    },

    messages: {
      noRolesAssigned: {
        title: "Keine Rollen zugewiesen",
        description: "Wenden Sie sich an Ihren Administrator, um Rollenzugriff zu erhalten.",
      },
      accountVerificationRequired: {
        title: "Kontobestätigung erforderlich",
        description: "Bitte bestätigen Sie Ihre E-Mail-Adresse, um auf die Anwendung zuzugreifen.",
      },
      roleSwitched: "Zu {role} gewechselt",
      roleSwitchFailed: "Rollenwechsel fehlgeschlagen",
      signOutFailed: "Abmeldung fehlgeschlagen",
      copiedToClipboard: "In Zwischenablage kopiert",
      deletedSuccessfully: "Erfolgreich gelöscht",
    },

    auth: {
      pleaseSignIn: "Bitte melden Sie sich an, um fortzufahren",
      signIn: "Anmelden",
    },

    common: {
      loading: "Laden...",
      user: "Benutzer",
      unknown: "Unbekannt",
      active: "Aktiv",
      by: "von",
    },

    loadingStates: {
      decrypting: "Entschlüsseln...",
      deleting: "Löschen...",
      verifying: "Überprüfen...",
    },

    search: {
      searchByInternalId: "Nach interner ID suchen...",
      searchByIdOrName: "Nach interner ID oder Name suchen...",
      clear: "Löschen",
      noResultsFound: 'Keine Fälle gefunden für "{query}"',
      noResultsForFilter: "Keine Ergebnisse für den gewählten Filter",
    },

    indicators: {
      newSubmission: "Neue Einreichung",
    },

    passwordConfirmation: {
      title: "Passwort bestätigen",
      description: 'Bitte geben Sie Ihr Passwort ein, um zur Rolle "{role}" zu wechseln.',
      passwordLabel: "Passwort",
      passwordPlaceholder: "Passwort eingeben",
      cancel: "Abbrechen",
      confirm: "Bestätigen",
      verifying: "Überprüfe...",
      incorrectPassword: "Falsches Passwort",
      verificationError: "Fehler bei der Passwortprüfung",
    },

    pageDescriptions: {
      cases: "Patientenfälle einsehen und verwalten",
      invites: "Patienteneinladungen verwalten und Status verfolgen",
      team: "Teammitglieder und ihre Rollen verwalten",
      patients: "Patientenfälle und Einladungen verwalten",
      settings: "Kontoeinstellungen und Präferenzen verwalten",
    },

    settingsSections: {
      profile: "Profil",
      security: "Sicherheit",
      organization: "Organisation",
    },

    accessControl: {
      accessDenied: "Zugriff verweigert",
      adminPrivilegesRequired:
        "Sie benötigen Administratorrechte, um auf die Teamverwaltung zuzugreifen.",
      clinicalRoleRequired:
        'Falldetails sind nur mit der Rolle \u201EBehandler\u201C oder \u201EMFA\u201C zugänglich.',
      clinicalRoleRequiredCanSwitch:
        'Falldetails sind nur mit der Rolle \u201EBehandler\u201C oder \u201EMFA\u201C zugänglich. Sie können Ihre Rolle im Menü wechseln.',
    },

    createInvite: {
      title: "Neue Einladung erstellen",
      description: "Einen neuen Einladungslink für Patienten generieren",
      patientInternalId: "Interne Patienten-ID",
      patientInternalIdPlaceholder: "z.B. PAT-2024-001",
      patientInternalIdHint: "Eine eindeutige Kennung für diesen Patienten in Ihrem Praxissystem",
      patientInternalIdRequired: "Interne Patienten-ID ist erforderlich",
      createButton: "Einladung erstellen",
      creating: "Wird erstellt...",
      cancel: "Abbrechen",
      successMessage: "Einladung erfolgreich erstellt",
      failedToCreate: "Einladung konnte nicht erstellt werden",
      copy: "Kopieren",
      copyEmailText: "E-Mail-Text kopieren",
      emailTemplateLabel: "E-Mail-Text für Patient/in",
      emailTemplate:
        "Sehr geehrte Patientin, sehr geehrter Patient,\n\nim Rahmen Ihres Termins in unserer Praxis bitten wir Sie, vorab einen Online-Fragebogen auszufüllen. Bitte klicken Sie dazu auf den folgenden Link:\n\n{url}\n\nBitte füllen Sie den Fragebogen möglichst vor Ihrem Termin aus. Ihre Angaben werden verschlüsselt übertragen und vertraulich behandelt.\n\nBei Fragen wenden Sie sich gerne an unser Praxisteam.\n\nMit freundlichen Grüßen\nIhr Praxisteam",
      backToInvites: "Zurück zu Einladungen",
      createAnother: "Weitere erstellen",
    },

    demoCase: {
      badge: "Demo",
      resetTooltip: "Beispielfall zurücksetzen",
      resetSuccess: "Beispielfall zurückgesetzt",
    },

    examination: {
      behandlerLabel: "Behandler",
      selectBehandler: "Behandler auswählen",
      selectBehandlerGate:
        "Bitte wählen Sie den untersuchenden Behandler aus, bevor Sie mit der Untersuchung beginnen.",
    },

    keySetup: {
      loading: "Verschlüsselung wird überprüft…",

      adminTitle: "Verschlüsselung einrichten",
      adminDescription:
        "Erstellen Sie die Verschlüsselungsschlüssel für {org}, um Patientendaten zu schützen.",
      generateButton: "Schlüssel generieren",
      generatingButton: "Schlüssel werden generiert…",

      downloadTitle: "Wiederherstellungsdatei herunterladen",
      downloadDescription: "Sichern Sie Ihre Schlüssel, bevor Sie fortfahren.",
      downloadWarning:
        "Sie müssen die Wiederherstellungsdatei herunterladen, bevor Sie fortfahren. Dies ist die einzige Möglichkeit, Ihre Schlüssel wiederherzustellen, wenn Sie den Zugriff auf dieses Gerät verlieren.",
      downloadButton: "Wiederherstellungsdatei herunterladen",

      mnemonicTitle: "Wiederherstellungsphrase sichern",
      mnemonicDescription: "Notieren Sie diese 12 Wörter und bewahren Sie sie sicher auf.",
      mnemonicWarning:
        "Diese Wiederherstellungsphrase kann zur Wiederherstellung Ihrer Schlüssel verwendet werden. Bewahren Sie sie an einem sicheren Ort getrennt von Ihrer Wiederherstellungsdatei auf.",
      revealButton: "Wiederherstellungsphrase anzeigen",
      copyButton: "In Zwischenablage kopieren",
      completeSetupButton: "Einrichtung abschließen",
      completingSetupButton: "Einrichtung wird abgeschlossen…",

      recoveryTitle: "Privaten Schlüssel wiederherstellen",
      recoveryDescription:
        "Stellen Sie Ihren privaten Schlüssel wieder her, um auf die Anwendung zuzugreifen.",
      recoverFromMnemonicTitle: "Aus Wiederherstellungsphrase",
      recoverFromMnemonicPlaceholder: "Geben Sie Ihre 12-Wort-Wiederherstellungsphrase ein",
      recoverFromMnemonicButton: "Aus Phrase wiederherstellen",
      recoverFromFileTitle: "Aus Wiederherstellungsdatei",
      recoverFromFileHint:
        "Wählen Sie die JSON-Wiederherstellungsdatei aus, die bei der Ersteinrichtung heruntergeladen wurde.",
      orDivider: "Oder",
      mismatchWarning:
        "Ihr lokaler privater Schlüssel stimmt nicht mit dem öffentlichen Schlüssel der Organisation überein. Bitte stellen Sie den richtigen privaten Schlüssel wieder her.",

      waitingTitle: "Einrichtung durch Administrator erforderlich",
      waitingDescription: "Die Verschlüsselung für {org} wurde noch nicht konfiguriert.",
      waitingAlert:
        "Der Administrator Ihrer Organisation muss die Verschlüsselungseinrichtung abschließen, bevor Sie auf die Anwendung zugreifen können. Bitte kontaktieren Sie Ihren Administrator.",
      waitingAlertSwitchRole:
        "Sie haben Administratorrechte. Wechseln Sie zur Administrator-Rolle, um die Verschlüsselung einzurichten.",
      waitingAdminInstructions: "Was Ihr Administrator tun muss:",
      waitingAdminStep1: "Mit Administratorrechten anmelden",
      waitingAdminStep2: "Die Verschlüsselungseinrichtung durchführen",
      waitingAdminStep3: "Organisationsschlüssel generieren und sichern",
      checkAgainButton: "Erneut prüfen",

      errorTitle: "Einrichtungsfehler",
      errorDescription: "Bei der Verschlüsselungseinrichtung ist ein Fehler aufgetreten.",
      retryButton: "Erneut versuchen",
      revalidateButton: "Schlüssel prüfen",
      deleteKeyButton: "Privaten Schlüssel löschen",
      deletingKeyButton: "Wird gelöscht…",
      startRecoveryButton: "Schlüsselwiederherstellung starten",
      checkKeysButton: "Schlüssel erneut prüfen",

      overwriteWarning:
        "Für diese Organisation sind bereits Verschlüsselungsschlüssel eingerichtet.\n\nDas Überschreiben bestehender Schlüssel wird:\n• Schlüsselwiederherstellung auf neuen Geräten unmöglich machen\n• Verschlüsselungsinkonsistenzen verursachen\n• Alle Benutzer zwingen, neue Schlüssel einzurichten\n• Möglicherweise Datensynchronisierungsprobleme verursachen\n\nMöchten Sie die bestehenden Schlüssel wirklich ersetzen?",
      overwriteConfirmPrompt:
        'Geben Sie "REPLACE" ein, um das Ersetzen der Verschlüsselungsschlüssel zu bestätigen:',

      toastKeysGenerated: "Organisationsschlüssel erfolgreich generiert",
      toastKeysFailed: "Schlüsselgenerierung fehlgeschlagen",
      toastRecoveryDownloaded: "Wiederherstellungsdatei erfolgreich heruntergeladen",
      toastRecoveryDownloadFailed: "Herunterladen der Wiederherstellungsdatei fehlgeschlagen",
      toastMnemonicCopied: "Wiederherstellungsphrase in Zwischenablage kopiert",
      toastMnemonicCopyFailed: "Kopieren der Wiederherstellungsphrase fehlgeschlagen",
      toastSetupComplete: "Verschlüsselungseinrichtung abgeschlossen",
      toastSetupFailed: "Einrichtung fehlgeschlagen",
      toastKeyDeleted: "Privater Schlüssel erfolgreich gelöscht",
      toastKeyDeleteFailed: "Löschen des privaten Schlüssels fehlgeschlagen",
      toastRecoveredFromMnemonic: "Schlüssel erfolgreich aus Phrase wiederhergestellt",
      toastRecoveredFromFile: "Schlüssel erfolgreich aus Datei wiederhergestellt",
      toastRecoveryFailed: "Schlüsselwiederherstellung fehlgeschlagen",
      toastValidationFailed: "Validierung des wiederhergestellten Schlüssels fehlgeschlagen",
      toastKeyMismatch:
        "Wiederhergestellter Schlüssel stimmt nicht mit dem Organisationsschlüssel überein",
      toastOrgKeyMissing:
        "Organisationsschlüssel nicht gefunden. Bitte kontaktieren Sie Ihren Administrator.",
      toastEmptyMnemonic: "Bitte geben Sie eine Wiederherstellungsphrase ein",

      orgLoadErrorTitle: "Verschlüsselungseinrichtung konnte nicht geladen werden",
      orgLoadErrorDescription:
        "Der Server konnte nicht erreicht werden, um die Verschlüsselungsschlüssel Ihrer Organisation zu prüfen. Dies ist in der Regel ein vorübergehendes Netzwerkproblem und kein fehlendes Setup.",
      orgLoadErrorRetry: "Erneut versuchen",
    },

    caseSteps: {
      caseLabel: "Fall",
      patientIdLabel: "Patienten-ID",
      closeCase: "Fall schließen",
      anamnesis: "Anamnese",
      examination: "Untersuchung",
      evaluation: "Auswertung",
      documentation: "Dokumentation",
    },
  },
};

// Current language - can be changed to support language switching
export const currentLanguage: Language = "de";

// Helper function to get current translations
export function getTranslations(): I18nStrings {
  return translations[currentLanguage];
}

// Helper function to interpolate variables in strings (e.g., "Switched to {role}")
export function interpolate(str: string, vars: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] || `{${key}}`);
}
