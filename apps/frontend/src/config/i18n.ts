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
      label: string;
      title: string;
      description: string;
    };
    physician: {
      label: string;
      title: string;
      description: string;
    };
    receptionist: {
      label: string;
      title: string;
      description: string;
    };
    unverified: {
      label: string;
      title: string;
      description: string;
    };
  };

  // Navigation
  nav: {
    appName: string;
    signOut: string;
    switchRole: string;
    dashboard: string;
    invites: string;
    cases: string;
    team: string;
    settings: string;
    admin: string;
  };

  // Dashboard
  dashboard: {
    tabs: {
      invites: string;
      submissions: string;
      team: string;
    };
    patientInvites: string;
    redirecting: string;

    // Table columns
    columns: {
      submitted: string;
      patientName: string;
      dob: string;
      notes: string;
      firstViewed: string;
      status: string;
      actions: string;
      created: string;
      createdBy: string;
      internalId: string;
      inviteUrl: string;
      expires: string;
      name: string;
      email: string;
    };

    // Common values
    encrypted: string;
    noId: string;
    notViewed: string;
    never: string;
    system: string;
    verified: string;
    unverified: string;

    // Empty states
    emptyStates: {
      submissions: {
        title: string;
        description: string;
      };
      invites: {
        title: string;
        description: string;
      };
      users: {
        title: string;
        description: string;
      };
    };

    // Actions
    actions: {
      createNewInvite: string;
      createNewUser: string;
      openPatientRecord: string;
      editNotes: string;
      editUser: string;
      deleteUser: string;
      copyInviteUrl: string;
      openInvite: string;
      deleteInvite: string;
    };
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
  };
}

