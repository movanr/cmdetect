/**
 * Internationalization (i18n) configuration
 *
 * This file contains all user-facing text strings used throughout the application.
 * To add support for additional languages, create a new language object following
 * the same structure as `en`.
 */

export type Language = "en" | "de";

export interface I18nStrings {
  // Roles
  roles: {
    org_admin: {
      title: string;
    };
    physician: {
      title: string;
    };
    receptionist: {
      title: string;
    };
    unverified: {
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
    invited: string;
    submitted: string;
    viewed: string;
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
    clear: string;
    noResultsFound: string; // "No cases found matching {query}"
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
      team: "Team",
      settings: "Settings",
      admin: "Admin",
    },

    roles: {
      org_admin: {
        title: "Organization Admin",
      },
      physician: {
        title: "Practitioner",
      },
      receptionist: {
        title: "Receptionist",
      },
      unverified: {
        title: "Unverified",
      },
    },

    columns: {
      submitted: "Submitted",
      patientName: "Patient",
      dob: "DOB",
      firstViewed: "First Viewed",
      lastViewed: "Last Viewed",
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
      invited: "Invited",
      submitted: "Submitted",
      viewed: "Viewed",
    },

    emptyStates: {
      cases: {
        title: "No cases found",
        description:
          "Patient cases will appear here when patients submit their questionnaires.",
      },
      invites: {
        title: "No invites found",
        description:
          "Patient invites will appear here. Create a new invite to get started.",
      },
      team: {
        title: "No team members found",
        description:
          "Team members will appear here. Add a new team member to get started.",
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
        description:
          "Please verify your email address to access the application.",
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
      clear: "Clear",
      noResultsFound: 'No cases found matching "{query}"',
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
      settings: "Manage your account settings and preferences",
    },

    settingsSections: {
      profile: "Profile",
      security: "Security",
      organization: "Organization",
    },

    accessControl: {
      accessDenied: "Access Denied",
      adminPrivilegesRequired:
        "You need administrator privileges to access team management.",
    },
  },

  de: {
    nav: {
      appName: "CMDetect",
      signOut: "Abmelden",
      switchRole: "Rolle wechseln",
      invites: "Einladungen",
      cases: "Fälle",
      team: "Team",
      settings: "Einstellungen",
      admin: "Admin",
    },

    roles: {
      org_admin: {
        title: "Administrator",
      },
      physician: {
        title: "Behandler",
      },
      receptionist: {
        title: "Rezeption",
      },
      unverified: {
        title: "Nicht verifiziert",
      },
    },

    columns: {
      submitted: "Eingereicht",
      patientName: "Patient",
      dob: "Geburtsdatum",
      firstViewed: "Erstmals angesehen",
      lastViewed: "Zuletzt angesehen",
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
      invited: "Eingeladen",
      submitted: "Eingereicht",
      viewed: "Angesehen",
    },

    emptyStates: {
      cases: {
        title: "Keine Fälle gefunden",
        description:
          "Patientenfälle erscheinen hier, wenn Patienten ihre Fragebögen einreichen.",
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
        description:
          "Wenden Sie sich an Ihren Administrator, um Rollenzugriff zu erhalten.",
      },
      accountVerificationRequired: {
        title: "Kontobestätigung erforderlich",
        description:
          "Bitte bestätigen Sie Ihre E-Mail-Adresse, um auf die Anwendung zuzugreifen.",
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
      clear: "Löschen",
      noResultsFound: 'Keine Fälle gefunden für "{query}"',
    },

    indicators: {
      newSubmission: "Neue Einreichung",
    },

    passwordConfirmation: {
      title: "Passwort bestätigen",
      description:
        'Bitte geben Sie Ihr Passwort ein, um zur Rolle "{role}" zu wechseln.',
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
