/* eslint-disable */
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
  /** delete data from the table: "patient_registration" */
  delete_patient_registration?: Maybe<Patient_Registration_Mutation_Response>;
  /** delete single row from the table: "patient_registration" */
  delete_patient_registration_by_pk?: Maybe<Patient_Registration>;
  /** delete data from the table: "practitioner" */
  delete_practitioner?: Maybe<Practitioner_Mutation_Response>;
  /** delete single row from the table: "practitioner" */
  delete_practitioner_by_pk?: Maybe<Practitioner>;
  /** delete data from the table: "questionnaire_response" */
  delete_questionnaire_response?: Maybe<Questionnaire_Response_Mutation_Response>;
  /** delete single row from the table: "questionnaire_response" */
  delete_questionnaire_response_by_pk?: Maybe<Questionnaire_Response>;
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
  /** insert data into the table: "patient_registration" */
  insert_patient_registration?: Maybe<Patient_Registration_Mutation_Response>;
  /** insert a single row into the table: "patient_registration" */
  insert_patient_registration_one?: Maybe<Patient_Registration>;
  /** insert data into the table: "practitioner" */
  insert_practitioner?: Maybe<Practitioner_Mutation_Response>;
  /** insert a single row into the table: "practitioner" */
  insert_practitioner_one?: Maybe<Practitioner>;
  /** insert data into the table: "questionnaire_response" */
  insert_questionnaire_response?: Maybe<Questionnaire_Response_Mutation_Response>;
  /** insert a single row into the table: "questionnaire_response" */
  insert_questionnaire_response_one?: Maybe<Questionnaire_Response>;
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
  /** update data of the table: "patient_registration" */
  update_patient_registration?: Maybe<Patient_Registration_Mutation_Response>;
  /** update single row of the table: "patient_registration" */
  update_patient_registration_by_pk?: Maybe<Patient_Registration>;
  /** update multiples rows of table: "patient_registration" */
  update_patient_registration_many?: Maybe<Array<Maybe<Patient_Registration_Mutation_Response>>>;
  /** update data of the table: "practitioner" */
  update_practitioner?: Maybe<Practitioner_Mutation_Response>;
  /** update single row of the table: "practitioner" */
  update_practitioner_by_pk?: Maybe<Practitioner>;
  /** update multiples rows of table: "practitioner" */
  update_practitioner_many?: Maybe<Array<Maybe<Practitioner_Mutation_Response>>>;
  /** update data of the table: "questionnaire_response" */
  update_questionnaire_response?: Maybe<Questionnaire_Response_Mutation_Response>;
  /** update single row of the table: "questionnaire_response" */
  update_questionnaire_response_by_pk?: Maybe<Questionnaire_Response>;
  /** update multiples rows of table: "questionnaire_response" */
  update_questionnaire_response_many?: Maybe<Array<Maybe<Questionnaire_Response_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_OrganizationArgs = {
  where: Organization_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Organization_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_PatientArgs = {
  where: Patient_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Patient_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Patient_ConsentArgs = {
  where: Patient_Consent_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Patient_Consent_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Patient_RegistrationArgs = {
  where: Patient_Registration_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Patient_Registration_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_PractitionerArgs = {
  where: Practitioner_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Practitioner_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Questionnaire_ResponseArgs = {
  where: Questionnaire_Response_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Questionnaire_Response_By_PkArgs = {
  id: Scalars['uuid']['input'];
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
export type Mutation_RootInsert_Patient_RegistrationArgs = {
  objects: Array<Patient_Registration_Insert_Input>;
  on_conflict?: InputMaybe<Patient_Registration_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Patient_Registration_OneArgs = {
  object: Patient_Registration_Insert_Input;
  on_conflict?: InputMaybe<Patient_Registration_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_PractitionerArgs = {
  objects: Array<Practitioner_Insert_Input>;
  on_conflict?: InputMaybe<Practitioner_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Practitioner_OneArgs = {
  object: Practitioner_Insert_Input;
  on_conflict?: InputMaybe<Practitioner_On_Conflict>;
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
export type Mutation_RootUpdate_Patient_RegistrationArgs = {
  _set?: InputMaybe<Patient_Registration_Set_Input>;
  where: Patient_Registration_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_Registration_By_PkArgs = {
  _set?: InputMaybe<Patient_Registration_Set_Input>;
  pk_columns: Patient_Registration_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Patient_Registration_ManyArgs = {
  updates: Array<Patient_Registration_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_PractitionerArgs = {
  _set?: InputMaybe<Practitioner_Set_Input>;
  where: Practitioner_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Practitioner_By_PkArgs = {
  _set?: InputMaybe<Practitioner_Set_Input>;
  pk_columns: Practitioner_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Practitioner_ManyArgs = {
  updates: Array<Practitioner_Updates>;
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
  id: Scalars['uuid']['output'];
  name: Scalars['String']['output'];
  /** An array relationship */
  patient_consents: Array<Patient_Consent>;
  /** An aggregate relationship */
  patient_consents_aggregate: Patient_Consent_Aggregate;
  /** An array relationship */
  patient_registrations: Array<Patient_Registration>;
  /** An aggregate relationship */
  patient_registrations_aggregate: Patient_Registration_Aggregate;
  /** An array relationship */
  patients: Array<Patient>;
  /** An aggregate relationship */
  patients_aggregate: Patient_Aggregate;
  phone?: Maybe<Scalars['String']['output']>;
  postal_code?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  practitioners: Array<Practitioner>;
  /** An aggregate relationship */
  practitioners_aggregate: Practitioner_Aggregate;
  /** An array relationship */
  questionnaire_responses: Array<Questionnaire_Response>;
  /** An aggregate relationship */
  questionnaire_responses_aggregate: Questionnaire_Response_Aggregate;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
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
export type OrganizationPatient_RegistrationsArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationPatient_Registrations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
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
export type OrganizationPractitionersArgs = {
  distinct_on?: InputMaybe<Array<Practitioner_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Practitioner_Order_By>>;
  where?: InputMaybe<Practitioner_Bool_Exp>;
};


/** columns and relationships of "organization" */
export type OrganizationPractitioners_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Practitioner_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Practitioner_Order_By>>;
  where?: InputMaybe<Practitioner_Bool_Exp>;
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
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  patient_consents?: InputMaybe<Patient_Consent_Bool_Exp>;
  patient_consents_aggregate?: InputMaybe<Patient_Consent_Aggregate_Bool_Exp>;
  patient_registrations?: InputMaybe<Patient_Registration_Bool_Exp>;
  patient_registrations_aggregate?: InputMaybe<Patient_Registration_Aggregate_Bool_Exp>;
  patients?: InputMaybe<Patient_Bool_Exp>;
  patients_aggregate?: InputMaybe<Patient_Aggregate_Bool_Exp>;
  phone?: InputMaybe<String_Comparison_Exp>;
  postal_code?: InputMaybe<String_Comparison_Exp>;
  practitioners?: InputMaybe<Practitioner_Bool_Exp>;
  practitioners_aggregate?: InputMaybe<Practitioner_Aggregate_Bool_Exp>;
  questionnaire_responses?: InputMaybe<Questionnaire_Response_Bool_Exp>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
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
  id?: InputMaybe<Scalars['uuid']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  patient_consents?: InputMaybe<Patient_Consent_Arr_Rel_Insert_Input>;
  patient_registrations?: InputMaybe<Patient_Registration_Arr_Rel_Insert_Input>;
  patients?: InputMaybe<Patient_Arr_Rel_Insert_Input>;
  phone?: InputMaybe<Scalars['String']['input']>;
  postal_code?: InputMaybe<Scalars['String']['input']>;
  practitioners?: InputMaybe<Practitioner_Arr_Rel_Insert_Input>;
  questionnaire_responses?: InputMaybe<Questionnaire_Response_Arr_Rel_Insert_Input>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
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
  id?: Maybe<Scalars['uuid']['output']>;
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
  id?: Maybe<Scalars['uuid']['output']>;
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
  patient_registrations_aggregate?: InputMaybe<Patient_Registration_Aggregate_Order_By>;
  patients_aggregate?: InputMaybe<Patient_Aggregate_Order_By>;
  phone?: InputMaybe<Order_By>;
  postal_code?: InputMaybe<Order_By>;
  practitioners_aggregate?: InputMaybe<Practitioner_Aggregate_Order_By>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
};

/** primary key columns input for table: organization */
export type Organization_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
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
  id?: InputMaybe<Scalars['uuid']['input']>;
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
  id?: InputMaybe<Scalars['uuid']['input']>;
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
  id: Scalars['uuid']['output'];
  last_name_encrypted: Scalars['String']['output'];
  /** An object relationship */
  organization: Organization;
  organization_id: Scalars['uuid']['output'];
  /** An array relationship */
  patient_registrations: Array<Patient_Registration>;
  /** An aggregate relationship */
  patient_registrations_aggregate: Patient_Registration_Aggregate;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "patient" */
export type PatientPatient_RegistrationsArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


/** columns and relationships of "patient" */
export type PatientPatient_Registrations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
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
  id?: InputMaybe<Uuid_Comparison_Exp>;
  last_name_encrypted?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organization_id?: InputMaybe<Uuid_Comparison_Exp>;
  patient_registrations?: InputMaybe<Patient_Registration_Bool_Exp>;
  patient_registrations_aggregate?: InputMaybe<Patient_Registration_Aggregate_Bool_Exp>;
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
  id: Scalars['uuid']['output'];
  ip_address?: Maybe<Scalars['inet']['output']>;
  /** An object relationship */
  organization: Organization;
  organization_id: Scalars['uuid']['output'];
  /** An object relationship */
  patient_registration: Patient_Registration;
  patient_registration_id: Scalars['uuid']['output'];
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
  id?: InputMaybe<Uuid_Comparison_Exp>;
  ip_address?: InputMaybe<Inet_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organization_id?: InputMaybe<Uuid_Comparison_Exp>;
  patient_registration?: InputMaybe<Patient_Registration_Bool_Exp>;
  patient_registration_id?: InputMaybe<Uuid_Comparison_Exp>;
  questionnaire_responses?: InputMaybe<Questionnaire_Response_Bool_Exp>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Bool_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_agent?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "patient_consent" */
export enum Patient_Consent_Constraint {
  /** unique or primary key constraint on columns "id" */
  PatientConsentPkey = 'patient_consent_pkey',
  /** unique or primary key constraint on columns "patient_registration_id" */
  UkConsentPerRegistration = 'uk_consent_per_registration'
}

/** input type for inserting data into table "patient_consent" */
export type Patient_Consent_Insert_Input = {
  consent_given?: InputMaybe<Scalars['Boolean']['input']>;
  consent_text?: InputMaybe<Scalars['String']['input']>;
  consent_version?: InputMaybe<Scalars['String']['input']>;
  consented_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['inet']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_registration?: InputMaybe<Patient_Registration_Obj_Rel_Insert_Input>;
  patient_registration_id?: InputMaybe<Scalars['uuid']['input']>;
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
  id?: Maybe<Scalars['uuid']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  patient_registration_id?: Maybe<Scalars['uuid']['output']>;
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
  patient_registration_id?: InputMaybe<Order_By>;
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
  id?: Maybe<Scalars['uuid']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  patient_registration_id?: Maybe<Scalars['uuid']['output']>;
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
  patient_registration_id?: InputMaybe<Order_By>;
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
  patient_registration?: InputMaybe<Patient_Registration_Order_By>;
  patient_registration_id?: InputMaybe<Order_By>;
  questionnaire_responses_aggregate?: InputMaybe<Questionnaire_Response_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_agent?: InputMaybe<Order_By>;
};

/** primary key columns input for table: patient_consent */
export type Patient_Consent_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
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
  PatientRegistrationId = 'patient_registration_id',
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
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['inet']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_registration_id?: InputMaybe<Scalars['uuid']['input']>;
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
  id?: InputMaybe<Scalars['uuid']['input']>;
  ip_address?: InputMaybe<Scalars['inet']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_registration_id?: InputMaybe<Scalars['uuid']['input']>;
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
  PatientRegistrationId = 'patient_registration_id',
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
  /** unique or primary key constraint on columns "id" */
  PatientPkey = 'patient_pkey',
  /** unique or primary key constraint on columns "organization_id", "clinic_internal_id" */
  UkPatientClinicIdOrg = 'uk_patient_clinic_id_org'
}

/** input type for inserting data into table "patient" */
export type Patient_Insert_Input = {
  clinic_internal_id?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  date_of_birth_encrypted?: InputMaybe<Scalars['String']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  first_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  gender_encrypted?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_registrations?: InputMaybe<Patient_Registration_Arr_Rel_Insert_Input>;
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
  id?: Maybe<Scalars['uuid']['output']>;
  last_name_encrypted?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
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
  id?: Maybe<Scalars['uuid']['output']>;
  last_name_encrypted?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
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
  patient_registrations_aggregate?: InputMaybe<Patient_Registration_Aggregate_Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: patient */
export type Patient_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** columns and relationships of "patient_registration" */
export type Patient_Registration = {
  __typename?: 'patient_registration';
  assigned_practitioner_id: Scalars['uuid']['output'];
  /** An object relationship */
  assigned_to_practitioner: Practitioner;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  created_by_practitioner: Practitioner;
  created_by_practitioner_id: Scalars['uuid']['output'];
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id: Scalars['uuid']['output'];
  link_expires_at: Scalars['timestamptz']['output'];
  link_token: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  organization: Organization;
  organization_id: Scalars['uuid']['output'];
  /** An object relationship */
  patient: Patient;
  /** An object relationship */
  patient_consent?: Maybe<Patient_Consent>;
  patient_id: Scalars['uuid']['output'];
  /** An object relationship */
  questionnaire_response?: Maybe<Questionnaire_Response>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregated selection of "patient_registration" */
export type Patient_Registration_Aggregate = {
  __typename?: 'patient_registration_aggregate';
  aggregate?: Maybe<Patient_Registration_Aggregate_Fields>;
  nodes: Array<Patient_Registration>;
};

export type Patient_Registration_Aggregate_Bool_Exp = {
  count?: InputMaybe<Patient_Registration_Aggregate_Bool_Exp_Count>;
};

export type Patient_Registration_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Patient_Registration_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "patient_registration" */
export type Patient_Registration_Aggregate_Fields = {
  __typename?: 'patient_registration_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Patient_Registration_Max_Fields>;
  min?: Maybe<Patient_Registration_Min_Fields>;
};


/** aggregate fields of "patient_registration" */
export type Patient_Registration_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "patient_registration" */
export type Patient_Registration_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Patient_Registration_Max_Order_By>;
  min?: InputMaybe<Patient_Registration_Min_Order_By>;
};

/** input type for inserting array relation for remote table "patient_registration" */
export type Patient_Registration_Arr_Rel_Insert_Input = {
  data: Array<Patient_Registration_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Patient_Registration_On_Conflict>;
};

/** Boolean expression to filter rows from the table "patient_registration". All fields are combined with a logical 'AND'. */
export type Patient_Registration_Bool_Exp = {
  _and?: InputMaybe<Array<Patient_Registration_Bool_Exp>>;
  _not?: InputMaybe<Patient_Registration_Bool_Exp>;
  _or?: InputMaybe<Array<Patient_Registration_Bool_Exp>>;
  assigned_practitioner_id?: InputMaybe<Uuid_Comparison_Exp>;
  assigned_to_practitioner?: InputMaybe<Practitioner_Bool_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  created_by_practitioner?: InputMaybe<Practitioner_Bool_Exp>;
  created_by_practitioner_id?: InputMaybe<Uuid_Comparison_Exp>;
  deleted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  link_expires_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  link_token?: InputMaybe<String_Comparison_Exp>;
  notes?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organization_id?: InputMaybe<Uuid_Comparison_Exp>;
  patient?: InputMaybe<Patient_Bool_Exp>;
  patient_consent?: InputMaybe<Patient_Consent_Bool_Exp>;
  patient_id?: InputMaybe<Uuid_Comparison_Exp>;
  questionnaire_response?: InputMaybe<Questionnaire_Response_Bool_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "patient_registration" */
export enum Patient_Registration_Constraint {
  /** unique or primary key constraint on columns "link_token" */
  PatientRegistrationLinkTokenKey = 'patient_registration_link_token_key',
  /** unique or primary key constraint on columns "id" */
  PatientRegistrationPkey = 'patient_registration_pkey'
}

/** input type for inserting data into table "patient_registration" */
export type Patient_Registration_Insert_Input = {
  assigned_practitioner_id?: InputMaybe<Scalars['uuid']['input']>;
  assigned_to_practitioner?: InputMaybe<Practitioner_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by_practitioner?: InputMaybe<Practitioner_Obj_Rel_Insert_Input>;
  created_by_practitioner_id?: InputMaybe<Scalars['uuid']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  link_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  link_token?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient?: InputMaybe<Patient_Obj_Rel_Insert_Input>;
  patient_consent?: InputMaybe<Patient_Consent_Obj_Rel_Insert_Input>;
  patient_id?: InputMaybe<Scalars['uuid']['input']>;
  questionnaire_response?: InputMaybe<Questionnaire_Response_Obj_Rel_Insert_Input>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Patient_Registration_Max_Fields = {
  __typename?: 'patient_registration_max_fields';
  assigned_practitioner_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by_practitioner_id?: Maybe<Scalars['uuid']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  link_expires_at?: Maybe<Scalars['timestamptz']['output']>;
  link_token?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  patient_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "patient_registration" */
export type Patient_Registration_Max_Order_By = {
  assigned_practitioner_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by_practitioner_id?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  link_expires_at?: InputMaybe<Order_By>;
  link_token?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Patient_Registration_Min_Fields = {
  __typename?: 'patient_registration_min_fields';
  assigned_practitioner_id?: Maybe<Scalars['uuid']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  created_by_practitioner_id?: Maybe<Scalars['uuid']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  link_expires_at?: Maybe<Scalars['timestamptz']['output']>;
  link_token?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  patient_id?: Maybe<Scalars['uuid']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "patient_registration" */
export type Patient_Registration_Min_Order_By = {
  assigned_practitioner_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by_practitioner_id?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  link_expires_at?: InputMaybe<Order_By>;
  link_token?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "patient_registration" */
export type Patient_Registration_Mutation_Response = {
  __typename?: 'patient_registration_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Patient_Registration>;
};

/** input type for inserting object relation for remote table "patient_registration" */
export type Patient_Registration_Obj_Rel_Insert_Input = {
  data: Patient_Registration_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Patient_Registration_On_Conflict>;
};

/** on_conflict condition type for table "patient_registration" */
export type Patient_Registration_On_Conflict = {
  constraint: Patient_Registration_Constraint;
  update_columns?: Array<Patient_Registration_Update_Column>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};

/** Ordering options when selecting data from "patient_registration". */
export type Patient_Registration_Order_By = {
  assigned_practitioner_id?: InputMaybe<Order_By>;
  assigned_to_practitioner?: InputMaybe<Practitioner_Order_By>;
  created_at?: InputMaybe<Order_By>;
  created_by_practitioner?: InputMaybe<Practitioner_Order_By>;
  created_by_practitioner_id?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  link_expires_at?: InputMaybe<Order_By>;
  link_token?: InputMaybe<Order_By>;
  notes?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organization_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patient?: InputMaybe<Patient_Order_By>;
  patient_consent?: InputMaybe<Patient_Consent_Order_By>;
  patient_id?: InputMaybe<Order_By>;
  questionnaire_response?: InputMaybe<Questionnaire_Response_Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: patient_registration */
export type Patient_Registration_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "patient_registration" */
export enum Patient_Registration_Select_Column {
  /** column name */
  AssignedPractitionerId = 'assigned_practitioner_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedByPractitionerId = 'created_by_practitioner_id',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Id = 'id',
  /** column name */
  LinkExpiresAt = 'link_expires_at',
  /** column name */
  LinkToken = 'link_token',
  /** column name */
  Notes = 'notes',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  PatientId = 'patient_id',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "patient_registration" */
export type Patient_Registration_Set_Input = {
  assigned_practitioner_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by_practitioner_id?: InputMaybe<Scalars['uuid']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  link_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  link_token?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "patient_registration" */
export type Patient_Registration_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Patient_Registration_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Patient_Registration_Stream_Cursor_Value_Input = {
  assigned_practitioner_id?: InputMaybe<Scalars['uuid']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  created_by_practitioner_id?: InputMaybe<Scalars['uuid']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  link_expires_at?: InputMaybe<Scalars['timestamptz']['input']>;
  link_token?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_id?: InputMaybe<Scalars['uuid']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "patient_registration" */
export enum Patient_Registration_Update_Column {
  /** column name */
  AssignedPractitionerId = 'assigned_practitioner_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CreatedByPractitionerId = 'created_by_practitioner_id',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Id = 'id',
  /** column name */
  LinkExpiresAt = 'link_expires_at',
  /** column name */
  LinkToken = 'link_token',
  /** column name */
  Notes = 'notes',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  PatientId = 'patient_id',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Patient_Registration_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Patient_Registration_Set_Input>;
  /** filter the rows which have to be updated */
  where: Patient_Registration_Bool_Exp;
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
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
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
  id?: InputMaybe<Scalars['uuid']['input']>;
  last_name_encrypted?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
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

/** columns and relationships of "practitioner" */
export type Practitioner = {
  __typename?: 'practitioner';
  auth_user_id: Scalars['String']['output'];
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  email: Scalars['String']['output'];
  first_name: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  is_active?: Maybe<Scalars['Boolean']['output']>;
  last_name: Scalars['String']['output'];
  /** An object relationship */
  organization: Organization;
  organization_id: Scalars['uuid']['output'];
  /** An array relationship */
  patientRegistrationsByCreatedByPractitionerId: Array<Patient_Registration>;
  /** An aggregate relationship */
  patientRegistrationsByCreatedByPractitionerId_aggregate: Patient_Registration_Aggregate;
  /** An array relationship */
  patient_registrations: Array<Patient_Registration>;
  /** An aggregate relationship */
  patient_registrations_aggregate: Patient_Registration_Aggregate;
  role: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};


/** columns and relationships of "practitioner" */
export type PractitionerPatientRegistrationsByCreatedByPractitionerIdArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


/** columns and relationships of "practitioner" */
export type PractitionerPatientRegistrationsByCreatedByPractitionerId_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


/** columns and relationships of "practitioner" */
export type PractitionerPatient_RegistrationsArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


/** columns and relationships of "practitioner" */
export type PractitionerPatient_Registrations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};

/** aggregated selection of "practitioner" */
export type Practitioner_Aggregate = {
  __typename?: 'practitioner_aggregate';
  aggregate?: Maybe<Practitioner_Aggregate_Fields>;
  nodes: Array<Practitioner>;
};

export type Practitioner_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Practitioner_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Practitioner_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Practitioner_Aggregate_Bool_Exp_Count>;
};

export type Practitioner_Aggregate_Bool_Exp_Bool_And = {
  arguments: Practitioner_Select_Column_Practitioner_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Practitioner_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Practitioner_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Practitioner_Select_Column_Practitioner_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Practitioner_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Practitioner_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Practitioner_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Practitioner_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "practitioner" */
export type Practitioner_Aggregate_Fields = {
  __typename?: 'practitioner_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Practitioner_Max_Fields>;
  min?: Maybe<Practitioner_Min_Fields>;
};


/** aggregate fields of "practitioner" */
export type Practitioner_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Practitioner_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "practitioner" */
export type Practitioner_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Practitioner_Max_Order_By>;
  min?: InputMaybe<Practitioner_Min_Order_By>;
};

/** input type for inserting array relation for remote table "practitioner" */
export type Practitioner_Arr_Rel_Insert_Input = {
  data: Array<Practitioner_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Practitioner_On_Conflict>;
};

/** Boolean expression to filter rows from the table "practitioner". All fields are combined with a logical 'AND'. */
export type Practitioner_Bool_Exp = {
  _and?: InputMaybe<Array<Practitioner_Bool_Exp>>;
  _not?: InputMaybe<Practitioner_Bool_Exp>;
  _or?: InputMaybe<Array<Practitioner_Bool_Exp>>;
  auth_user_id?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  deleted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  first_name?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  is_active?: InputMaybe<Boolean_Comparison_Exp>;
  last_name?: InputMaybe<String_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organization_id?: InputMaybe<Uuid_Comparison_Exp>;
  patientRegistrationsByCreatedByPractitionerId?: InputMaybe<Patient_Registration_Bool_Exp>;
  patientRegistrationsByCreatedByPractitionerId_aggregate?: InputMaybe<Patient_Registration_Aggregate_Bool_Exp>;
  patient_registrations?: InputMaybe<Patient_Registration_Bool_Exp>;
  patient_registrations_aggregate?: InputMaybe<Patient_Registration_Aggregate_Bool_Exp>;
  role?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "practitioner" */
export enum Practitioner_Constraint {
  /** unique or primary key constraint on columns "auth_user_id" */
  PractitionerAuthUserIdKey = 'practitioner_auth_user_id_key',
  /** unique or primary key constraint on columns "email" */
  PractitionerEmailKey = 'practitioner_email_key',
  /** unique or primary key constraint on columns "id" */
  PractitionerPkey = 'practitioner_pkey'
}

/** input type for inserting data into table "practitioner" */
export type Practitioner_Insert_Input = {
  auth_user_id?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patientRegistrationsByCreatedByPractitionerId?: InputMaybe<Patient_Registration_Arr_Rel_Insert_Input>;
  patient_registrations?: InputMaybe<Patient_Registration_Arr_Rel_Insert_Input>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Practitioner_Max_Fields = {
  __typename?: 'practitioner_max_fields';
  auth_user_id?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "practitioner" */
export type Practitioner_Max_Order_By = {
  auth_user_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  first_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_name?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  role?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Practitioner_Min_Fields = {
  __typename?: 'practitioner_min_fields';
  auth_user_id?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "practitioner" */
export type Practitioner_Min_Order_By = {
  auth_user_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  first_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  last_name?: InputMaybe<Order_By>;
  organization_id?: InputMaybe<Order_By>;
  role?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "practitioner" */
export type Practitioner_Mutation_Response = {
  __typename?: 'practitioner_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Practitioner>;
};

/** input type for inserting object relation for remote table "practitioner" */
export type Practitioner_Obj_Rel_Insert_Input = {
  data: Practitioner_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Practitioner_On_Conflict>;
};

/** on_conflict condition type for table "practitioner" */
export type Practitioner_On_Conflict = {
  constraint: Practitioner_Constraint;
  update_columns?: Array<Practitioner_Update_Column>;
  where?: InputMaybe<Practitioner_Bool_Exp>;
};

/** Ordering options when selecting data from "practitioner". */
export type Practitioner_Order_By = {
  auth_user_id?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  deleted_at?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  first_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  is_active?: InputMaybe<Order_By>;
  last_name?: InputMaybe<Order_By>;
  organization?: InputMaybe<Organization_Order_By>;
  organization_id?: InputMaybe<Order_By>;
  patientRegistrationsByCreatedByPractitionerId_aggregate?: InputMaybe<Patient_Registration_Aggregate_Order_By>;
  patient_registrations_aggregate?: InputMaybe<Patient_Registration_Aggregate_Order_By>;
  role?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: practitioner */
export type Practitioner_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "practitioner" */
export enum Practitioner_Select_Column {
  /** column name */
  AuthUserId = 'auth_user_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  LastName = 'last_name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Role = 'role',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** select "practitioner_aggregate_bool_exp_bool_and_arguments_columns" columns of table "practitioner" */
export enum Practitioner_Select_Column_Practitioner_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** select "practitioner_aggregate_bool_exp_bool_or_arguments_columns" columns of table "practitioner" */
export enum Practitioner_Select_Column_Practitioner_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsActive = 'is_active'
}

/** input type for updating data in table "practitioner" */
export type Practitioner_Set_Input = {
  auth_user_id?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "practitioner" */
export type Practitioner_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Practitioner_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Practitioner_Stream_Cursor_Value_Input = {
  auth_user_id?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  deleted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "practitioner" */
export enum Practitioner_Update_Column {
  /** column name */
  AuthUserId = 'auth_user_id',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DeletedAt = 'deleted_at',
  /** column name */
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  Id = 'id',
  /** column name */
  IsActive = 'is_active',
  /** column name */
  LastName = 'last_name',
  /** column name */
  OrganizationId = 'organization_id',
  /** column name */
  Role = 'role',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Practitioner_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Practitioner_Set_Input>;
  /** filter the rows which have to be updated */
  where: Practitioner_Bool_Exp;
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
  /** fetch data from the table: "patient_registration" */
  patient_registration: Array<Patient_Registration>;
  /** fetch aggregated fields from the table: "patient_registration" */
  patient_registration_aggregate: Patient_Registration_Aggregate;
  /** fetch data from the table: "patient_registration" using primary key columns */
  patient_registration_by_pk?: Maybe<Patient_Registration>;
  /** fetch data from the table: "practitioner" */
  practitioner: Array<Practitioner>;
  /** fetch aggregated fields from the table: "practitioner" */
  practitioner_aggregate: Practitioner_Aggregate;
  /** fetch data from the table: "practitioner" using primary key columns */
  practitioner_by_pk?: Maybe<Practitioner>;
  /** fetch data from the table: "questionnaire_response" */
  questionnaire_response: Array<Questionnaire_Response>;
  /** fetch aggregated fields from the table: "questionnaire_response" */
  questionnaire_response_aggregate: Questionnaire_Response_Aggregate;
  /** fetch data from the table: "questionnaire_response" using primary key columns */
  questionnaire_response_by_pk?: Maybe<Questionnaire_Response>;
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
  id: Scalars['uuid']['input'];
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
  id: Scalars['uuid']['input'];
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
  id: Scalars['uuid']['input'];
};


export type Query_RootPatient_RegistrationArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


export type Query_RootPatient_Registration_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


export type Query_RootPatient_Registration_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootPractitionerArgs = {
  distinct_on?: InputMaybe<Array<Practitioner_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Practitioner_Order_By>>;
  where?: InputMaybe<Practitioner_Bool_Exp>;
};


export type Query_RootPractitioner_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Practitioner_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Practitioner_Order_By>>;
  where?: InputMaybe<Practitioner_Bool_Exp>;
};


export type Query_RootPractitioner_By_PkArgs = {
  id: Scalars['uuid']['input'];
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
  id: Scalars['uuid']['input'];
};

/** columns and relationships of "questionnaire_response" */
export type Questionnaire_Response = {
  __typename?: 'questionnaire_response';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  fhir_resource: Scalars['jsonb']['output'];
  id: Scalars['uuid']['output'];
  /** An object relationship */
  organization: Organization;
  organization_id: Scalars['uuid']['output'];
  /** An object relationship */
  patient_consent: Patient_Consent;
  patient_consent_id: Scalars['uuid']['output'];
  /** An object relationship */
  patient_registration: Patient_Registration;
  patient_registration_id: Scalars['uuid']['output'];
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
  id?: InputMaybe<Uuid_Comparison_Exp>;
  organization?: InputMaybe<Organization_Bool_Exp>;
  organization_id?: InputMaybe<Uuid_Comparison_Exp>;
  patient_consent?: InputMaybe<Patient_Consent_Bool_Exp>;
  patient_consent_id?: InputMaybe<Uuid_Comparison_Exp>;
  patient_registration?: InputMaybe<Patient_Registration_Bool_Exp>;
  patient_registration_id?: InputMaybe<Uuid_Comparison_Exp>;
  submitted_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "questionnaire_response" */
export enum Questionnaire_Response_Constraint {
  /** unique or primary key constraint on columns "id" */
  QuestionnaireResponsePkey = 'questionnaire_response_pkey',
  /** unique or primary key constraint on columns "patient_registration_id" */
  UkResponsePerRegistration = 'uk_response_per_registration'
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
  id?: InputMaybe<Scalars['uuid']['input']>;
  organization?: InputMaybe<Organization_Obj_Rel_Insert_Input>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_consent?: InputMaybe<Patient_Consent_Obj_Rel_Insert_Input>;
  patient_consent_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_registration?: InputMaybe<Patient_Registration_Obj_Rel_Insert_Input>;
  patient_registration_id?: InputMaybe<Scalars['uuid']['input']>;
  submitted_at?: InputMaybe<Scalars['timestamptz']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Questionnaire_Response_Max_Fields = {
  __typename?: 'questionnaire_response_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  patient_consent_id?: Maybe<Scalars['uuid']['output']>;
  patient_registration_id?: Maybe<Scalars['uuid']['output']>;
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
  patient_registration_id?: InputMaybe<Order_By>;
  submitted_at?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Questionnaire_Response_Min_Fields = {
  __typename?: 'questionnaire_response_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  deleted_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  organization_id?: Maybe<Scalars['uuid']['output']>;
  patient_consent_id?: Maybe<Scalars['uuid']['output']>;
  patient_registration_id?: Maybe<Scalars['uuid']['output']>;
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
  patient_registration_id?: InputMaybe<Order_By>;
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

/** input type for inserting object relation for remote table "questionnaire_response" */
export type Questionnaire_Response_Obj_Rel_Insert_Input = {
  data: Questionnaire_Response_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Questionnaire_Response_On_Conflict>;
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
  patient_registration?: InputMaybe<Patient_Registration_Order_By>;
  patient_registration_id?: InputMaybe<Order_By>;
  submitted_at?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: questionnaire_response */
export type Questionnaire_Response_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
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
  PatientRegistrationId = 'patient_registration_id',
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
  id?: InputMaybe<Scalars['uuid']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_consent_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_registration_id?: InputMaybe<Scalars['uuid']['input']>;
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
  id?: InputMaybe<Scalars['uuid']['input']>;
  organization_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_consent_id?: InputMaybe<Scalars['uuid']['input']>;
  patient_registration_id?: InputMaybe<Scalars['uuid']['input']>;
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
  PatientRegistrationId = 'patient_registration_id',
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
  /** fetch data from the table: "patient_registration" */
  patient_registration: Array<Patient_Registration>;
  /** fetch aggregated fields from the table: "patient_registration" */
  patient_registration_aggregate: Patient_Registration_Aggregate;
  /** fetch data from the table: "patient_registration" using primary key columns */
  patient_registration_by_pk?: Maybe<Patient_Registration>;
  /** fetch data from the table in a streaming manner: "patient_registration" */
  patient_registration_stream: Array<Patient_Registration>;
  /** fetch data from the table in a streaming manner: "patient" */
  patient_stream: Array<Patient>;
  /** fetch data from the table: "practitioner" */
  practitioner: Array<Practitioner>;
  /** fetch aggregated fields from the table: "practitioner" */
  practitioner_aggregate: Practitioner_Aggregate;
  /** fetch data from the table: "practitioner" using primary key columns */
  practitioner_by_pk?: Maybe<Practitioner>;
  /** fetch data from the table in a streaming manner: "practitioner" */
  practitioner_stream: Array<Practitioner>;
  /** fetch data from the table: "questionnaire_response" */
  questionnaire_response: Array<Questionnaire_Response>;
  /** fetch aggregated fields from the table: "questionnaire_response" */
  questionnaire_response_aggregate: Questionnaire_Response_Aggregate;
  /** fetch data from the table: "questionnaire_response" using primary key columns */
  questionnaire_response_by_pk?: Maybe<Questionnaire_Response>;
  /** fetch data from the table in a streaming manner: "questionnaire_response" */
  questionnaire_response_stream: Array<Questionnaire_Response>;
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
  id: Scalars['uuid']['input'];
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
  id: Scalars['uuid']['input'];
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
  id: Scalars['uuid']['input'];
};


export type Subscription_RootPatient_Consent_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Patient_Consent_Stream_Cursor_Input>>;
  where?: InputMaybe<Patient_Consent_Bool_Exp>;
};


export type Subscription_RootPatient_RegistrationArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


export type Subscription_RootPatient_Registration_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Patient_Registration_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Patient_Registration_Order_By>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


export type Subscription_RootPatient_Registration_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootPatient_Registration_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Patient_Registration_Stream_Cursor_Input>>;
  where?: InputMaybe<Patient_Registration_Bool_Exp>;
};


export type Subscription_RootPatient_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Patient_Stream_Cursor_Input>>;
  where?: InputMaybe<Patient_Bool_Exp>;
};


export type Subscription_RootPractitionerArgs = {
  distinct_on?: InputMaybe<Array<Practitioner_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Practitioner_Order_By>>;
  where?: InputMaybe<Practitioner_Bool_Exp>;
};


export type Subscription_RootPractitioner_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Practitioner_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Practitioner_Order_By>>;
  where?: InputMaybe<Practitioner_Bool_Exp>;
};


export type Subscription_RootPractitioner_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootPractitioner_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Practitioner_Stream_Cursor_Input>>;
  where?: InputMaybe<Practitioner_Bool_Exp>;
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
  id: Scalars['uuid']['input'];
};


export type Subscription_RootQuestionnaire_Response_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Questionnaire_Response_Stream_Cursor_Input>>;
  where?: InputMaybe<Questionnaire_Response_Bool_Exp>;
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

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};

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
