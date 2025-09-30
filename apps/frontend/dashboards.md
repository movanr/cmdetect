### Definitions

- patient record status
  - consent_denied (patient_consent.consent_given == false)
  - viewed (first_viewed_at !== null)
  - submitted (patient_data_completed_at != null)
  - expired (invite_expires_at <= now)
  - pending
- invites (patient_records that have status consent_denied, expired or pending)
- submissions (patient records that have status submitted or viewed)

### Functions

- open patient record (patient record)
  - opens core application with the respective questionnaire responses, adds examination questionnaire response in the process
  - updates first_viewed_at to current time if it is null
  - updates first_viewed_by to current user if it is null
  - updates last_activity_at to current time (should be renamed to last_viewed_at)
  - updates last_activity_by to current user (should be renamed to last_viewed_by)

### Admin view

- invites
  - created_at
  - created_by
  - clinic_internal_id
  - invite_token or url
  - invite_expires_at
  - notes
  - status
  - functionality
    - create new invite (clinic_internal_id, notes),
    - update invite (notes, clinic_internal_id)
    - recreate invite (creates new invite with selected invites clinic_internal_id and notes, deletes old invite)
    - (soft) delete invite

- submissions
  - submitted_at (= patient_data_completed_at)
  - first_name (decrypted)
  - last_name (decrypted)
  - date_of_birth (decrypted)
  - notes
  - status
  - functionality
    - update patient record (clinic_internal_id, notes, patient_data)
- users (isAnonymous == false)
  - created_at
  - first_name
  - last_name
  - email
  - roles

  - functionality
    - create user (email, first_name, last_name, roles),
      - password management?
    - update user (roles, first_name, last_name, email)
    - (soft) delete user

- Key-setup
  - can manually trigger new key setup
  - regenerate recovery file / mnemonic

### physician view

- invites
  - same as admin
- submissions
  - same as admin +
  - functionality
    - open patient record

### receptionist view

- invites
  - same as physician

### user settings

- each user can view and update their own user data (first_name, last_name, email)
- each user can update their password