export const translations: Record<Language, I18nStrings> = {
  en: {
    nav: {
      appName: "CMDetect",
      signOut: "Sign Out",
      switchRole: "Switch Role",
      dashboard: "Dashboard",
      invites: "Invites",
      cases: "Cases",
      team: "Team",
      settings: "Settings",
      admin: "Admin",
    },

    roles: {
      org_admin: {
        label: "Organization Admin",
        title: "Organization Admin",
        description: "Manage users, settings, and system configuration",
      },
      physician: {
        label: "Physician",
        title: "Physician Portal",
        description: "View patient records and review questionnaires",
      },
      receptionist: {
        label: "Receptionist",
        title: "Reception Desk",
        description: "Manage patient records, appointments, and check-ins",
      },
      unverified: {
        label: "Unverified",
        title: "Account Verification",
        description: "Complete your account verification process",
      },
    },

    dashboard: {
      tabs: {
        invites: "Invites",
        submissions: "Submissions",
        team: "Team",
      },
      patientInvites: "Patient Invites",
      redirecting: "Redirecting to dashboard...",

      columns: {
        submitted: "Submitted",
        patientName: "Patient Name",
        dob: "DOB",
        notes: "Notes",
        firstViewed: "First Viewed",
        status: "Status",
        actions: "Actions",
        created: "Created",
        createdBy: "Created By",
        internalId: "Internal ID",
        inviteUrl: "Invite URL",
        expires: "Expires",
        name: "Name",
        email: "Email",
      },

      encrypted: "Encrypted",
      noId: "No ID",
      notViewed: "Not viewed",
      never: "Never",
      system: "System",
      verified: "Verified",
      unverified: "Unverified",

      emptyStates: {
        submissions: {
          title: "No submissions found",
          description:
            "Patient submissions will appear here when patients complete their questionnaires.",
        },
        invites: {
          title: "No invites found",
          description:
            "Patient invites will appear here. Create a new invite to get started.",
        },
        users: {
          title: "No users found",
          description:
            "Organization users will appear here. Create a new user to get started.",
        },
      },

      actions: {
        createNewInvite: "Create New Invite",
        createNewUser: "Create New User",
        openPatientRecord: "Open Patient Record",
        editNotes: "Edit Notes",
        editUser: "Edit User",
        deleteUser: "Delete User",
        copyInviteUrl: "Copy Invite URL",
        openInvite: "Open Invite",
        deleteInvite: "Delete Invite",
      },
    },

    messages: {
      noRolesAssigned: {
        title: "No Roles Assigned",
        description: "Contact your administrator to get role access.",
      },
      accountVerificationRequired: {
        title: "Account Verification Required",
        description:
          "Please verify your email address to access the dashboard.",
      },
      roleSwitched: "Switched to {role}",
      roleSwitchFailed: "Failed to switch role",
      signOutFailed: "Failed to sign out",
    },

    auth: {
      pleaseSignIn: "Please sign in to continue",
      signIn: "Sign In",
    },

    common: {
      loading: "Loading...",
      user: "User",
    },
  },

  de: {
    nav: {
      appName: "CMDetect",
      signOut: "Abmelden",
      switchRole: "Rolle wechseln",
      dashboard: "Dashboard",
      invites: "Einladungen",
      cases: "Fälle",
      team: "Team",
      settings: "Einstellungen",
      admin: "Admin",
    },

    roles: {
      org_admin: {
        label: "Organisationsadministrator",
        title: "Organisationsadministrator",
        description:
          "Benutzer, Einstellungen und Systemkonfiguration verwalten",
      },
      physician: {
        label: "Arzt",
        title: "Arztportal",
        description: "Patientenakten ansehen und Fragebögen überprüfen",
      },
      receptionist: {
        label: "Rezeption",
        title: "Empfang",
        description: "Patientenakten, Termine und Check-ins verwalten",
      },
      unverified: {
        label: "Nicht verifiziert",
        title: "Kontobestätigung",
        description: "Schließen Sie den Kontobestätigungsprozess ab",
      },
    },

    dashboard: {
      tabs: {
        invites: "Einladungen",
        submissions: "Einreichungen",
        team: "Team",
      },
      patientInvites: "Patienteneinladungen",
      redirecting: "Weiterleitung zum Dashboard...",

      columns: {
        submitted: "Eingereicht",
        patientName: "Patientenname",
        dob: "Geburtsdatum",
        notes: "Notizen",
        firstViewed: "Erstmals angesehen",
        status: "Status",
        actions: "Aktionen",
        created: "Erstellt",
        createdBy: "Erstellt von",
        internalId: "Interne ID",
        inviteUrl: "Einladungs-URL",
        expires: "Läuft ab",
        name: "Name",
        email: "E-Mail",
      },

      encrypted: "Verschlüsselt",
      noId: "Keine ID",
      notViewed: "Nicht angesehen",
      never: "Nie",
      system: "System",
      verified: "Verifiziert",
      unverified: "Nicht verifiziert",

      emptyStates: {
        submissions: {
          title: "Keine Einreichungen gefunden",
          description:
            "Patienteneinreichungen erscheinen hier, wenn Patienten ihre Fragebögen ausfüllen.",
        },
        invites: {
          title: "Keine Einladungen gefunden",
          description:
            "Patienteneinladungen erscheinen hier. Erstellen Sie eine neue Einladung, um zu beginnen.",
        },
        users: {
          title: "Keine Benutzer gefunden",
          description:
            "Organisationsbenutzer erscheinen hier. Erstellen Sie einen neuen Benutzer, um zu beginnen.",
        },
      },

      actions: {
        createNewInvite: "Neue Einladung erstellen",
        createNewUser: "Neuen Benutzer erstellen",
        openPatientRecord: "Patientenakte öffnen",
        editNotes: "Notizen bearbeiten",
        editUser: "Benutzer bearbeiten",
        deleteUser: "Benutzer löschen",
        copyInviteUrl: "Einladungs-URL kopieren",
        openInvite: "Einladung öffnen",
        deleteInvite: "Einladung löschen",
      },
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
          "Bitte bestätigen Sie Ihre E-Mail-Adresse, um auf das Dashboard zuzugreifen.",
      },
      roleSwitched: "Zu {role} gewechselt",
      roleSwitchFailed: "Rollenwechsel fehlgeschlagen",
      signOutFailed: "Abmeldung fehlgeschlagen",
    },

    auth: {
      pleaseSignIn: "Bitte melden Sie sich an, um fortzufahren",
      signIn: "Anmelden",
    },

    common: {
      loading: "Laden...",
      user: "Benutzer",
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
