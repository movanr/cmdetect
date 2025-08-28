/* eslint-disable */
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  inet: { input: any; output: any; }
  jsonb: { input: any; output: any; }
  timestamp: { input: any; output: any; }
  timestamptz: { input: any; output: any; }
  uuid: { input: any; output: any; }
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

export type ConsentInput = {
  consent_given: Scalars['Boolean']['input'];
  consent_text: Scalars['String']['input'];
  consent_version: Scalars['String']['input'];
  ip_address?: InputMaybe<Scalars['String']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
};

export type ConsentResponse = {
  __typename?: 'ConsentResponse';
  error?: Maybe<Scalars['String']['output']>;
  patient_consent_id?: Maybe<Scalars['uuid']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type QuestionnaireResponseInput = {
  fhir_resource: Scalars['jsonb']['input'];
  patient_consent_id: Scalars['uuid']['input'];
};

export type QuestionnaireResponseResponse = {
  __typename?: 'QuestionnaireResponseResponse';
  error?: Maybe<Scalars['String']['output']>;
  questionnaire_response_id?: Maybe<Scalars['uuid']['output']>;
  success: Scalars['Boolean']['output'];
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** Boolean expression to compare columns of type "inet". All fields are combined with logical 'AND'. */
export type Inet_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['inet']['input']>;
  _gt?: InputMaybe<Scalars['inet']['input']>;
  _gte?: InputMaybe<Scalars['inet']['input']>;
  _in?: InputMaybe<Array<Scalars['inet']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['inet']['input']>;
  _lte?: InputMaybe<Scalars['inet']['input']>;
  _neq?: InputMaybe<Scalars['inet']['input']>;
  _nin?: InputMaybe<Array<Scalars['inet']['input']>>;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "organization" */
  delete_organization?: Maybe<Organization_Mutation_Response>;
  /** delete single row from the table: "organization" */
  delete_organization_by_pk?: Maybe<Organization>;
  /** delete data from the table: "patient" */
  delete_patient?: Maybe<Patient_Mutation_Response>;
  /** delete single row from the table: "patient" */
  delete_patient_by_pk?: Maybe<Patient>;
  /** delete data from the table: "patient_consent" */
  delete_patient_consent?: Maybe<Patient_Consent_Mutation_Response>;
  /** delete single row from the table: "patient_consent" */
  delete_patient_consent_by_pk?: Maybe<Patient_Consent>;
  /** delete data from the table: "patient_record" */
  delete_patient_record?: Maybe<Patient_Record_Mutation_Response>;
  /** delete single row from the table: "patient_record" */
  delete_patient_record_by_pk?: Maybe<Patient_Record>;
  /** delete data from the table: "questionnaire_response" */
  delete_questionnaire_response?: Maybe<Questionnaire_Response_Mutation_Response>;
  /** delete single row from the table: "questionnaire_response" */
  delete_questionnaire_response_by_pk?: Maybe<Questionnaire_Response>;
  /** delete data from the table: "user" */
  delete_user?: Maybe<User_Mutation_Response>;
  /** delete single row from the table: "user" */
  delete_user_by_pk?: Maybe<User>;
  /** insert data into the table: "organization" */
  insert_organization?: Maybe<Organization_Mutation_Response>;
  /** insert a single row into the table: "organization" */
  insert_organization_one?: Maybe<Organization>;
  /** insert data into the table: "patient" */
  insert_patient?: Maybe<Patient_Mutation_Response>;
  /** insert data into the table: "patient_consent" */
  insert_patient_consent?: Maybe<Patient_Consent_Mutation_Response>;
  /** insert a single row into the table: "patient_consent" */
  insert_patient_consent_one?: Maybe<Patient_Consent>;
  /** insert a single row into the table: "patient" */
  insert_patient_one?: Maybe<Patient>;
  /** insert data into the table: "patient_record" */
  insert_patient_record?: Maybe<Patient_Record_Mutation_Response>;
  /** insert a single row into the table: "patient_record" */
  insert_patient_record_one?: Maybe<Patient_Record>;
  /** insert data into the table: "questionnaire_response" */
  insert_questionnaire_response?: Maybe<Questionnaire_Response_Mutation_Response>;
  /** insert a single row into the table: "questionnaire_response" */
  insert_questionnaire_response_one?: Maybe<Questionnaire_Response>;
  /** insert data into the table: "user" */
  insert_user?: Maybe<User_Mutation_Response>;
  /** insert a single row into the table: "user" */
  insert_user_one?: Maybe<User>;
  submitPatientConsent: ConsentResponse;
  submitQuestionnaireResponse: QuestionnaireResponseResponse;
  /** update data of the table: "organization" */
  update_organization?: Maybe<Organization_Mutation_Response>;
  /** update single row of the table: "organization" */
  update_organization_by_pk?: Maybe<Organization>;
  /** update multiples rows of table: "organization" */
  update_organization_many?: Maybe<Array<Maybe<Organization_Mutation_Response>>>;
  /** update data of the table: "patient" */
  update_patient?: Maybe<Patient_Mutation_Response>;
  /** update single row of the table: "patient" */
  update_patient_by_pk?: Maybe<Patient>;
  /** update data of the table: "patient_consent" */
  update_patient_consent?: Maybe<Patient_Consent_Mutation_Response>;
  /** update single row of the table: "patient_consent" */
  update_patient_consent_by_pk?: Maybe<Patient_Consent>;
  /** update multiples rows of table: "patient_consent" */
  update_patient_consent_many?: Maybe<Array<Maybe<Patient_Consent_Mutation_Response>>>;
  /** update multiples rows of table: "patient" */
  update_patient_many?: Maybe<Array<Maybe<Patient_Mutation_Response>>>;
  /** update data of the table: "patient_record" */
  update_patient_record?: Maybe<Patient_Record_Mutation_Response>;
  /** update single row of the table: "patient_record" */
  update_patient_record_by_pk?: Maybe<Patient_Record>;
  /** update multiples rows of table: "patient_record" */
  update_patient_record_many?: Maybe<Array<Maybe<Patient_Record_Mutation_Response>>>;
  /** update data of the table: "questionnaire_response" */
  update_questionnaire_response?: Maybe<Questionnaire_Response_Mutation_Response>;
  /** update single row of the table: "questionnaire_response" */
  update_questionnaire_response_by_pk?: Maybe<Questionnaire_Response>;
  /** update multiples rows of table: "questionnaire_response" */
  update_questionnaire_response_many?: Maybe<Array<Maybe<Questionnaire_Response_Mutation_Response>>>;
  /** update data of the table: "user" */
  update_user?: Maybe<User_Mutation_Response>;
  /** update single row of the table: "user" */
  update_user_by_pk?: Maybe<User>;
  /** update multiples rows of table: "user" */
  update_user_many?: Maybe<Array<Maybe<User_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_OrganizationArgs = {
  where: Organization_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Organization_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_PatientArgs = {
  where: Patient_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Patient_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Patient_ConsentArgs = {
  where: Patient_Consent_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Patient_Consent_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Patient_RecordArgs = {
  where: Patient_Record_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Patient_Record_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Questionnaire_ResponseArgs = {
  where: Questionnaire_Response_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Questionnaire_Response_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_UserArgs = {
  where: User_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_By_PkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootInsert_OrganizationArgs = {
  objects: Array<Organization_Insert_Input>;
  on_conflict?: InputMaybe<Organization_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Organization_OneArgs = {
  object: Organization_Insert_Input;
  on_conflict?: InputMaybe<Organization_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_PatientArgs = {
  objects: Array<Patient_Insert_Input>;
  on_conflict?: InputMaybe<Patient_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Patient_ConsentArgs = {
  objects: Array<Patient_Consent_Insert_Input>;
  on_conflict?: InputMaybe<Patient_Consent_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Patient_Consent_OneArgs = {
  object: Patient_Consent_Insert_Input;
  on_conflict?: InputMaybe<Patient_Consent_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Patient_OneArgs = {
  object: Patient_Insert_Input;
  on_conflict?: InputMaybe<Patient_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Patient_RecordArgs = {
  objects: Array<Patient_Record_Insert_Input>;
  on_conflict?: InputMaybe<Patient_Record_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Patient_Record_OneArgs = {
  object: Patient_Record_Insert_Input;
  on_conflict?: InputMaybe<Patient_Record_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Questionnaire_ResponseArgs = {
  objects: Array<Questionnaire_Response_Insert_Input>;
  on_conflict?: InputMaybe<Questionnaire_Response_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Questionnaire_Response_OneArgs = {
  object: Questionnaire_Response_Insert_Input;
  on_conflict?: InputMaybe<Questionnaire_Response_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UserArgs = {
  objects: Array<User_Insert_Input>;
  on_conflict?: InputMaybe<User_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_OneArgs = {
  object: User_Insert_Input;
  on_conflict?: InputMaybe<User_On_Conflict>;
};


/** mutation root */
export type Mutation_RootSubmitPatientConsentArgs = {
  consent_data: ConsentInput;
  invite_token: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootSubmitQuestionnaireResponseArgs = {
  invite_token: Scalars['String']['input'];
  response_data: QuestionnaireResponseInput;
};


/** mutation root */
export type Mutation_RootUpdate_OrganizationArgs = {
  _set?: InputMaybe<Organization_Set_Input>;
  where: Organization_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Organization_By_PkArgs = {
  _set?: InputMaybe<Organization_Set_Input>;
  pk_columns: Organization_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Organization_ManyArgs = {
  updates: Array<Organization_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_PatientArgs = {
  _set?: InputMaybe<Patient_Set_Input>;
  where: Patient_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_By_PkArgs = {
  _set?: InputMaybe<Patient_Set_Input>;
  pk_columns: Patient_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_ConsentArgs = {
  _set?: InputMaybe<Patient_Consent_Set_Input>;
  where: Patient_Consent_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_Consent_By_PkArgs = {
  _set?: InputMaybe<Patient_Consent_Set_Input>;
  pk_columns: Patient_Consent_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_Consent_ManyArgs = {
  updates: Array<Patient_Consent_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_ManyArgs = {
  updates: Array<Patient_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_RecordArgs = {
  _set?: InputMaybe<Patient_Record_Set_Input>;
  where: Patient_Record_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_Record_By_PkArgs = {
  _set?: InputMaybe<Patient_Record_Set_Input>;
  pk_columns: Patient_Record_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_Record_ManyArgs = {
  updates: Array<Patient_Record_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Questionnaire_ResponseArgs = {
  _append?: InputMaybe<Questionnaire_Response_Append_Input>;
  _delete_at_path?: InputMaybe<Questionnaire_Response_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Questionnaire_Response_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Questionnaire_Response_Delete_Key_Input>;
  _prepend?: InputMaybe<Questionnaire_Response_Prepend_Input>;
  _set?: InputMaybe<Questionnaire_Response_Set_Input>;
  where: Questionnaire_Response_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Questionnaire_Response_By_PkArgs = {
  _append?: InputMaybe<Questionnaire_Response_Append_Input>;
  _delete_at_path?: InputMaybe<Questionnaire_Response_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Questionnaire_Response_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Questionnaire_Response_Delete_Key_Input>;
  _prepend?: InputMaybe<Questionnaire_Response_Prepend_Input>;
  _set?: InputMaybe<Questionnaire_Response_Set_Input>;
  pk_columns: Questionnaire_Response_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Questionnaire_Response_ManyArgs = {
  updates: Array<Questionnaire_Response_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_UserArgs = {
  _append?: InputMaybe<User_Append_Input>;
  _delete_at_path?: InputMaybe<User_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<User_Delete_Elem_Input>;
  _delete_key?: InputMaybe<User_Delete_Key_Input>;
  _prepend?: InputMaybe<User_Prepend_Input>;
  _set?: InputMaybe<User_Set_Input>;
  where: User_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_By_PkArgs = {
  _append?: InputMaybe<User_Append_Input>;
  _delete_at_path?: InputMaybe<User_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<User_Delete_Elem_Input>;
  _delete_key?: InputMaybe<User_Delete_Key_Input>;
  _prepend?: InputMaybe<User_Prepend_Input>;
  _set?: InputMaybe<User_Set_Input>;
  pk_columns: User_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_ManyArgs = {
  updates: Array<User_Updates>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

/** columns and relationships of "organization" */
export type Organization = {
  __typename?: 'organization';
  address_line1?: Maybe<Scalars['String']['output']>;
  address_line2?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** An array relationship */
  patient_consents: Array<Patient_Consent>;
  /** An aggregate relationship */
  patient_consents_aggregate: Patient_Consent_Aggregate;
  /** An array relationship */
  patient_records: Array<Patient_Record>;
  /** An aggregate relationship */
  patient_records_aggregate: Patient_Record_Aggregate;
  /** An array relationship */
  patients: Array<Patient>;
  /** An aggregate relationship */
  patients_aggregate: Patient_Aggregate;
  phone?: Maybe<Scalars['String']['output']>;
  postal_code?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  questionnaire_responses: Array<Questionnaire_Response>;
  /** An aggregate relationship */
  questionnaire_responses_aggregate: Questionnaire_Response_Aggregate;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An array relationship */
  users: Array<User>;
  /** An aggregate relationship */
  users_aggregate: User_Aggregate;
  website?: Maybe<Scalars['String']['output']>;
};


/** columns and relationships of "organization" */
export type OrganizationPatient_ConsentsArgs = {
  distinct_on?: InputMaybe<Array<Patient_Consent_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Consent_Order_By>>;
  where?: InputMaybe<Patient_Consent_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationPatient_Consents_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Consent_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Consent_Order_By>>;
  where?: InputMaybe<Patient_Consent_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationPatient_RecordsArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationPatient_Records_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationPatientsArgs = {
  distinct_on?: InputMaybe<Array<Patient_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Order_By>>;
  where?: InputMaybe<Patient_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationPatients_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Order_By>>;
  where?: InputMaybe<Patient_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationQuestionnaire_ResponsesArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationQuestionnaire_Responses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationUsersArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};

/** aggregated selection of "organization" */
export type Organization_Aggregate = {
  __typename?: 'organization_aggregate';
  aggregate?: Maybe<Organization_Aggregate_Fields>;
  nodes: Array<Organization>;
};

/** aggregate fields of "organization" */
export type Organization_Aggregate_Fields = {
  __typename?: 'organization_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Organization_Max_Fields>;
  min?: Maybe<Organization_Min_Fields>;
};


/** aggregate fields of "organization" */
export type Organization_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Organization_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "organization". All fields are combined with a logical 'AND'. */
export type Organization_Bool_Exp = {
  _and?: InputMaybe<Array<Organization_Bool_Exp>>;
  _not?: InputMaybe<Organization_Bool_Exp>;
  _or?: InputMaybe<Array<Organization_Bool_Exp>>;
  address_line1?: InputMaybe<String_Comparison_Exp>;
  address_line2?: InputMaybe<String_Comparison_Exp>;
  city?: InputMaybe<String_Comparison_Exp>;
  country?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  deleted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  patient_consents?: InputMaybe<Patient_Consent_Bool_Exp>;
  patient_consents_aggregate?: InputMaybe<Patient_Consent_Aggregate_Bool_Exp>;
  patient_records?: InputMaybe<Patient_Record_Bool_Exp>;
  patient_records_aggregate?: InputMaybe<Patient_Record_Aggregate_Bool_Exp>;
  patients?: InputMaybe<Patient_Bool_Exp>;
  patients_aggregate?: InputMaybe<Patient_Aggregate_Bool_Exp>;
  phone?: InputMaybe<String_Comparison_Exp>;
  postal_code?: InputMaybe<String_Comparison_Exp>;
  questionnaire_responses?: InputMaybe<Questionnaire_Response_Bool_Exp>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  users?: InputMaybe<User_Bool_Exp>;
  users_aggregate?: InputMaybe<User_Aggregate_Bool_Exp>;
  website?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "organization" */
export enum Organization_Constraint {
  /** unique or primary key constraint on columns "id" */
  OrganizationPkey = 'organization_pkey'
}

/** input type for inserting data into table "organization" */
export type Organization_Insert_Input = {
  address_line1?: InputMaybe<Scalars['String']['input']>;
  address_line2?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  patient_consents?: InputMaybe<Patient_Consent_Arr_Rel_Insert_Input>;
  patient_records?: InputMaybe<Patient_Record_Arr_Rel_Insert_Input>;
  patients?: InputMaybe<Patient_Arr_Rel_Insert_Input>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postal_code?: InputMaybe<Scalars['String']['input']>;
  questionnaire_responses?: InputMaybe<Questionnaire_Response_Arr_Rel_Insert_Input>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  users?: InputMaybe<User_Arr_Rel_Insert_Input>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Organization_Max_Fields = {
  __typename?: 'organization_max_fields';
  address_line1?: Maybe<Scalars['String']['output']>;
  address_line2?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  postal_code?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Organization_Min_Fields = {
  __typename?: 'organization_min_fields';
  address_line1?: Maybe<Scalars['String']['output']>;
  address_line2?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  postal_code?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "organization" */
export type Organization_Mutation_Response = {
  __typename?: 'organization_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Organization>;
};

/** input type for inserting object relation for remote table "organization" */
export type Organization_Obj_Rel_Insert_Input = {
  data: Organization_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Organization_On_Conflict>;
};

/** on_conflict condition type for table "organization" */
export type Organization_On_Conflict = {
  constraint: Organization_Constraint;
  update_columns?: Array<Organization_Update_Column>;
  where?: InputMaybe<Organization_Bool_Exp>;
};

/** Ordering options when selecting data from "organization". */
export type Organization_Order_By = {
  address_line1?: InputMaybe<Order_By>;
  address_line2?: InputMaybe<Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  patient_consents_aggregate?: InputMaybe<Patient_Consent_Aggregate_Order_By>;
  patient_records_aggregate?: InputMaybe<Patient_Record_Aggregate_Order_By>;
  patients_aggregate?: InputMaybe<Patient_Aggregate_Order_By>;
  phone?: InputMaybe<Order_By>;
  postal_code?: InputMaybe<Order_By>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  users_aggregate?: InputMaybe<User_Aggregate_Order_By>;
  website?: InputMaybe<Order_By>;
};

/** primary key columns input for table: organization */
export type Organization_Pk_Columns_Input = {
  id: Scalars['String']['input'];
};

/** select columns of table "organization" */
export enum Organization_Select_Column {
  /** column name */
  AddressLine1 = 'address_line1',
  /** column name */
  AddressLine2 = 'address_line2',
  /** column name */
  City = 'city',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Phone = 'phone',
  /** column name */
  PostalCode = 'postal_code',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Website = 'website'
}

/** input type for updating data in table "organization" */
export type Organization_Set_Input = {
  address_line1?: InputMaybe<Scalars['String']['input']>;
  address_line2?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postal_code?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "organization" */
export type Organization_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Organization_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Organization_Stream_Cursor_Value_Input = {
  address_line1?: InputMaybe<Scalars['String']['input']>;
  address_line2?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postal_code?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "organization" */
export enum Organization_Update_Column {
  /** column name */
  AddressLine1 = 'address_line1',
  /** column name */
  AddressLine2 = 'address_line2',
  /** column name */
  City = 'city',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Phone = 'phone',
  /** column name */
  PostalCode = 'postal_code',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  Website = 'website'
}

export type Organization_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Organization_Set_Input>;
  /** filter the rows which have to be updated */
  where: Organization_Bool_Exp;
};

/** columns and relationships of "patient" */
export type Patient = {
  __typename?: 'patient';
  clinic_internal_id: Scalars['String']['output'];
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  date_of_birth_encrypted?: Maybe<Scalars['String']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  first_name_encrypted: Scalars['String']['output'];
  gender_encrypted?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  last_name_encrypted: Scalars['String']['output'];
  /** An object relationship */
  organization: Organization;
  organization_id: Scalars['String']['output'];
  /** An array relationship */
  patient_records: Array<Patient_Record>;
  /** An aggregate relationship */
  patient_records_aggregate: Patient_Record_Aggregate;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "patient" */
export type PatientPatient_RecordsArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "patient" */
export type PatientPatient_Records_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};

/** aggregated selection of "patient" */
export type Patient_Aggregate = {
  __typename?: 'patient_aggregate';
  aggregate?: Maybe<Patient_Aggregate_Fields>;
  nodes: Array<Patient>;
};

export type Patient_Aggregate_Bool_Exp = {
  count?: InputMaybe<Patient_Aggregate_Bool_Exp_Count>;
};

export type Patient_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Patient_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Patient_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "patient" */
export type Patient_Aggregate_Fields = {
  __typename?: 'patient_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Patient_Max_Fields>;
  min?: Maybe<Patient_Min_Fields>;
};


/** aggregate fields of "patient" */
export type Patient_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Patient_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "patient" */
export type Patient_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Patient_Max_Order_By>;
  min?: InputMaybe<Patient_Min_Order_By>;
};

/** input type for inserting array relation for remote table "patient" */
export type Patient_Arr_Rel_Insert_Input = {
  data: Array<Patient_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Patient_On_Conflict>;
};

/** Boolean expression to filter rows from the table "patient". All fields are combined with a logical 'AND'. */
export type Patient_Bool_Exp = {
  _and?: InputMaybe<Array<Patient_Bool_Exp>>;
  _not?: InputMaybe<Patient_Bool_Exp>;
  _or?: InputMaybe<Array<Patient_Bool_Exp>>;
  clinic_internal_id?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  date_of_birth_encrypted?: InputMaybe<String_Comparison_Exp>;
  deleted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  first_name_encrypted?: InputMaybe<String_Comparison_Exp>;
  gender_encrypted?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  last_name_encrypted?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  patient_records?: InputMaybe<Patient_Record_Bool_Exp>;
  patient_records_aggregate?: InputMaybe<Patient_Record_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** columns and relationships of "patient_consent" */
export type Patient_Consent = {
  __typename?: 'patient_consent';
  consent_given: Scalars['Boolean']['output'];
  consent_text: Scalars['String']['output'];
  consent_version: Scalars['String']['output'];
  consented_at: Scalars['timestamptz']['output'];
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id: Scalars['String']['output'];
  ip_address?: Maybe<Scalars['inet']['output']>;
  /** An object relationship */
  organization: Organization;
  organization_id: Scalars['String']['output'];
  /** An object relationship */
  patient_record: Patient_Record;
  patient_record_id: Scalars['String']['output'];
  /** An array relationship */
  questionnaire_responses: Array<Questionnaire_Response>;
  /** An aggregate relationship */
  questionnaire_responses_aggregate: Questionnaire_Response_Aggregate;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
};


/** columns and relationships of "patient_consent" */
export type Patient_ConsentQuestionnaire_ResponsesArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};


/** columns and relationships of "patient_consent" */
export type Patient_ConsentQuestionnaire_Responses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};

/** aggregated selection of "patient_consent" */
export type Patient_Consent_Aggregate = {
  __typename?: 'patient_consent_aggregate';
  aggregate?: Maybe<Patient_Consent_Aggregate_Fields>;
  nodes: Array<Patient_Consent>;
};

export type Patient_Consent_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Patient_Consent_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Patient_Consent_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Patient_Consent_Aggregate_Bool_Exp_Count>;
};

export type Patient_Consent_Aggregate_Bool_Exp_Bool_And = {
  arguments: Patient_Consent_Select_Column_Patient_Consent_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Patient_Consent_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Patient_Consent_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Patient_Consent_Select_Column_Patient_Consent_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Patient_Consent_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Patient_Consent_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Patient_Consent_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Patient_Consent_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "patient_consent" */
export type Patient_Consent_Aggregate_Fields = {
  __typename?: 'patient_consent_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Patient_Consent_Max_Fields>;
  min?: Maybe<Patient_Consent_Min_Fields>;
};


/** aggregate fields of "patient_consent" */
export type Patient_Consent_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Patient_Consent_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "patient_consent" */
export type Patient_Consent_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Patient_Consent_Max_Order_By>;
  min?: InputMaybe<Patient_Consent_Min_Order_By>;
};

/** input type for inserting array relation for remote table "patient_consent" */
export type Patient_Consent_Arr_Rel_Insert_Input = {
  data: Array<Patient_Consent_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Patient_Consent_On_Conflict>;
};

/** Boolean expression to filter rows from the table "patient_consent". All fields are combined with a logical 'AND'. */
export type Patient_Consent_Bool_Exp = {
  _and?: InputMaybe<Array<Patient_Consent_Bool_Exp>>;
  _not?: InputMaybe<Patient_Consent_Bool_Exp>;
  _or?: InputMaybe<Array<Patient_Consent_Bool_Exp>>;
  consent_given?: InputMaybe<Boolean_Comparison_Exp>;
  consent_text?: InputMaybe<String_Comparison_Exp>;
  consent_version?: InputMaybe<String_Comparison_Exp>;
  consented_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  deleted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  ip_address?: InputMaybe<Inet_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  patient_record?: InputMaybe<Patient_Record_Bool_Exp>;
  patient_record_id?: InputMaybe<String_Comparison_Exp>;
  questionnaire_responses?: InputMaybe<Questionnaire_Response_Bool_Exp>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_agent?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "patient_consent" */
export enum Patient_Consent_Constraint {
  /** unique or primary key constraint on columns "patient_record_id" */
  PatientConsentPatientRecordUnique = 'patient_consent_patient_record_unique',
  /** unique or primary key constraint on columns "id" */
  PatientConsentPkey = 'patient_consent_pkey'
}

/** input type for inserting data into table "patient_consent" */
export type Patient_Consent_Insert_Input = {
  consent_given?: InputMaybe<Scalars['Boolean']['input']>;
  consent_text?: InputMaybe<Scalars['String']['input']>;
  consent_version?: InputMaybe<Scalars['String']['input']>;
  consented_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  ip_address?: InputMaybe<Scalars['inet']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient_record?: InputMaybe<Patient_Record_Obj_Rel_Insert_Input>;
  patient_record_id?: InputMaybe<Scalars['String']['input']>;
  questionnaire_responses?: InputMaybe<Questionnaire_Response_Arr_Rel_Insert_Input>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Patient_Consent_Max_Fields = {
  __typename?: 'patient_consent_max_fields';
  consent_text?: Maybe<Scalars['String']['output']>;
  consent_version?: Maybe<Scalars['String']['output']>;
  consented_at?: Maybe<Scalars['timestamptz']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['String']['output']>;
  patient_record_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "patient_consent" */
export type Patient_Consent_Max_Order_By = {
  consent_text?: InputMaybe<Order_By>;
  consent_version?: InputMaybe<Order_By>;
  consented_at?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_record_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Patient_Consent_Min_Fields = {
  __typename?: 'patient_consent_min_fields';
  consent_text?: Maybe<Scalars['String']['output']>;
  consent_version?: Maybe<Scalars['String']['output']>;
  consented_at?: Maybe<Scalars['timestamptz']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['String']['output']>;
  patient_record_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_agent?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "patient_consent" */
export type Patient_Consent_Min_Order_By = {
  consent_text?: InputMaybe<Order_By>;
  consent_version?: InputMaybe<Order_By>;
  consented_at?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_record_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "patient_consent" */
export type Patient_Consent_Mutation_Response = {
  __typename?: 'patient_consent_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Patient_Consent>;
};

/** input type for inserting object relation for remote table "patient_consent" */
export type Patient_Consent_Obj_Rel_Insert_Input = {
  data: Patient_Consent_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Patient_Consent_On_Conflict>;
};

/** on_conflict condition type for table "patient_consent" */
export type Patient_Consent_On_Conflict = {
  constraint: Patient_Consent_Constraint;
  update_columns?: Array<Patient_Consent_Update_Column>;
  where?: InputMaybe<Patient_Consent_Bool_Exp>;
};

/** Ordering options when selecting data from "patient_consent". */
export type Patient_Consent_Order_By = {
  consent_given?: InputMaybe<Order_By>;
  consent_text?: InputMaybe<Order_By>;
  consent_version?: InputMaybe<Order_By>;
  consented_at?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  ip_address?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organization_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_record?: InputMaybe<Patient_Record_Order_By>;
  patient_record_id?: InputMaybe<Order_By>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
};

/** primary key columns input for table: patient_consent */
export type Patient_Consent_Pk_Columns_Input = {
  id: Scalars['String']['input'];
};

/** select columns of table "patient_consent" */
export enum Patient_Consent_Select_Column {
  /** column name */
  ConsentGiven = 'consent_given',
  /** column name */
  ConsentText = 'consent_text',
  /** column name */
  ConsentVersion = 'consent_version',
  /** column name */
  ConsentedAt = 'consented_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Id = 'id',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  PatientRecordId = 'patient_record_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserAgent = 'user_agent'
}

/** select "patient_consent_aggregate_bool_exp_bool_and_arguments_columns" columns of table "patient_consent" */
export enum Patient_Consent_Select_Column_Patient_Consent_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  ConsentGiven = 'consent_given'
}

/** select "patient_consent_aggregate_bool_exp_bool_or_arguments_columns" columns of table "patient_consent" */
export enum Patient_Consent_Select_Column_Patient_Consent_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  ConsentGiven = 'consent_given'
}

/** input type for updating data in table "patient_consent" */
export type Patient_Consent_Set_Input = {
  consent_given?: InputMaybe<Scalars['Boolean']['input']>;
  consent_text?: InputMaybe<Scalars['String']['input']>;
  consent_version?: InputMaybe<Scalars['String']['input']>;
  consented_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  ip_address?: InputMaybe<Scalars['inet']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient_record_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "patient_consent" */
export type Patient_Consent_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Patient_Consent_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Patient_Consent_Stream_Cursor_Value_Input = {
  consent_given?: InputMaybe<Scalars['Boolean']['input']>;
  consent_text?: InputMaybe<Scalars['String']['input']>;
  consent_version?: InputMaybe<Scalars['String']['input']>;
  consented_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  ip_address?: InputMaybe<Scalars['inet']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient_record_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_agent?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "patient_consent" */
export enum Patient_Consent_Update_Column {
  /** column name */
  ConsentGiven = 'consent_given',
  /** column name */
  ConsentText = 'consent_text',
  /** column name */
  ConsentVersion = 'consent_version',
  /** column name */
  ConsentedAt = 'consented_at',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Id = 'id',
  /** column name */
  IpAddress = 'ip_address',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  PatientRecordId = 'patient_record_id',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserAgent = 'user_agent'
}

export type Patient_Consent_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Patient_Consent_Set_Input>;
  /** filter the rows which have to be updated */
  where: Patient_Consent_Bool_Exp;
};

/** unique or primary key constraints on table "patient" */
export enum Patient_Constraint {
  /** unique or primary key constraint on columns "organization_id", "clinic_internal_id" */
  PatientClinicInternalIdOrgUnique = 'patient_clinic_internal_id_org_unique',
  /** unique or primary key constraint on columns "id" */
  PatientPkey = 'patient_pkey'
}

/** input type for inserting data into table "patient" */
export type Patient_Insert_Input = {
  clinic_internal_id?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  date_of_birth_encrypted?: InputMaybe<Scalars['String']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  gender_encrypted?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  last_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient_records?: InputMaybe<Patient_Record_Arr_Rel_Insert_Input>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Patient_Max_Fields = {
  __typename?: 'patient_max_fields';
  clinic_internal_id?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  date_of_birth_encrypted?: Maybe<Scalars['String']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  first_name_encrypted?: Maybe<Scalars['String']['output']>;
  gender_encrypted?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  last_name_encrypted?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "patient" */
export type Patient_Max_Order_By = {
  clinic_internal_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  date_of_birth_encrypted?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  first_name_encrypted?: InputMaybe<Order_By>;
  gender_encrypted?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_name_encrypted?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Patient_Min_Fields = {
  __typename?: 'patient_min_fields';
  clinic_internal_id?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  date_of_birth_encrypted?: Maybe<Scalars['String']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  first_name_encrypted?: Maybe<Scalars['String']['output']>;
  gender_encrypted?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  last_name_encrypted?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "patient" */
export type Patient_Min_Order_By = {
  clinic_internal_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  date_of_birth_encrypted?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  first_name_encrypted?: InputMaybe<Order_By>;
  gender_encrypted?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_name_encrypted?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "patient" */
export type Patient_Mutation_Response = {
  __typename?: 'patient_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Patient>;
};

/** input type for inserting object relation for remote table "patient" */
export type Patient_Obj_Rel_Insert_Input = {
  data: Patient_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Patient_On_Conflict>;
};

/** on_conflict condition type for table "patient" */
export type Patient_On_Conflict = {
  constraint: Patient_Constraint;
  update_columns?: Array<Patient_Update_Column>;
  where?: InputMaybe<Patient_Bool_Exp>;
};

/** Ordering options when selecting data from "patient". */
export type Patient_Order_By = {
  clinic_internal_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  date_of_birth_encrypted?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  first_name_encrypted?: InputMaybe<Order_By>;
  gender_encrypted?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_name_encrypted?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organization_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_records_aggregate?: InputMaybe<Patient_Record_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: patient */
export type Patient_Pk_Columns_Input = {
  id: Scalars['String']['input'];
};

/** columns and relationships of "patient_record" */
export type Patient_Record = {
  __typename?: 'patient_record';
  assigned_to: Scalars['String']['output'];
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by: Scalars['String']['output'];
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  first_viewed_at?: Maybe<Scalars['timestamptz']['output']>;
  first_viewed_by?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  invite_expires_at: Scalars['timestamptz']['output'];
  invite_token: Scalars['String']['output'];
  last_activity_at?: Maybe<Scalars['timestamptz']['output']>;
  last_activity_by?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  organization: Organization;
  organization_id: Scalars['String']['output'];
  /** An object relationship */
  patient: Patient;
  /** An object relationship */
  patient_consent?: Maybe<Patient_Consent>;
  patient_id: Scalars['String']['output'];
  /** An array relationship */
  questionnaire_responses: Array<Questionnaire_Response>;
  /** An aggregate relationship */
  questionnaire_responses_aggregate: Questionnaire_Response_Aggregate;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  user: User;
  /** An object relationship */
  userByCreatedBy: User;
  /** An object relationship */
  userByFirstViewedBy?: Maybe<User>;
  /** An object relationship */
  userByLastActivityBy?: Maybe<User>;
};


/** columns and relationships of "patient_record" */
export type Patient_RecordQuestionnaire_ResponsesArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};


/** columns and relationships of "patient_record" */
export type Patient_RecordQuestionnaire_Responses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};

/** aggregated selection of "patient_record" */
export type Patient_Record_Aggregate = {
  __typename?: 'patient_record_aggregate';
  aggregate?: Maybe<Patient_Record_Aggregate_Fields>;
  nodes: Array<Patient_Record>;
};

export type Patient_Record_Aggregate_Bool_Exp = {
  count?: InputMaybe<Patient_Record_Aggregate_Bool_Exp_Count>;
};

export type Patient_Record_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Patient_Record_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Patient_Record_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "patient_record" */
export type Patient_Record_Aggregate_Fields = {
  __typename?: 'patient_record_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Patient_Record_Max_Fields>;
  min?: Maybe<Patient_Record_Min_Fields>;
};


/** aggregate fields of "patient_record" */
export type Patient_Record_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Patient_Record_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "patient_record" */
export type Patient_Record_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Patient_Record_Max_Order_By>;
  min?: InputMaybe<Patient_Record_Min_Order_By>;
};

/** input type for inserting array relation for remote table "patient_record" */
export type Patient_Record_Arr_Rel_Insert_Input = {
  data: Array<Patient_Record_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Patient_Record_On_Conflict>;
};

/** Boolean expression to filter rows from the table "patient_record". All fields are combined with a logical 'AND'. */
export type Patient_Record_Bool_Exp = {
  _and?: InputMaybe<Array<Patient_Record_Bool_Exp>>;
  _not?: InputMaybe<Patient_Record_Bool_Exp>;
  _or?: InputMaybe<Array<Patient_Record_Bool_Exp>>;
  assigned_to?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by?: InputMaybe<String_Comparison_Exp>;
  deleted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  first_viewed_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  first_viewed_by?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  invite_expires_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  invite_token?: InputMaybe<String_Comparison_Exp>;
  last_activity_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  last_activity_by?: InputMaybe<String_Comparison_Exp>;
  notes?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  patient?: InputMaybe<Patient_Bool_Exp>;
  patient_consent?: InputMaybe<Patient_Consent_Bool_Exp>;
  patient_id?: InputMaybe<String_Comparison_Exp>;
  questionnaire_responses?: InputMaybe<Questionnaire_Response_Bool_Exp>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<User_Bool_Exp>;
  userByCreatedBy?: InputMaybe<User_Bool_Exp>;
  userByFirstViewedBy?: InputMaybe<User_Bool_Exp>;
  userByLastActivityBy?: InputMaybe<User_Bool_Exp>;
};

/** unique or primary key constraints on table "patient_record" */
export enum Patient_Record_Constraint {
  /** unique or primary key constraint on columns "invite_token" */
  PatientRecordInviteTokenUnique = 'patient_record_invite_token_unique',
  /** unique or primary key constraint on columns "id" */
  PatientRecordPkey = 'patient_record_pkey'
}

/** input type for inserting data into table "patient_record" */
export type Patient_Record_Insert_Input = {
  assigned_to?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['String']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_viewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_viewed_by?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  invite_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  invite_token?: InputMaybe<Scalars['String']['input']>;
  last_activity_at?: InputMaybe<Scalars['timestamptz']['input']>;
  last_activity_by?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient?: InputMaybe<Patient_Obj_Rel_Insert_Input>;
  patient_consent?: InputMaybe<Patient_Consent_Obj_Rel_Insert_Input>;
  patient_id?: InputMaybe<Scalars['String']['input']>;
  questionnaire_responses?: InputMaybe<Questionnaire_Response_Arr_Rel_Insert_Input>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<User_Obj_Rel_Insert_Input>;
  userByCreatedBy?: InputMaybe<User_Obj_Rel_Insert_Input>;
  userByFirstViewedBy?: InputMaybe<User_Obj_Rel_Insert_Input>;
  userByLastActivityBy?: InputMaybe<User_Obj_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Patient_Record_Max_Fields = {
  __typename?: 'patient_record_max_fields';
  assigned_to?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by?: Maybe<Scalars['String']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  first_viewed_at?: Maybe<Scalars['timestamptz']['output']>;
  first_viewed_by?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  invite_expires_at?: Maybe<Scalars['timestamptz']['output']>;
  invite_token?: Maybe<Scalars['String']['output']>;
  last_activity_at?: Maybe<Scalars['timestamptz']['output']>;
  last_activity_by?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['String']['output']>;
  patient_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "patient_record" */
export type Patient_Record_Max_Order_By = {
  assigned_to?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  first_viewed_at?: InputMaybe<Order_By>;
  first_viewed_by?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  invite_expires_at?: InputMaybe<Order_By>;
  invite_token?: InputMaybe<Order_By>;
  last_activity_at?: InputMaybe<Order_By>;
  last_activity_by?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Patient_Record_Min_Fields = {
  __typename?: 'patient_record_min_fields';
  assigned_to?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by?: Maybe<Scalars['String']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  first_viewed_at?: Maybe<Scalars['timestamptz']['output']>;
  first_viewed_by?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  invite_expires_at?: Maybe<Scalars['timestamptz']['output']>;
  invite_token?: Maybe<Scalars['String']['output']>;
  last_activity_at?: Maybe<Scalars['timestamptz']['output']>;
  last_activity_by?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['String']['output']>;
  patient_id?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "patient_record" */
export type Patient_Record_Min_Order_By = {
  assigned_to?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  first_viewed_at?: InputMaybe<Order_By>;
  first_viewed_by?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  invite_expires_at?: InputMaybe<Order_By>;
  invite_token?: InputMaybe<Order_By>;
  last_activity_at?: InputMaybe<Order_By>;
  last_activity_by?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "patient_record" */
export type Patient_Record_Mutation_Response = {
  __typename?: 'patient_record_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Patient_Record>;
};

/** input type for inserting object relation for remote table "patient_record" */
export type Patient_Record_Obj_Rel_Insert_Input = {
  data: Patient_Record_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Patient_Record_On_Conflict>;
};

/** on_conflict condition type for table "patient_record" */
export type Patient_Record_On_Conflict = {
  constraint: Patient_Record_Constraint;
  update_columns?: Array<Patient_Record_Update_Column>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};

/** Ordering options when selecting data from "patient_record". */
export type Patient_Record_Order_By = {
  assigned_to?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  first_viewed_at?: InputMaybe<Order_By>;
  first_viewed_by?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  invite_expires_at?: InputMaybe<Order_By>;
  invite_token?: InputMaybe<Order_By>;
  last_activity_at?: InputMaybe<Order_By>;
  last_activity_by?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organization_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient?: InputMaybe<Patient_Order_By>;
  patient_consent?: InputMaybe<Patient_Consent_Order_By>;
  patient_id?: InputMaybe<Order_By>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Order_By>;
  userByCreatedBy?: InputMaybe<User_Order_By>;
  userByFirstViewedBy?: InputMaybe<User_Order_By>;
  userByLastActivityBy?: InputMaybe<User_Order_By>;
};

/** primary key columns input for table: patient_record */
export type Patient_Record_Pk_Columns_Input = {
  id: Scalars['String']['input'];
};

/** select columns of table "patient_record" */
export enum Patient_Record_Select_Column {
  /** column name */
  AssignedTo = 'assigned_to',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  FirstViewedAt = 'first_viewed_at',
  /** column name */
  FirstViewedBy = 'first_viewed_by',
  /** column name */
  Id = 'id',
  /** column name */
  InviteExpiresAt = 'invite_expires_at',
  /** column name */
  InviteToken = 'invite_token',
  /** column name */
  LastActivityAt = 'last_activity_at',
  /** column name */
  LastActivityBy = 'last_activity_by',
  /** column name */
  Notes = 'notes',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  PatientId = 'patient_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "patient_record" */
export type Patient_Record_Set_Input = {
  assigned_to?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['String']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_viewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_viewed_by?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  invite_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  invite_token?: InputMaybe<Scalars['String']['input']>;
  last_activity_at?: InputMaybe<Scalars['timestamptz']['input']>;
  last_activity_by?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "patient_record" */
export type Patient_Record_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Patient_Record_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Patient_Record_Stream_Cursor_Value_Input = {
  assigned_to?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by?: InputMaybe<Scalars['String']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_viewed_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_viewed_by?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  invite_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  invite_token?: InputMaybe<Scalars['String']['input']>;
  last_activity_at?: InputMaybe<Scalars['timestamptz']['input']>;
  last_activity_by?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "patient_record" */
export enum Patient_Record_Update_Column {
  /** column name */
  AssignedTo = 'assigned_to',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedBy = 'created_by',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  FirstViewedAt = 'first_viewed_at',
  /** column name */
  FirstViewedBy = 'first_viewed_by',
  /** column name */
  Id = 'id',
  /** column name */
  InviteExpiresAt = 'invite_expires_at',
  /** column name */
  InviteToken = 'invite_token',
  /** column name */
  LastActivityAt = 'last_activity_at',
  /** column name */
  LastActivityBy = 'last_activity_by',
  /** column name */
  Notes = 'notes',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  PatientId = 'patient_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Patient_Record_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Patient_Record_Set_Input>;
  /** filter the rows which have to be updated */
  where: Patient_Record_Bool_Exp;
};

/** select columns of table "patient" */
export enum Patient_Select_Column {
  /** column name */
  ClinicInternalId = 'clinic_internal_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DateOfBirthEncrypted = 'date_of_birth_encrypted',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  FirstNameEncrypted = 'first_name_encrypted',
  /** column name */
  GenderEncrypted = 'gender_encrypted',
  /** column name */
  Id = 'id',
  /** column name */
  LastNameEncrypted = 'last_name_encrypted',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "patient" */
export type Patient_Set_Input = {
  clinic_internal_id?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  date_of_birth_encrypted?: InputMaybe<Scalars['String']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  gender_encrypted?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  last_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "patient" */
export type Patient_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Patient_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Patient_Stream_Cursor_Value_Input = {
  clinic_internal_id?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  date_of_birth_encrypted?: InputMaybe<Scalars['String']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  gender_encrypted?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  last_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "patient" */
export enum Patient_Update_Column {
  /** column name */
  ClinicInternalId = 'clinic_internal_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DateOfBirthEncrypted = 'date_of_birth_encrypted',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  FirstNameEncrypted = 'first_name_encrypted',
  /** column name */
  GenderEncrypted = 'gender_encrypted',
  /** column name */
  Id = 'id',
  /** column name */
  LastNameEncrypted = 'last_name_encrypted',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Patient_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Patient_Set_Input>;
  /** filter the rows which have to be updated */
  where: Patient_Bool_Exp;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "organization" */
  organization: Array<Organization>;
  /** fetch aggregated fields from the table: "organization" */
  organization_aggregate: Organization_Aggregate;
  /** fetch data from the table: "organization" using primary key columns */
  organization_by_pk?: Maybe<Organization>;
  /** fetch data from the table: "patient" */
  patient: Array<Patient>;
  /** fetch aggregated fields from the table: "patient" */
  patient_aggregate: Patient_Aggregate;
  /** fetch data from the table: "patient" using primary key columns */
  patient_by_pk?: Maybe<Patient>;
  /** fetch data from the table: "patient_consent" */
  patient_consent: Array<Patient_Consent>;
  /** fetch aggregated fields from the table: "patient_consent" */
  patient_consent_aggregate: Patient_Consent_Aggregate;
  /** fetch data from the table: "patient_consent" using primary key columns */
  patient_consent_by_pk?: Maybe<Patient_Consent>;
  /** fetch data from the table: "patient_record" */
  patient_record: Array<Patient_Record>;
  /** fetch aggregated fields from the table: "patient_record" */
  patient_record_aggregate: Patient_Record_Aggregate;
  /** fetch data from the table: "patient_record" using primary key columns */
  patient_record_by_pk?: Maybe<Patient_Record>;
  /** fetch data from the table: "questionnaire_response" */
  questionnaire_response: Array<Questionnaire_Response>;
  /** fetch aggregated fields from the table: "questionnaire_response" */
  questionnaire_response_aggregate: Questionnaire_Response_Aggregate;
  /** fetch data from the table: "questionnaire_response" using primary key columns */
  questionnaire_response_by_pk?: Maybe<Questionnaire_Response>;
  /** fetch data from the table: "user" */
  user: Array<User>;
  /** fetch aggregated fields from the table: "user" */
  user_aggregate: User_Aggregate;
  /** fetch data from the table: "user" using primary key columns */
  user_by_pk?: Maybe<User>;
};


export type Query_RootOrganizationArgs = {
  distinct_on?: InputMaybe<Array<Organization_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Order_By>>;
  where?: InputMaybe<Organization_Bool_Exp>;
};


export type Query_RootOrganization_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Order_By>>;
  where?: InputMaybe<Organization_Bool_Exp>;
};


export type Query_RootOrganization_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootPatientArgs = {
  distinct_on?: InputMaybe<Array<Patient_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Order_By>>;
  where?: InputMaybe<Patient_Bool_Exp>;
};


export type Query_RootPatient_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Order_By>>;
  where?: InputMaybe<Patient_Bool_Exp>;
};


export type Query_RootPatient_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootPatient_ConsentArgs = {
  distinct_on?: InputMaybe<Array<Patient_Consent_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Consent_Order_By>>;
  where?: InputMaybe<Patient_Consent_Bool_Exp>;
};


export type Query_RootPatient_Consent_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Consent_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Consent_Order_By>>;
  where?: InputMaybe<Patient_Consent_Bool_Exp>;
};


export type Query_RootPatient_Consent_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootPatient_RecordArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


export type Query_RootPatient_Record_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


export type Query_RootPatient_Record_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootQuestionnaire_ResponseArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};


export type Query_RootQuestionnaire_Response_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};


export type Query_RootQuestionnaire_Response_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootUserArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};


export type Query_RootUser_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};


export type Query_RootUser_By_PkArgs = {
  id: Scalars['String']['input'];
};

/** columns and relationships of "questionnaire_response" */
export type Questionnaire_Response = {
  __typename?: 'questionnaire_response';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  fhir_resource: Scalars['jsonb']['output'];
  id: Scalars['String']['output'];
  /** An object relationship */
  organization: Organization;
  organization_id: Scalars['String']['output'];
  /** An object relationship */
  patient_consent: Patient_Consent;
  patient_consent_id: Scalars['String']['output'];
  /** An object relationship */
  patient_record: Patient_Record;
  patient_record_id: Scalars['String']['output'];
  submitted_at?: Maybe<Scalars['timestamptz']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "questionnaire_response" */
export type Questionnaire_ResponseFhir_ResourceArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "questionnaire_response" */
export type Questionnaire_Response_Aggregate = {
  __typename?: 'questionnaire_response_aggregate';
  aggregate?: Maybe<Questionnaire_Response_Aggregate_Fields>;
  nodes: Array<Questionnaire_Response>;
};

export type Questionnaire_Response_Aggregate_Bool_Exp = {
  count?: InputMaybe<Questionnaire_Response_Aggregate_Bool_Exp_Count>;
};

export type Questionnaire_Response_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Questionnaire_Response_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "questionnaire_response" */
export type Questionnaire_Response_Aggregate_Fields = {
  __typename?: 'questionnaire_response_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Questionnaire_Response_Max_Fields>;
  min?: Maybe<Questionnaire_Response_Min_Fields>;
};


/** aggregate fields of "questionnaire_response" */
export type Questionnaire_Response_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "questionnaire_response" */
export type Questionnaire_Response_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Questionnaire_Response_Max_Order_By>;
  min?: InputMaybe<Questionnaire_Response_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Questionnaire_Response_Append_Input = {
  fhir_resource?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "questionnaire_response" */
export type Questionnaire_Response_Arr_Rel_Insert_Input = {
  data: Array<Questionnaire_Response_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Questionnaire_Response_On_Conflict>;
};

/** Boolean expression to filter rows from the table "questionnaire_response". All fields are combined with a logical 'AND'. */
export type Questionnaire_Response_Bool_Exp = {
  _and?: InputMaybe<Array<Questionnaire_Response_Bool_Exp>>;
  _not?: InputMaybe<Questionnaire_Response_Bool_Exp>;
  _or?: InputMaybe<Array<Questionnaire_Response_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  deleted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  fhir_resource?: InputMaybe<Jsonb_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organization_id?: InputMaybe<String_Comparison_Exp>;
  patient_consent?: InputMaybe<Patient_Consent_Bool_Exp>;
  patient_consent_id?: InputMaybe<String_Comparison_Exp>;
  patient_record?: InputMaybe<Patient_Record_Bool_Exp>;
  patient_record_id?: InputMaybe<String_Comparison_Exp>;
  submitted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "questionnaire_response" */
export enum Questionnaire_Response_Constraint {
  /** unique or primary key constraint on columns "id" */
  QuestionnaireResponsePkey = 'questionnaire_response_pkey',
  /** unique or primary key constraint on columns "patient_record_id" */
  QuestionnaireResponseUniquePerQuestionnaire = 'questionnaire_response_unique_per_questionnaire'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Questionnaire_Response_Delete_At_Path_Input = {
  fhir_resource?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Questionnaire_Response_Delete_Elem_Input = {
  fhir_resource?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Questionnaire_Response_Delete_Key_Input = {
  fhir_resource?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "questionnaire_response" */
export type Questionnaire_Response_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  fhir_resource?: InputMaybe<Scalars['jsonb']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient_consent?: InputMaybe<Patient_Consent_Obj_Rel_Insert_Input>;
  patient_consent_id?: InputMaybe<Scalars['String']['input']>;
  patient_record?: InputMaybe<Patient_Record_Obj_Rel_Insert_Input>;
  patient_record_id?: InputMaybe<Scalars['String']['input']>;
  submitted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Questionnaire_Response_Max_Fields = {
  __typename?: 'questionnaire_response_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['String']['output']>;
  patient_consent_id?: Maybe<Scalars['String']['output']>;
  patient_record_id?: Maybe<Scalars['String']['output']>;
  submitted_at?: Maybe<Scalars['timestamptz']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "questionnaire_response" */
export type Questionnaire_Response_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_consent_id?: InputMaybe<Order_By>;
  patient_record_id?: InputMaybe<Order_By>;
  submitted_at?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Questionnaire_Response_Min_Fields = {
  __typename?: 'questionnaire_response_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['String']['output']>;
  patient_consent_id?: Maybe<Scalars['String']['output']>;
  patient_record_id?: Maybe<Scalars['String']['output']>;
  submitted_at?: Maybe<Scalars['timestamptz']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "questionnaire_response" */
export type Questionnaire_Response_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_consent_id?: InputMaybe<Order_By>;
  patient_record_id?: InputMaybe<Order_By>;
  submitted_at?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "questionnaire_response" */
export type Questionnaire_Response_Mutation_Response = {
  __typename?: 'questionnaire_response_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Questionnaire_Response>;
};

/** on_conflict condition type for table "questionnaire_response" */
export type Questionnaire_Response_On_Conflict = {
  constraint: Questionnaire_Response_Constraint;
  update_columns?: Array<Questionnaire_Response_Update_Column>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};

/** Ordering options when selecting data from "questionnaire_response". */
export type Questionnaire_Response_Order_By = {
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  fhir_resource?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organization_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_consent?: InputMaybe<Patient_Consent_Order_By>;
  patient_consent_id?: InputMaybe<Order_By>;
  patient_record?: InputMaybe<Patient_Record_Order_By>;
  patient_record_id?: InputMaybe<Order_By>;
  submitted_at?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: questionnaire_response */
export type Questionnaire_Response_Pk_Columns_Input = {
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Questionnaire_Response_Prepend_Input = {
  fhir_resource?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "questionnaire_response" */
export enum Questionnaire_Response_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  FhirResource = 'fhir_resource',
  /** column name */
  Id = 'id',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  PatientConsentId = 'patient_consent_id',
  /** column name */
  PatientRecordId = 'patient_record_id',
  /** column name */
  SubmittedAt = 'submitted_at',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "questionnaire_response" */
export type Questionnaire_Response_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  fhir_resource?: InputMaybe<Scalars['jsonb']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient_consent_id?: InputMaybe<Scalars['String']['input']>;
  patient_record_id?: InputMaybe<Scalars['String']['input']>;
  submitted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "questionnaire_response" */
export type Questionnaire_Response_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Questionnaire_Response_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Questionnaire_Response_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  fhir_resource?: InputMaybe<Scalars['jsonb']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['String']['input']>;
  patient_consent_id?: InputMaybe<Scalars['String']['input']>;
  patient_record_id?: InputMaybe<Scalars['String']['input']>;
  submitted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "questionnaire_response" */
export enum Questionnaire_Response_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  FhirResource = 'fhir_resource',
  /** column name */
  Id = 'id',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  PatientConsentId = 'patient_consent_id',
  /** column name */
  PatientRecordId = 'patient_record_id',
  /** column name */
  SubmittedAt = 'submitted_at',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Questionnaire_Response_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Questionnaire_Response_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Questionnaire_Response_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Questionnaire_Response_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Questionnaire_Response_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Questionnaire_Response_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Questionnaire_Response_Set_Input>;
  /** filter the rows which have to be updated */
  where: Questionnaire_Response_Bool_Exp;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "organization" */
  organization: Array<Organization>;
  /** fetch aggregated fields from the table: "organization" */
  organization_aggregate: Organization_Aggregate;
  /** fetch data from the table: "organization" using primary key columns */
  organization_by_pk?: Maybe<Organization>;
  /** fetch data from the table in a streaming manner: "organization" */
  organization_stream: Array<Organization>;
  /** fetch data from the table: "patient" */
  patient: Array<Patient>;
  /** fetch aggregated fields from the table: "patient" */
  patient_aggregate: Patient_Aggregate;
  /** fetch data from the table: "patient" using primary key columns */
  patient_by_pk?: Maybe<Patient>;
  /** fetch data from the table: "patient_consent" */
  patient_consent: Array<Patient_Consent>;
  /** fetch aggregated fields from the table: "patient_consent" */
  patient_consent_aggregate: Patient_Consent_Aggregate;
  /** fetch data from the table: "patient_consent" using primary key columns */
  patient_consent_by_pk?: Maybe<Patient_Consent>;
  /** fetch data from the table in a streaming manner: "patient_consent" */
  patient_consent_stream: Array<Patient_Consent>;
  /** fetch data from the table: "patient_record" */
  patient_record: Array<Patient_Record>;
  /** fetch aggregated fields from the table: "patient_record" */
  patient_record_aggregate: Patient_Record_Aggregate;
  /** fetch data from the table: "patient_record" using primary key columns */
  patient_record_by_pk?: Maybe<Patient_Record>;
  /** fetch data from the table in a streaming manner: "patient_record" */
  patient_record_stream: Array<Patient_Record>;
  /** fetch data from the table in a streaming manner: "patient" */
  patient_stream: Array<Patient>;
  /** fetch data from the table: "questionnaire_response" */
  questionnaire_response: Array<Questionnaire_Response>;
  /** fetch aggregated fields from the table: "questionnaire_response" */
  questionnaire_response_aggregate: Questionnaire_Response_Aggregate;
  /** fetch data from the table: "questionnaire_response" using primary key columns */
  questionnaire_response_by_pk?: Maybe<Questionnaire_Response>;
  /** fetch data from the table in a streaming manner: "questionnaire_response" */
  questionnaire_response_stream: Array<Questionnaire_Response>;
  /** fetch data from the table: "user" */
  user: Array<User>;
  /** fetch aggregated fields from the table: "user" */
  user_aggregate: User_Aggregate;
  /** fetch data from the table: "user" using primary key columns */
  user_by_pk?: Maybe<User>;
  /** fetch data from the table in a streaming manner: "user" */
  user_stream: Array<User>;
};


export type Subscription_RootOrganizationArgs = {
  distinct_on?: InputMaybe<Array<Organization_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Order_By>>;
  where?: InputMaybe<Organization_Bool_Exp>;
};


export type Subscription_RootOrganization_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Organization_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Organization_Order_By>>;
  where?: InputMaybe<Organization_Bool_Exp>;
};


export type Subscription_RootOrganization_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootOrganization_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Organization_Stream_Cursor_Input>>;
  where?: InputMaybe<Organization_Bool_Exp>;
};


export type Subscription_RootPatientArgs = {
  distinct_on?: InputMaybe<Array<Patient_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Order_By>>;
  where?: InputMaybe<Patient_Bool_Exp>;
};


export type Subscription_RootPatient_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Order_By>>;
  where?: InputMaybe<Patient_Bool_Exp>;
};


export type Subscription_RootPatient_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootPatient_ConsentArgs = {
  distinct_on?: InputMaybe<Array<Patient_Consent_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Consent_Order_By>>;
  where?: InputMaybe<Patient_Consent_Bool_Exp>;
};


export type Subscription_RootPatient_Consent_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Consent_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Consent_Order_By>>;
  where?: InputMaybe<Patient_Consent_Bool_Exp>;
};


export type Subscription_RootPatient_Consent_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootPatient_Consent_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Patient_Consent_Stream_Cursor_Input>>;
  where?: InputMaybe<Patient_Consent_Bool_Exp>;
};


export type Subscription_RootPatient_RecordArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


export type Subscription_RootPatient_Record_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


export type Subscription_RootPatient_Record_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootPatient_Record_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Patient_Record_Stream_Cursor_Input>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


export type Subscription_RootPatient_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Patient_Stream_Cursor_Input>>;
  where?: InputMaybe<Patient_Bool_Exp>;
};


export type Subscription_RootQuestionnaire_ResponseArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};


export type Subscription_RootQuestionnaire_Response_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Questionnaire_Response_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Questionnaire_Response_Order_By>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};


export type Subscription_RootQuestionnaire_Response_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootQuestionnaire_Response_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Questionnaire_Response_Stream_Cursor_Input>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
};


export type Subscription_RootUserArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};


export type Subscription_RootUser_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};


export type Subscription_RootUser_By_PkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootUser_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export type Timestamp_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamp']['input']>;
  _gt?: InputMaybe<Scalars['timestamp']['input']>;
  _gte?: InputMaybe<Scalars['timestamp']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamp']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamp']['input']>;
  _lte?: InputMaybe<Scalars['timestamp']['input']>;
  _neq?: InputMaybe<Scalars['timestamp']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamp']['input']>>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** columns and relationships of "user" */
export type User = {
  __typename?: 'user';
  activeRole?: Maybe<Scalars['String']['output']>;
  app_uuid?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['timestamp']['output'];
  deletedAt?: Maybe<Scalars['timestamp']['output']>;
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isAnonymous?: Maybe<Scalars['Boolean']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  /** An object relationship */
  organization?: Maybe<Organization>;
  organizationId?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  patientRecordsByCreatedBy: Array<Patient_Record>;
  /** An aggregate relationship */
  patientRecordsByCreatedBy_aggregate: Patient_Record_Aggregate;
  /** An array relationship */
  patientRecordsByFirstViewedBy: Array<Patient_Record>;
  /** An aggregate relationship */
  patientRecordsByFirstViewedBy_aggregate: Patient_Record_Aggregate;
  /** An array relationship */
  patientRecordsByLastActivityBy: Array<Patient_Record>;
  /** An aggregate relationship */
  patientRecordsByLastActivityBy_aggregate: Patient_Record_Aggregate;
  /** An array relationship */
  patient_records: Array<Patient_Record>;
  /** An aggregate relationship */
  patient_records_aggregate: Patient_Record_Aggregate;
  roles?: Maybe<Scalars['jsonb']['output']>;
  updatedAt: Scalars['timestamp']['output'];
};


/** columns and relationships of "user" */
export type UserPatientRecordsByCreatedByArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "user" */
export type UserPatientRecordsByCreatedBy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "user" */
export type UserPatientRecordsByFirstViewedByArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "user" */
export type UserPatientRecordsByFirstViewedBy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "user" */
export type UserPatientRecordsByLastActivityByArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "user" */
export type UserPatientRecordsByLastActivityBy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "user" */
export type UserPatient_RecordsArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "user" */
export type UserPatient_Records_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Record_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Record_Order_By>>;
  where?: InputMaybe<Patient_Record_Bool_Exp>;
};


/** columns and relationships of "user" */
export type UserRolesArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "user" */
export type User_Aggregate = {
  __typename?: 'user_aggregate';
  aggregate?: Maybe<User_Aggregate_Fields>;
  nodes: Array<User>;
};

export type User_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<User_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<User_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<User_Aggregate_Bool_Exp_Count>;
};

export type User_Aggregate_Bool_Exp_Bool_And = {
  arguments: User_Select_Column_User_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Aggregate_Bool_Exp_Bool_Or = {
  arguments: User_Select_Column_User_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type User_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user" */
export type User_Aggregate_Fields = {
  __typename?: 'user_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<User_Max_Fields>;
  min?: Maybe<User_Min_Fields>;
};


/** aggregate fields of "user" */
export type User_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "user" */
export type User_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Max_Order_By>;
  min?: InputMaybe<User_Min_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type User_Append_Input = {
  roles?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "user" */
export type User_Arr_Rel_Insert_Input = {
  data: Array<User_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_On_Conflict>;
};

/** Boolean expression to filter rows from the table "user". All fields are combined with a logical 'AND'. */
export type User_Bool_Exp = {
  _and?: InputMaybe<Array<User_Bool_Exp>>;
  _not?: InputMaybe<User_Bool_Exp>;
  _or?: InputMaybe<Array<User_Bool_Exp>>;
  activeRole?: InputMaybe<String_Comparison_Exp>;
  app_uuid?: InputMaybe<String_Comparison_Exp>;
  createdAt?: InputMaybe<Timestamp_Comparison_Exp>;
  deletedAt?: InputMaybe<Timestamp_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  emailVerified?: InputMaybe<Boolean_Comparison_Exp>;
  firstName?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<String_Comparison_Exp>;
  image?: InputMaybe<String_Comparison_Exp>;
  isActive?: InputMaybe<Boolean_Comparison_Exp>;
  isAnonymous?: InputMaybe<Boolean_Comparison_Exp>;
  lastName?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organizationId?: InputMaybe<String_Comparison_Exp>;
  patientRecordsByCreatedBy?: InputMaybe<Patient_Record_Bool_Exp>;
  patientRecordsByCreatedBy_aggregate?: InputMaybe<Patient_Record_Aggregate_Bool_Exp>;
  patientRecordsByFirstViewedBy?: InputMaybe<Patient_Record_Bool_Exp>;
  patientRecordsByFirstViewedBy_aggregate?: InputMaybe<Patient_Record_Aggregate_Bool_Exp>;
  patientRecordsByLastActivityBy?: InputMaybe<Patient_Record_Bool_Exp>;
  patientRecordsByLastActivityBy_aggregate?: InputMaybe<Patient_Record_Aggregate_Bool_Exp>;
  patient_records?: InputMaybe<Patient_Record_Bool_Exp>;
  patient_records_aggregate?: InputMaybe<Patient_Record_Aggregate_Bool_Exp>;
  roles?: InputMaybe<Jsonb_Comparison_Exp>;
  updatedAt?: InputMaybe<Timestamp_Comparison_Exp>;
};

/** unique or primary key constraints on table "user" */
export enum User_Constraint {
  /** unique or primary key constraint on columns "email" */
  UserEmailKey = 'user_email_key',
  /** unique or primary key constraint on columns "email" */
  UserEmailUnique = 'user_email_unique',
  /** unique or primary key constraint on columns "id" */
  UserPkey = 'user_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type User_Delete_At_Path_Input = {
  roles?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type User_Delete_Elem_Input = {
  roles?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type User_Delete_Key_Input = {
  roles?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "user" */
export type User_Insert_Input = {
  activeRole?: InputMaybe<Scalars['String']['input']>;
  app_uuid?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  deletedAt?: InputMaybe<Scalars['timestamp']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailVerified?: InputMaybe<Scalars['Boolean']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isAnonymous?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  patientRecordsByCreatedBy?: InputMaybe<Patient_Record_Arr_Rel_Insert_Input>;
  patientRecordsByFirstViewedBy?: InputMaybe<Patient_Record_Arr_Rel_Insert_Input>;
  patientRecordsByLastActivityBy?: InputMaybe<Patient_Record_Arr_Rel_Insert_Input>;
  patient_records?: InputMaybe<Patient_Record_Arr_Rel_Insert_Input>;
  roles?: InputMaybe<Scalars['jsonb']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamp']['input']>;
};

/** aggregate max on columns */
export type User_Max_Fields = {
  __typename?: 'user_max_fields';
  activeRole?: Maybe<Scalars['String']['output']>;
  app_uuid?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamp']['output']>;
  deletedAt?: Maybe<Scalars['timestamp']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  organizationId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamp']['output']>;
};

/** order by max() on columns of table "user" */
export type User_Max_Order_By = {
  activeRole?: InputMaybe<Order_By>;
  app_uuid?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  deletedAt?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  firstName?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  lastName?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organizationId?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type User_Min_Fields = {
  __typename?: 'user_min_fields';
  activeRole?: Maybe<Scalars['String']['output']>;
  app_uuid?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['timestamp']['output']>;
  deletedAt?: Maybe<Scalars['timestamp']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  organizationId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['timestamp']['output']>;
};

/** order by min() on columns of table "user" */
export type User_Min_Order_By = {
  activeRole?: InputMaybe<Order_By>;
  app_uuid?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  deletedAt?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  firstName?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  lastName?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organizationId?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "user" */
export type User_Mutation_Response = {
  __typename?: 'user_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User>;
};

/** input type for inserting object relation for remote table "user" */
export type User_Obj_Rel_Insert_Input = {
  data: User_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<User_On_Conflict>;
};

/** on_conflict condition type for table "user" */
export type User_On_Conflict = {
  constraint: User_Constraint;
  update_columns?: Array<User_Update_Column>;
  where?: InputMaybe<User_Bool_Exp>;
};

/** Ordering options when selecting data from "user". */
export type User_Order_By = {
  activeRole?: InputMaybe<Order_By>;
  app_uuid?: InputMaybe<Order_By>;
  createdAt?: InputMaybe<Order_By>;
  deletedAt?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  emailVerified?: InputMaybe<Order_By>;
  firstName?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  isActive?: InputMaybe<Order_By>;
  isAnonymous?: InputMaybe<Order_By>;
  lastName?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organization_Order_By>;
  organizationId?: InputMaybe<Order_By>;
  patientRecordsByCreatedBy_aggregate?: InputMaybe<Patient_Record_Aggregate_Order_By>;
  patientRecordsByFirstViewedBy_aggregate?: InputMaybe<Patient_Record_Aggregate_Order_By>;
  patientRecordsByLastActivityBy_aggregate?: InputMaybe<Patient_Record_Aggregate_Order_By>;
  patient_records_aggregate?: InputMaybe<Patient_Record_Aggregate_Order_By>;
  roles?: InputMaybe<Order_By>;
  updatedAt?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user */
export type User_Pk_Columns_Input = {
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type User_Prepend_Input = {
  roles?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "user" */
export enum User_Select_Column {
  /** column name */
  ActiveRole = 'activeRole',
  /** column name */
  AppUuid = 'app_uuid',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DeletedAt = 'deletedAt',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerified = 'emailVerified',
  /** column name */
  FirstName = 'firstName',
  /** column name */
  Id = 'id',
  /** column name */
  Image = 'image',
  /** column name */
  IsActive = 'isActive',
  /** column name */
  IsAnonymous = 'isAnonymous',
  /** column name */
  LastName = 'lastName',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organizationId',
  /** column name */
  Roles = 'roles',
  /** column name */
  UpdatedAt = 'updatedAt'
}

/** select "user_aggregate_bool_exp_bool_and_arguments_columns" columns of table "user" */
export enum User_Select_Column_User_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  EmailVerified = 'emailVerified',
  /** column name */
  IsActive = 'isActive',
  /** column name */
  IsAnonymous = 'isAnonymous'
}

/** select "user_aggregate_bool_exp_bool_or_arguments_columns" columns of table "user" */
export enum User_Select_Column_User_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  EmailVerified = 'emailVerified',
  /** column name */
  IsActive = 'isActive',
  /** column name */
  IsAnonymous = 'isAnonymous'
}

/** input type for updating data in table "user" */
export type User_Set_Input = {
  activeRole?: InputMaybe<Scalars['String']['input']>;
  app_uuid?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  deletedAt?: InputMaybe<Scalars['timestamp']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailVerified?: InputMaybe<Scalars['Boolean']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isAnonymous?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Scalars['jsonb']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamp']['input']>;
};

/** Streaming cursor of the table "user" */
export type User_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Stream_Cursor_Value_Input = {
  activeRole?: InputMaybe<Scalars['String']['input']>;
  app_uuid?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  deletedAt?: InputMaybe<Scalars['timestamp']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailVerified?: InputMaybe<Scalars['Boolean']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isAnonymous?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Scalars['jsonb']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamp']['input']>;
};

/** update columns of table "user" */
export enum User_Update_Column {
  /** column name */
  ActiveRole = 'activeRole',
  /** column name */
  AppUuid = 'app_uuid',
  /** column name */
  CreatedAt = 'createdAt',
  /** column name */
  DeletedAt = 'deletedAt',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerified = 'emailVerified',
  /** column name */
  FirstName = 'firstName',
  /** column name */
  Id = 'id',
  /** column name */
  Image = 'image',
  /** column name */
  IsActive = 'isActive',
  /** column name */
  IsAnonymous = 'isAnonymous',
  /** column name */
  LastName = 'lastName',
  /** column name */
  Name = 'name',
  /** column name */
  OrganizationId = 'organizationId',
  /** column name */
  Roles = 'roles',
  /** column name */
  UpdatedAt = 'updatedAt'
}

export type User_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<User_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<User_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<User_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<User_Delete_Key_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<User_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Bool_Exp;
};

export type SearchPatientsByClinicIdQueryVariables = Exact<{
  clinicInternalId: Scalars['String']['input'];
}>;


export type SearchPatientsByClinicIdQuery = { __typename?: 'query_root', patient: Array<{ __typename?: 'patient', id: string, clinic_internal_id: string, first_name_encrypted: string, last_name_encrypted: string, date_of_birth_encrypted?: string | null, gender_encrypted?: string | null, created_at?: any | null, organization_id: string }> };

export type GetOrganizationPhysiciansQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrganizationPhysiciansQuery = { __typename?: 'query_root', user: Array<{ __typename?: 'user', id: string, firstName?: string | null, lastName?: string | null, email: string }> };

export type CreatePatientMutationVariables = Exact<{
  patient: Patient_Insert_Input;
}>;


export type CreatePatientMutation = { __typename?: 'mutation_root', insert_patient_one?: { __typename?: 'patient', id: string, clinic_internal_id: string, first_name_encrypted: string, last_name_encrypted: string, date_of_birth_encrypted?: string | null, gender_encrypted?: string | null, created_at?: any | null, organization_id: string } | null };

export type CreatePatientRecordMutationVariables = Exact<{
  patientRecord: Patient_Record_Insert_Input;
}>;


export type CreatePatientRecordMutation = { __typename?: 'mutation_root', insert_patient_record_one?: { __typename?: 'patient_record', id: string, patient_id: string, assigned_to: string, notes?: string | null, created_at?: any | null, created_by: string, organization_id: string, patient: { __typename?: 'patient', id: string, clinic_internal_id: string, first_name_encrypted: string, last_name_encrypted: string }, user: { __typename?: 'user', id: string, firstName?: string | null, lastName?: string | null, email: string } } | null };

export type GetOrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOrganizationsQuery = { __typename?: 'query_root', organization: Array<{ __typename?: 'organization', id: string, name: string, city?: string | null, created_at?: any | null }> };

export type GetPatientRecordsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type GetPatientRecordsQuery = { __typename?: 'query_root', patient_record: Array<{ __typename?: 'patient_record', id: string, created_at?: any | null, organization_id: string, notes?: string | null }> };

export type SubmitPatientConsentMutationVariables = Exact<{
  invite_token: Scalars['String']['input'];
  consent_data: ConsentInput;
}>;


export type SubmitPatientConsentMutation = { __typename?: 'mutation_root', submitPatientConsent: { __typename?: 'ConsentResponse', success: boolean, patient_consent_id?: any | null, error?: string | null } };

export type SubmitQuestionnaireResponseMutationVariables = Exact<{
  invite_token: Scalars['String']['input'];
  response_data: QuestionnaireResponseInput;
}>;


export type SubmitQuestionnaireResponseMutation = { __typename?: 'mutation_root', submitQuestionnaireResponse: { __typename?: 'QuestionnaireResponseResponse', success: boolean, questionnaire_response_id?: any | null, error?: string | null } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const SearchPatientsByClinicIdDocument = new TypedDocumentString(`
    query SearchPatientsByClinicId($clinicInternalId: String!) {
  patient(where: {clinic_internal_id: {_eq: $clinicInternalId}}) {
    id
    clinic_internal_id
    first_name_encrypted
    last_name_encrypted
    date_of_birth_encrypted
    gender_encrypted
    created_at
    organization_id
  }
}
    `) as unknown as TypedDocumentString<SearchPatientsByClinicIdQuery, SearchPatientsByClinicIdQueryVariables>;
export const GetOrganizationPhysiciansDocument = new TypedDocumentString(`
    query GetOrganizationPhysicians {
  user {
    id
    firstName
    lastName
    email
  }
}
    `) as unknown as TypedDocumentString<GetOrganizationPhysiciansQuery, GetOrganizationPhysiciansQueryVariables>;
export const CreatePatientDocument = new TypedDocumentString(`
    mutation CreatePatient($patient: patient_insert_input!) {
  insert_patient_one(object: $patient) {
    id
    clinic_internal_id
    first_name_encrypted
    last_name_encrypted
    date_of_birth_encrypted
    gender_encrypted
    created_at
    organization_id
  }
}
    `) as unknown as TypedDocumentString<CreatePatientMutation, CreatePatientMutationVariables>;
export const CreatePatientRecordDocument = new TypedDocumentString(`
    mutation CreatePatientRecord($patientRecord: patient_record_insert_input!) {
  insert_patient_record_one(object: $patientRecord) {
    id
    patient_id
    assigned_to
    notes
    created_at
    created_by
    organization_id
    patient {
      id
      clinic_internal_id
      first_name_encrypted
      last_name_encrypted
    }
    user {
      id
      firstName
      lastName
      email
    }
  }
}
    `) as unknown as TypedDocumentString<CreatePatientRecordMutation, CreatePatientRecordMutationVariables>;
export const GetOrganizationsDocument = new TypedDocumentString(`
    query GetOrganizations {
  organization {
    id
    name
    city
    created_at
  }
}
    `) as unknown as TypedDocumentString<GetOrganizationsQuery, GetOrganizationsQueryVariables>;
export const GetPatientRecordsDocument = new TypedDocumentString(`
    query GetPatientRecords($organizationId: String!) {
  patient_record(
    where: {organization_id: {_eq: $organizationId}}
    order_by: {created_at: desc}
  ) {
    id
    created_at
    organization_id
    notes
  }
}
    `) as unknown as TypedDocumentString<GetPatientRecordsQuery, GetPatientRecordsQueryVariables>;
export const SubmitPatientConsentDocument = new TypedDocumentString(`
    mutation SubmitPatientConsent($invite_token: String!, $consent_data: ConsentInput!) {
  submitPatientConsent(invite_token: $invite_token, consent_data: $consent_data) {
    success
    patient_consent_id
    error
  }
}
    `) as unknown as TypedDocumentString<SubmitPatientConsentMutation, SubmitPatientConsentMutationVariables>;
export const SubmitQuestionnaireResponseDocument = new TypedDocumentString(`
    mutation SubmitQuestionnaireResponse($invite_token: String!, $response_data: QuestionnaireResponseInput!) {
  submitQuestionnaireResponse(
    invite_token: $invite_token
    response_data: $response_data
  ) {
    success
    questionnaire_response_id
    error
  }
}
    `) as unknown as TypedDocumentString<SubmitQuestionnaireResponseMutation, SubmitQuestionnaireResponseMutationVariables>;