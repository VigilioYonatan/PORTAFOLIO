%%{init: {'theme': 'dark', 'themeVariables': { 'fontSize': '12px', 'fontFamily': 'Fira Code', 'primaryColor': '#2b2b2b', 'edgeLabelBackground':'#1f1f1f', 'tertiaryColor': '#333'}}}%%
classDiagram
direction TB

    %% ======================================================================================
    %% 1. SECURITY CORE (Identidad, SaaS, Auditoría y RBAC)
    %% ======================================================================================
    namespace SecurityCore {
        class tenant {
            +id: int [PK]
            +name: text[100]
            +subdomain: text[50](UQ)
            +custom_domain: text[100]?
            +timezone: text[50]?
            +locale: text[10]?
            +country: enum(PE, CL, AR, UY, MX, BR, CO, EC) -- 7 Countries
            +tax_id: text[20]?
            +plan_tier: enum(STARTER, PRO, ENTERPRISE)
            +subscription_status: enum(ACTIVE, INACTIVE, TRIAL)
            +branding_config: jsonb -- Keys: main_color: text[25], accent_color: text[25],  typography: text[50], dark_mode_enabled: boolean, custom_css: text
            +resource_limits: jsonb -- Keys: max_students: int, max_storage_gb: int, max_courses: int, max_users: int, concurrent_sessions: int
            +settings_auth: jsonb -- Keys: mfa_required: boolean, session_timeout_min: int, password_policy: text[50], max_login_attempts: int, lockout_duration_min: int
            +settings_ai: jsonb -- Keys (boolean): is_biometrics, is_ai_grading, is_ai_proctoring, is_ai_tutors, is_ai_summaries, is_ai_moderation, is_learning_paths, is_blockchain
            +currency_config: jsonb -- Keys: local_currency_code: text[3], allow_usd_payment: boolean, exchange_rate_source: text[50], thousand_separator: text[1], decimal_separator: text[1]
            +tax_config: jsonb -- Keys: tax_name: text[10] (IGV, IVA), standard_rate: decimal, show_breakdown: boolean, exempt_products: text[], retention_rate: decimal?
            +created_at: timestamp
            +updated_at: timestamp?
            +city_id: int? [FK] -- Tenant's legal city
            %% Addressable -> Profiles.address_entry
            %% JSONB: [logo, favicon] filesSchema[] 
        }

        class user {
            +id: int [PK]
            +username: text[50]
            +email: text[100](UQ)
            +phone_number: text[50]?
            +password_hash: text[200]
            +google_id: text[100]?
            +qr_code_token: text[100](UQ)? -- For attendance and printable physical ID cards
            +status: enum(ACTIVE, BANNED, PENDING)
            +security_stamp: uuid
            +failed_login_attempts: int
            +is_mfa_enabled: boolean
            +is_superuser: boolean
            +email_verified_at: timestamp?
            +lockout_end_at: timestamp?
            +avatar: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +role_id: int [FK]
            +tenant_id: int [FK]
        }

        class user_session {
            +id: uuid [PK]
            +refresh_token_hash: text[500]
            +ip_address: text[50]
            +device_os: text[50]?
            +browser: text[50]?
            +device_type: enum(DESKTOP, MOBILE)
            +location_data: jsonb? -- Keys: city: text[100], country: text[100], lat: decimal, lng: decimal
            +is_revoked: boolean
            +last_active_at: timestamp
            +expires_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +user_id: int [FK]
        }

        class mfa_device {
            +id: int [PK]
            +name: text[50]
            +secret_key_enc: text
            +type: enum(TOTP_APP, SMS, YUBIKEY)
            +backup_codes_enc: jsonb -- Keys: codes: text[20][]
            +is_verified: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +user_id: int [FK]
        }

        class role {
            +id: int [PK]
            +name: text[100]
            +description: text?
            +landing_page_route: text[200]?
            +is_system_immutable: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }

        class permission {
            +id: int [PK]
            +codename: text[100]
            +human_name: text[100]
            +module_group: text[50]
            +scope: enum(GLOBAL, TENANT, OWN)
            +created_at: timestamp
            +updated_at: timestamp?
        }

        class role_permission {
            +id: int [PK]
            +created_at: timestamp
            +updated_at: timestamp?
            +role_id: int [FK]
            +permission_id: int [FK]
        }

        class user_permission {
            +id: int [PK]
            +is_granted: boolean
            +expires_at: timestamp?
            +created_at: timestamp
            +updated_at: timestamp?
            +user_id: int [FK]
            +permission_id: int [FK]
        }

        class audit_log {
            +id: bigint [PK]
            +action: text[100]
            +entity_type: text[50]
            +entity_id: text[50]
            +ip_address: text[50]
            +old_values: jsonb? -- Snapshot of record before change
            +new_values: jsonb? -- Snapshot of record after change
            +performed_at: timestamp
            +actor_user_id: int [FK]
            +impersonated_by_id: int? [FK]
            +tenant_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 2. PROFILES (Gestión de Personas)
    %% ======================================================================================
    namespace Profiles {
        class person {
            +id: int [PK]
            +first_name: text[100]
            +last_name: text[100]
            +document_type: enum(DNI, PASSPORT, CURP, RUT, CPF, CI, CC, RFC, CUIL, OTHER)
            +document_number: text[50](UQ)
            +birth_date: date?
            +gender: enum(MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY)?
            +blood_type: text[5]?
            +health_info: jsonb? -- Keys: allergies: text[200], conditions: text[200], medications: text[200]
            +nationality: text[50]?
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
            %% Addressable -> Profiles.address_entry
        }
        class student_profile {
            +id: int [PK]
            +student_code: text[50]
            +previous_school: text[100]?
            +current_grade_level: text[50]
            +academic_status: enum(ACTIVE, ALUMNI, WITHDRAWN, EXPELLED, PROBATION, ON_LEAVE)
            +entry_method: enum(EXAM, TRANSFER, SCHOLARSHIP)
            +scholarship_status: boolean
            +needs_special_education: boolean
            +administrative_lock: boolean
            +documents: jsonb[]? -- filesSchema
            +entry_date: date
            +expected_graduation_date: date?
            +created_at: timestamp
            +updated_at: timestamp?
            +curriculum_plan_id: int [FK]
            +tenant_id: int [FK]
            +person_id: int [FK]
            +city_id: int? [FK] -- Student's birth or residence city
        }
        class guardian_profile {
            +id: int [PK]
            +tax_identification: text[50]?
            +digital_signature_hash: text[500]?
            +education_level: enum(PRIMARY, SECONDARY, TECHNICAL, UNIVERSITY, POSTGRADUATE)
            +verification_level: enum(UNVERIFIED, ID_UPLOADED, BIOMETRIC_VERIFIED)
            +payment_behavior_score: int
            +is_alumni: boolean
            +job_details: jsonb? -- Keys: company: text[100], position: text[100], work_phone: text[20]
            +communication_prefs: jsonb? -- Keys: email: boolean, phone: boolean, push: boolean, whatsapp: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
            +person_id: int [FK]
        }
        class staff_profile {
            +id: int [PK]
            +specialty: text[100]
            +biometric_entry_code: text[50]?
            +employment_type: enum(FULL_TIME, PART_TIME, CONTRACTOR)
            +max_weekly_hours: int
            +performance_rating: decimal
            +is_tutor_authorized: boolean
            +salary_config: jsonb? -- Keys: basic_salary: decimal, currency: text[10], payment_method: text[50]
            +education_degrees: jsonb? -- Keys: (degree: text[100], institution: text[100], year: int)[]
            +bank_account_info: jsonb? -- Keys: bank_name: text[100], account_number: text[50], cci: text[50]
            +hiring_date: date
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
            +person_id: int [FK]
        }
        class family_link {
            +id: int [PK]
            +pickup_restrictions: text[500]?
            +relationship: enum(FATHER, MOTHER, STEP_PARENT, GRANDPARENT, UNCLE, AUNT, GUARDIAN)
            +custody_legal_status: enum(FULL, JOINT, NO_CONTACT)
            +billing_percentage: decimal
            +can_pickup: boolean
            +is_emergency_contact: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +guardian_id: int [FK]
        }
        class address_entry {
            +id: int [PK]
            +address_type: enum(HOME, OFFICE, BILLING, OTHER)
            +street_address: text[200]
            +postal_code: text[20]
            +is_default: boolean
            +addressable_type: text[50]
            +addressable_id: text[50]
            +created_at: timestamp
            +updated_at: timestamp?
            +city_id: int [FK]
            +country_iso_cache: text[2]? -- Normalized for faster reporting
            +region_code_cache: text[10]? -- Normalized for faster reporting
        }
        class biometric_record {
            +id: int [PK]
            +biometric_type: enum(FACE_EMBEDDING, FINGERPRINT_HASH, IRIS_SCAN)
            +encryption_version: text[20]
            +biometric_data: vector(128) -- Numerical representation of facial features
            +last_verified_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +person_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 3. FINANCE (Facturación, Cobranza Recurrente y Becas)
    %% ======================================================================================
    namespace Finance {
        class invoice {
            +id: int [PK]
            +series: text[10]
            +number: int
            +document_type: enum(FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO, RECIBO, NOTA_FISCAL, INVOICE)
            +status: enum(PAID, PENDING, CANCELLED, ANNULLED)
            +currency: text[3] -- PEN, USD
            +exchange_rate: decimal? -- If currency != tenant_currency
            +total_amount: decimal
            +tax_amount: decimal
            +balance_due: decimal
            +fiscal_data: jsonb? -- Keys: sunat_response: text, digest_value: text[100], signature_id: text[100]
            +issue_date: date
            +due_date: date
            +pdf: jsonb[] -- filesSchema
            +xml: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +payer_person_id: int [FK]
            +tenant_id: int [FK]
            +city_id: int? [FK] -- Document's issuing/billing city
            +related_invoice_id: int?
        }
        class invoice_line {
            +id: int [PK]
            +description: text[200]
            +product_type: enum(TUITION, SERVICE, GOODS)
            +quantity: decimal
            +unit_price: decimal
            +tax_rate: decimal
            +tax_amount: decimal
            +discount_amount: decimal
            +amount: decimal
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +invoice_id: int [FK]
        }
        class payment {
            +id: int [PK]
            +currency: text[10]
            +external_reference: text[100]?
            +method: enum(CASH, TRANSFER, CREDIT_CARD)
            +amount: decimal
            +is_verified: boolean
            +is_reconciled: boolean
            +gateway_response: jsonb? -- Raw transaction from provider
            +voucher_proof: jsonb[] -- filesSchema
            +transaction_date: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +invoice_id: int [FK]
            +cash_register_id: int? [FK] -- Required if CASH
            +destination_bank_account_id: int? [FK] -- Required if TRANSFER
        }
        class cash_register {
            +id: int [PK]
            +name: text[100]
            +currency: text[10]
            +status: enum(OPEN, CLOSED)
            +opening_balance: decimal
            +closing_balance: decimal
            +real_cash_count: decimal
            +difference_amount: decimal
            +final_balance: decimal
            +opened_at: timestamp
            +closed_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +assigned_user_id: int [FK]
        }
        class payment_plan {
            +id: int [PK]
            +name: text[100]
            +scope: enum(PROGRAM_MONTHLY, INDIVIDUAL_COURSE, BUNDLE)
            +total_annual_amount: decimal
            +down_payment: decimal
            +amount_per_installment: decimal
            +penalty_daily_rate: decimal
            +installments_count: int
            +due_day_of_month: int
            +grace_period_days: int
            +created_at: timestamp
            +updated_at: timestamp?
            +academic_period_id: int [FK]
            +subject_id: int? [FK]
        }
        class student_fee_schedule {
            +id: int [PK]
            +concept_name: text[100]
            +original_amount: decimal
            +penalty_accumulated: decimal
            +discount_applied: decimal
            +manual_adjustment: decimal
            +total_due: decimal
            +balance_remaining: decimal
            +is_prorated: boolean
            +status: enum(PENDING, PARTIAL, OVERDUE, PAID, WAIVED)
            +month_period: date
            +due_date: date
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +payment_plan_id: int [FK]
            +linked_invoice_id: int? [FK]
        }
        class discount_rule {
            +id: int [PK]
            +name: text[100]
            +type: enum(PERCENTAGE, FIXED)
            +value: decimal
            +requires_approval: boolean
            +is_cumulative: boolean
            +priority_order: int
            +applies_to_concepts: jsonb? -- Keys: concept_codes: enum(TUITION, ADMISSION, EXAM, UNIFORM)[]
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class student_benefit {
            +id: int [PK]
            +reason: text[200]
            +renewal_status: enum(ACTIVE, REVOKED, EXPIRED)
            +conditional_min_grade: decimal?
            +is_active: boolean
            +start_date: date
            +end_date: date?
            +created_at: timestamp
            +updated_at: timestamp?
            +approved_by_user_id: int? [FK]
            +student_id: int [FK]
            +discount_rule_id: int [FK]
        }
        class payment_gateway_config {
            +id: int [PK]
            +type: enum(STRIPE, MERCADO_PAGO, NIUBIZ, PAYPAL, BANK_TRANSFER)
            +name: text[100]
            +config_data: jsonb -- Keys: public_key: text[200], secret_key: text[200], webhook_secret: text[200], environment: text[20]
            +is_active: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class student_wallet {
            +id: int [PK]
            +balance: decimal
            +currency: text[10]
            +last_transaction_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +tenant_id: int [FK]
        }
        class bank_account {
            +id: int [PK]
            +bank_name: text[100] -- e.g. BCP, BBVA, Santander
            +account_number: text[50]
            +currency: text[3] -- PEN, USD, COP, MXN, CLP
            +is_active: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
    }


    %% ======================================================================================
    %% 4. ACADEMIC (Malla, Matrícula, Asistencia y Notas)
    %% ======================================================================================
    namespace Academic {
        class academic_program {
            +id: int [PK]
            +name: text[100]
            +code: text[50](UQ)
            +level: enum(PRESCHOOL, K12, BACHELOR, MASTER, DOCTORATE)
            +duration_semesters: int
            +is_accredited: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class academic_department {
            +id: int [PK]
            +name: text[100] -- e.g. Science, Arts, Humanities
            +head_user_id: int? [FK]
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class subject {
            +id: int [PK]
            +name: text[100]
            +code: text[50](UQ)
            +credits: int
            +hours_theory: int
            +hours_practice: int
            +is_elective: boolean
            +passing_score_min: decimal
            +created_at: timestamp
            +updated_at: timestamp?
            +program_id: int [FK]
            +department_id: int? [FK]
        }
        class subject_unit {
            +id: int [PK]
            +title: text[200]
            +description: text?
            +order_index: int
            +created_at: timestamp
            +updated_at: timestamp?
            +subject_id: int [FK]
            +parent_unit_id: int? [FK]
        }
        class subject_prerequisite {
            +id: int [PK]
            +condition_type: enum(PASSED, TAKEN_SIMULTANEOUSLY)
            +created_at: timestamp
            +updated_at: timestamp?
            +subject_id: int [FK]
            +required_subject_id: int [FK]
        }
        class building {
            +id: int [PK]
            +name: text[100]
            +address: text[200]?
            +geo_location: point?
            +is_accessible: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            %% Addressable -> Profiles.address_entry
        }
        class classroom {
            +id: int [PK]
            +name: text[100]
            +code_door: text[50]?
            +room_type: enum(LECTURE, LAB, AUDITORIUM, SPORTS)
            +capacity: int
            +resources_available: jsonb? -- Keys: projector: boolean, ac: boolean, pc_count: int, whiteboard: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +building_id: int [FK]
        }

        class academic_period {
            +id: int [PK]
            +name: text[100]
            +code: text[50](UQ)
            +status: enum(PLANNING, OPEN, CLOSED, ARCHIVED)
            +is_current: boolean
            +start_date: date
            +end_date: date
            +enrollment_start: date
            +enrollment_end: date
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class period_segment {
            +id: int [PK]
            +name: text[100]
            +short_name: text[50]
            +weight_percent: decimal
            +start_date: date
            +end_date: date
            +created_at: timestamp
            +updated_at: timestamp?
            +academic_period_id: int [FK]
        }
        class class_group {
            +id: int [PK]
            +name: text[100]
            +section_code: text[50](UQ)
            +enrollment_key: text[50]?
            +status: enum(OPEN, CLOSED, CANCELLED)
            +modality: enum(ON_SITE, ONLINE, HYBRID)
            +quota_limit: int
            +quota_occupied: int
            +created_at: timestamp
            +updated_at: timestamp?
            +subject_id: int [FK]
            +academic_period_id: int [FK]
        }
        class teacher_assignment {
            +id: int [PK]
            +role: enum(MAIN_TEACHER, ASSISTANT, LAB_INSTRUCTOR)
            +assignment_status: enum(ACTIVE, ON_LEAVE, SUBSTITUTE)
            +workload_percentage: decimal
            +is_primary_grader: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +staff_id: int [FK]
            +class_group_id: int [FK]
        }
        class time_slot {
            +id: int [PK]
            +day_of_week: int
            +is_recurring: boolean
            +start_time: time
            +end_time: time
            +effective_start_date: date
            +created_at: timestamp
            +updated_at: timestamp?
            +class_group_id: int [FK]
            +classroom_id: int [FK]
        }
        class enrollment {
            +id: int [PK]
            +status: enum(ENROLLED, WITHDRAWN, FAILED, PASSED, INCOMPLETE)
            +final_grade_yearly: decimal?
            +final_attendance_percent: decimal?
            +is_repeating: boolean
            +financial_lock: boolean
            +enrollment_date: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +class_group_id: int [FK]
        }
        class gradebook_entry {
            +id: bigint [PK]
            +score_average: decimal
            +letter_grade: text[50]?
            +comments: text?
            +is_locked: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +last_modified_by: int [FK]
            +enrollment_id: int [FK]
            +period_segment_id: int [FK]
        }
        class class_session {
            +id: bigint [PK]
            +title: text[100]
            +type: enum(LECTURE, LAB, WORKSHOP, SEMINAR, MEETING, EXAM)
            +topic_taught: text[500]?
            +ai_abstract: text? -- AI Generated summary of the session
            +meeting_link: text[500]?
            +is_virtual_meeting: boolean
            +resources_used: jsonb? -- Keys: links: text[500][], physical_materials: text[200][]
            +resources: jsonb[] -- filesSchema
            +date: date
            +started_at: timestamp
            +ended_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +teacher_id: int [FK]
            +unit_id: int? [FK]
        }
        class attendance_record {
            +id: bigint [PK]
            +status: enum(PRESENT, ABSENT, LATE, EXCUSED)
            +location_lat: decimal?
            +location_lng: decimal?
            +verification_method: enum(MANUAL_TEACHER, QR_SCAN, BIOMETRIC)
            +arrival_time: time?
            +justification_docs: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +class_session_id: bigint [FK]
            +student_enrollment_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 5. ASSESSMENT (Evaluaciones Completas)
    %% ======================================================================================
    namespace Assessment {
        class question_bank {
            +id: int [PK]
            +title: text[100]
            +description: text?
            +is_shared_with_tenant: boolean
            +is_shared_with_tenant: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class rubric {
            +id: int [PK]
            +title: text[100]
            +description: text?
            +total_points: int
            +is_weighted: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class rubric_criteria {
            +id: int [PK]
            +label: text[100]
            +description: text?
            +position_index: int
            +max_points: int
            +weight_percent: decimal
            +created_at: timestamp
            +updated_at: timestamp?
            +rubric_id: int [FK]
        }
        class rubric_level {
            +id: int [PK]
            +label: text[100]
            +points: int
            +description: text?
            +created_at: timestamp
            +updated_at: timestamp?
            +criteria_id: int [FK]
        }
        class question {
            +id: int [PK]
            +type: enum(MULTIPLE_CHOICE, OPEN_TEXT, CODING, FILE_UPLOAD, MATCHING)
            +difficulty_level: enum(EASY, MEDIUM, HARD)
            +content_html: text
            +solution_explanation: text?
            +metadata: jsonb? -- Keys: options: text[200][], correct_answer_index: int, code_language: text[50]
            +created_at: timestamp
            +updated_at: timestamp?
            +bank_id: int [FK]
            +rubric_id: int? [FK]
        }
        class exam_definition {
            +id: int [PK]
            +title: text[100]
            +instructions: text?
            +grading_strategy: enum(HIGHEST, AVERAGE, LAST)
            +review_policy: enum(IMMEDIATE, AFTER_CLOSE, MANUAL_RELEASE)
            +total_score: int
            +passing_score: int
            +duration_minutes: int
            +allowed_attempts: int
            +is_published: boolean
            +security_config: jsonb? -- Keys: browser_lock: boolean, camera_required: boolean, ip_whitelist: text[50][]
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class exam_section {
            +id: int [PK]
            +title: text[100]
            +description: text?
            +order_index: int
            +question_count_to_pick: int
            +is_randomized: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +linked_bank_id: int? [FK]
            +exam_definition_id: int [FK]
        }
        class exam_question_link {
            +id: int [PK]
            +points_weight: decimal
            +position_index: int
            +is_mandatory: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +exam_section_id: int [FK]
            +question_id: int [FK]
        }
        class exam_assignment {
            +id: int [PK]
            +title_override: text[100]?
            +instructions_override: text?
            +access_password: text[50]?
            +status: enum(SCHEDULED, ACTIVE, CLOSED, ARCHIVED)
            +extended_time_minutes: int
            +shuffle_questions: boolean
            +allowed_ip_ranges: jsonb? -- Keys: text[50][] (CIDR ranges)
            +start_time: timestamp
            +end_time: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +exam_definition_id: int [FK]
            +class_group_id: int [FK]
            +proctor_user_id: int? [FK]
        }
        class exam_attempt {
            +id: int [PK]
            +attempt_number: int
            +status: enum(IN_PROGRESS, SUBMITTED, TIMED_OUT, VOIDED)
            +score_total: decimal
            +score_percentage: decimal
            +ip_address: text[50]
            +user_agent: text[200]
            +device_fingerprint: text[100]
            +proctoring_events: jsonb? -- Summary of supervision events (Object)
            +started_at: timestamp
            +submitted_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +enrollment_id: int [FK]
            +exam_assignment_id: int [FK]
        }
        class student_answer {
            +id: int [PK]
            +answer_text: text?
            +time_spent_seconds: int
            +is_marked_for_review: boolean
            +is_correct: boolean
            +score_manual: decimal?
            +auto_score: decimal?
            +ai_grading_result: jsonb? -- Keys: ai_score: decimal, feedback: text[500], confidence_score: decimal
            +feedback_comment: text?
            +answer_selected_options: jsonb? -- Keys: int[] (index of selected options)
            +rubric_results: jsonb? -- Keys: (criteria_id: decimal)
            +answer_files: jsonb[] -- filesSchema
            +answered_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +exam_attempt_id: int [FK]
            +question_id: int [FK]
        }
        class exam_proctoring_event {
            +id: bigint [PK]
            +event_type: enum(TAB_SWITCH, VOICE_DETECTED, MULTIPLE_FACES, FACE_NOT_DETECTED, UNAUTHORIZED_DEVICE)
            +severity: enum(LOW, MEDIUM, HIGH)
            +evidence_snapshot_id: uuid?
            +metadata: jsonb? -- Keys: snapshot_url: text[500], browser_info: text[200]
            +occurred_at: timestamp
            +attempt_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 6. COMMUNITY (Red Social)
    %% ======================================================================================
    namespace Community {
        class social_profile {
            +id: int [PK]
            +alias: text[50](UQ)
            +bio: text?
            +website_url: text[500]?
            +followers_count: int
            +following_count: int
            +reputation_score: int
            +is_verified: boolean
            +privacy_settings: jsonb? -- Keys: show_email: boolean, show_phone: boolean, private_profile: boolean
            +last_seen_at: timestamp
            +created_at: timestamp
            +user_id: int [FK]
            +tenant_id: int [FK]
            +avatar: filesSchema[]
            +cover: filesSchema[]
        }
        class friendship {
            +id: int [PK]
            +status: enum(PENDING, ACCEPTED, BLOCKED, RESTRICTED)
            +created_at: timestamp
            +updated_at: timestamp?
            +requester_id: int [FK]
            +addressee_id: int [FK]
        }
        class social_group {
            +id: int [PK]
            +name: text[100]
            +slug: text[100](UQ)
            +description: text?
            +rules_text: text?
            +privacy: enum(PUBLIC, PRIVATE, SECRET)
            +allow_posting: enum(MEMBERS, ADMINS_ONLY)
            +member_count: int
            +is_official_class: boolean
            +created_at: timestamp
            +tenant_id: int [FK]
            %% JSONB: [avatar, cover] filesSchema[]
        }
        class group_member {
            +id: int [PK]
            +role: enum(ADMIN, MODERATOR, MEMBER)
            +is_muted: boolean
            +joined_at: timestamp
            +banned_until: timestamp?
            +created_at: timestamp
            +group_id: int [FK]
            +user_id: int [FK]
        }
        class social_post {
            +id: int [PK]
            +title: text[200]?
            +target_type: enum(GLOBAL, GROUP, COURSE, USER_WALL)
            +content_text: text
            +target_id: int
            +view_count: int
            +share_count: int
            +comment_count: int
            +is_pinned: boolean
            +allow_comments: boolean
            +ai_moderation_score: decimal? -- Proactive filtering
            +ai_summary_payload: text? -- For long threads
            +rich_text_payload: jsonb? -- Keys: content: text
            +published_at: timestamp
            +edited_at: timestamp?
            +created_at: timestamp
            +author_user_id: int [FK]
            %% JSONB: [attachments] filesSchema[]
            %% Reactable -> Community.social_reaction
            %% Commentable -> Community.social_comment
            %% Reportable -> Community.content_report
        }
        class social_reaction {
            +id: int [PK]
            +type: enum(LIKE, LOVE, HAHA, WOW, SAD, ANGRY)
            +reactable_type: text[50]
            +reactable_id: text[50]
            +created_at: timestamp
            +user_id: int [FK]
        }
        class social_comment {
            +id: int [PK]
            +content_text: text
            +likes_count: int
            +is_pinned: boolean
            +has_replies: boolean
            +rich_text_payload: jsonb? -- Keys: content: text
            +commentable_type: text[50]
            +commentable_id: text[50]
            +created_at: timestamp
            +updated_at: timestamp?
            +parent_comment_id: int? [FK]
            +author_user_id: int [FK]
            %% JSONB: [attachment] filesSchema[]
            %% Reactable -> Community.social_reaction
            %% Reportable -> Community.content_report
        }
        class content_report {
            +id: int [PK]
            +reason: enum(SPAM, HARASSMENT, HATE_SPEECH, VIOLENCE, NUDITY)
            +status: enum(PENDING, REVIEWING, RESOLVED, DISMISSED)
            +reportable_type: text[50]
            +reportable_id: text[50]
            +description: text?
            +resolution_notes: text?
            +evidence_data: jsonb? -- Keys: screenshot_url: text[500], related_context: text[2000]
            +resolved_at: timestamp?
            +created_at: timestamp
            +reporter_user_id: int [FK]
            +resolver_user_id: int? [FK]
        }
    }

    %% ======================================================================================
    %% 7. INTELLIGENCE (IA, Chat, RAG y Analítica)
    %% ======================================================================================
    namespace Intelligence {
        class ai_provider_config {
            +id: int [PK]
            +provider: enum(OPENAI, ANTHROPIC, GEMINI, AZURE_OPENAI, LOCAL_LLAMA)
            +api_key_enc: text
            +base_url: text[500]?
            +priority_order: int
            +rate_limit_rpm: int
            +is_active: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class ai_usage_log {
            +id: bigint [PK]
            +model_used: text[50]
            +finish_reason: text[50]?
            +prompt_tokens: int
            +completion_tokens: int
            +total_tokens: int
            +cost_usd: decimal
            +latency_ms: int
            +trace_id: uuid
            +performed_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +user_id: int [FK]
            +tenant_id: int [FK]
        }
        class langchain_agent {
            +id: int [PK]
            +name: text[100]
            +role: enum(TUTOR, COUNSELOR, ADMIN_ASSISTANT)
            +system_prompt_template: text
            +model_override: text[50]?
            +temperature: decimal
            +memory_window_size: int
            +is_active: boolean
            +tools_enabled: jsonb? -- Keys: web_search: boolean, math_solver: boolean, code_interpreter: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +provider_id: int [FK]
            +subject_id: int? [FK] -- Specialized Tutor per Subject
            +tenant_id: int [FK]
        }
        class knowledge_base {
            +id: int [PK]
            +name: text[100]
            +description: text?
            +embedding_model: text[50]
            +vector_db_collection: text[100]
            +is_shared: boolean
            +last_indexed_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class rag_document {
            +id: int [PK]
            +filename: text[200]
            +file_type: enum(PDF, TXT, MD, DOCX, WEBPAGE)
            +processing_status: enum(PENDING, PROCESSING, COMPLETED, FAILED)
            +token_count_total: int
            +file_size_bytes: bigint
            +checksum_sha256: text[100]?
            +error_log: text?
            +uploaded_at: timestamp
            +source_file: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +knowledge_base_id: int [FK]
        }
        class vector_chunk {
            +id: bigint [PK]
            +content: text
            +sequence_index: int
            +page_number: int?
            +token_count: int
            +embedding: vector(1536)
            +metadata: jsonb? -- Keys: model_version: text[50], inference_time_ms: int
            +created_at: timestamp
            +updated_at: timestamp?
            +document_id: int [FK]
        }
        class chat_channel {
            +id: uuid [PK]
            +type: enum(DM, GROUP_HUMAN, AI_SESSION)
            +name: text[100]?
            +description: text?
            +message_count: int
            +is_archived: boolean
            +context_data: jsonb? -- Keys: initial_prompt: text[5000], agent_role: text[100], temperature: decimal, max_tokens: int
            +last_message_at: timestamp
            +avatar: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class channel_participant {
            +id: int [PK]
            +is_admin: boolean
            +notifications_muted: boolean
            +joined_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +last_read_message_id: bigint [FK]
            +channel_id: uuid [FK]
            +user_id: int [FK]
        }
        class chat_message {
            +id: bigint [PK]
            +role: enum(USER, SYSTEM, ASSISTANT)
            +content: text
            +token_usage: int
            +is_edited: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +attachments: jsonb[] -- filesSchema
            +reply_to_message_id: bigint? [FK]
            +channel_id: uuid [FK]
            +sender_id: int [FK]
            %% Reactable -> Community.social_reaction
        }
        class notification {
            +id: bigint [PK]
            +title: text[200]
            +body: text
            +category: enum(ACADEMIC, BILLING, SECURITY, SOCIAL, SYSTEM)
            +channel: enum(IN_APP, EMAIL, PUSH, SMS, WHATSAPP)
            +priority: enum(LOW, NORMAL, HIGH, URGENT)
            +status: enum(QUEUED, SENT, DELIVERED, FAILED, READ)
            +action_url: text[500]?
            +data_payload: jsonb? -- Keys: module: text[50], entity_id: text[50], action_url: text[500]
            +read_at: timestamp?
            +created_at: timestamp
            +updated_at: timestamp?
            +user_id: int [FK]
        }
        class system_notification_template {
            +id: int [PK]
            +code: text[50](UQ) -- e.g. 'WELCOME_EMAIL', 'INVOICE_GENERATED'
            +subject_template: text[200]
            +body_html_template: text
            +variables_available: jsonb? -- Keys: (variables: text[])
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class user_device {
            +id: int [PK]
            +device_name: text[100]
            +platform: enum(IOS, ANDROID, WEB)
            +os_version: text[50]?
            +app_version: text[50]?
            +fcm_token: text[500]?
            +is_active: boolean
            +last_active_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +user_id: int [FK]
        }
        class notification_setting {
            +id: int [PK]
            +email_notifications: boolean
            +push_notifications: boolean
            +do_not_disturb_start: time?
            +do_not_disturb_end: time?
            +categories_muted: jsonb? -- Keys: text[50][]
            +created_at: timestamp
            +updated_at: timestamp?
            +user_id: int [FK]
        }
        class student_risk_profile {
            +id: int [PK]
            +risk_level: enum(LOW, MEDIUM, HIGH, CRITICAL)
            +trend: enum(IMPROVING, STABLE, WORSENING)
            +intervention_status: enum(NONE, PLANNED, IN_PROGRESS, RESOLVED)
            +risk_score: decimal
            +dropout_probability: decimal -- (0 to 1) AI Predicted
            +sentiment_average: decimal -- Calculated from logs
            +factors_detected: jsonb? -- Keys: poor_attendance: boolean, low_grades: boolean, negative_sentiment: boolean
            +last_updated_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
        }
        class sentiment_log {
            +id: bigint [PK]
            +analyzable_type: text[50] -- e.g., 'chat_message', 'social_post', 'student_assignment'
            +analyzable_id: text[50]
            %% Polymorphic: Replaces source_type enum
            +sentiment_score: decimal
            +magnitude: decimal
            +confidence_score: decimal
            +emotions_detected: jsonb? -- Keys: joy: decimal, anger: decimal, sadness: decimal, fear: decimal, surprise: decimal
            +analyzed_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
        }
        class adaptive_recommendation {
            +id: int [PK]
            +reason: text
            +type: enum(REMEDIAL, CHALLENGE, WELLNESS)
            +status: enum(PENDING, ACCEPTED, REJECTED, COMPLETED)
            +priority_score: decimal
            +valid_until: timestamp?
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +suggested_resource_id: int [FK]
        }
        class ai_learning_path {
            +id: uuid [PK]
            +goal_title: text[200]
            +reasoning: text
            +curriculum_steps: jsonb -- Keys: (step_order: int, unit_id: int)[]
            +progress_percentage: decimal
            +is_active: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +tenant_id: int [FK]
        }
        class notification_log {
            +id: bigint [PK]
            +subject: text[200]
            +body_preview: text[500]
            +recipient_address: text[200]
            +channel: enum(EMAIL, SMS, PUSH, WHATSAPP, IN_APP)
            +status: enum(QUEUED, SENT, DELIVERED, FAILED, BOUNCED, READ)
            +external_id: text[100]? -- Provider message ID
            +error_message: text?
            +metadata: jsonb? -- Keys: provider: text[50], open_count: int, click_count: int, template_code: text[50], provider_response: jsonb
            +sent_at: timestamp?
            +delivered_at: timestamp?
            +read_at: timestamp?
            +created_at: timestamp
            +updated_at: timestamp?
            +template_id: int? [FK]
            +user_id: int [FK]
            +tenant_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 8. CERTIFICATION (Diplomas y Certificados)
    %% ======================================================================================
    namespace Certification {
        class certificate_template {
            +id: int [PK]
            +name: text[100]
            +content_html: text
            +styles_css: text?
            +paper_size: enum(A4, LETTER, A3)
            +orientation: enum(LANDSCAPE, PORTRAIT)
            +is_global: boolean
            +signatures_config: jsonb? -- Keys: (signer_name: text[100], signer_role: text[100], signature_img: filesSchema[])[]
            +preview: jsonb[] -- filesSchema
            +background: jsonb[] -- filesSchema
            +signatures: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int? [FK]
        }
        class certificate_definition {
            +id: int [PK]
            +title: text[200]
            +description: text?
            +type: enum(COURSE_CERTIFICATE, PROGRAM_DIPLOMA, SPECIALIZATION)
            +validity_months: int?
            +auto_issue_on_completion: boolean
            +requires_teacher_approval: boolean
            +custom_variables: jsonb? -- Keys: (key: text[50], default_value: text[100])
            +created_at: timestamp
            +updated_at: timestamp?
            +certificate_template_id: int [FK]
            +program_id: int? [FK]
            +subject_id: int? [FK]
            +tenant_id: int [FK]
        }
        class student_certificate {
            +id: uuid [PK]
            +code: text[50](UQ)
            +revocation_reason: text?
            +verification_url: text[500]
            +blockchain_network: enum(POLYGON, ETHEREUM, BASE, SOLANA)?
            +blockchain_tx_hash: text[100]?
            +blockchain_credential_id: text[200]? -- For Verifiable Credentials (W3C)
            +linkedin_add_url: text[500]?
            +status: enum(ISSUED, REVOKED, EXPIRED)
            +metadata_snapshot: jsonb? -- Snapshot of student data at issuance (Object)
            +issued_at: timestamp
            +expires_at: timestamp?
            +revoked_at: timestamp?
            +certificate_pdf: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +definition_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 9. ENGAGEMENT (Gamificación y Motivación)
    %% ======================================================================================
    namespace Engagement {
        class achievement_definition {
            +id: int [PK]
            +name: text[100]
            +description: text[500]
            +point_value: int
            +criteria_config: jsonb -- Keys: type: text[50], threshold: decimal, context_id: text[50]
            +icon: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class student_badge {
            +id: int [PK]
            +earned_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +achievement_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 10. WELLNESS (Salud y Bienestar)
    %% ======================================================================================
    namespace Wellness {
        class health_incident {
            +id: bigint [PK]
            +type: enum(ALLERGY_REACTION, INJURY, ILLNESS, EMOTIONAL_DISTRESS)
            +severity: enum(LOW, MEDIUM, HIGH, EMERGENCY)
            +description: text
            +action_taken: text
            +occurred_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +reported_by_user_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 11. RESOURCES (Inventario y Recursos)
    %% ======================================================================================
    namespace Resources {
        class asset_item {
            +id: int [PK]
            +name: text[100]
            +serial_number: text[50](UQ)
            +status: enum(AVAILABLE, LOANED, DAMAGED, LOST)
            +specs: jsonb? -- Keys: brand: text[50], model: text[50], cpu: text[50], ram: text[20], storage: text[20]
            +created_at: timestamp
            +updated_at: timestamp?
            +classroom_id: int? [FK]
        }
        class asset_loan {
            +id: bigint [PK]
            +loaned_at: timestamp
            +due_at: timestamp
            +returned_at: timestamp?
            +condition_on_return: text?
            +created_at: timestamp
            +updated_at: timestamp?
            +asset_id: int [FK]
            +user_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 12. PORTFOLIO (Proyectos y Competencias)
    %% ======================================================================================
    namespace Portfolio {
        class portfolio_project {
            +id: int [PK]
            +title: text[200]
            +description: text
            +project_url: text[500]?
            +skills_demonstrated: jsonb? -- Keys: text[50][]
            +is_public: boolean
            +gallery_items: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int [FK]
            +subject_id: int? [FK]
        }
    }

    %% ======================================================================================
    %% 13. LOCALIZATION (Ubigeo y Geografía)
    %% ======================================================================================
    namespace Localization {
        class country {
            +id: int [PK]
            +code: text[10](UQ) -- Dial code or ISO
            +dial_code: text[10]
            +name: text[100]
            +created_at: timestamp
            +updated_at: timestamp?
        }
        class region {
            +id: int [PK]
            +code: text[10] -- Departamento Ubigeo
            +name: text[100]
            +created_at: timestamp
            +updated_at: timestamp?
            +country_id: int [FK]
        }
        class city {
            +id: int [PK]
            +code: text[10] -- Distrito/Provincia Ubigeo
            +name: text[100]
            +created_at: timestamp
            +updated_at: timestamp?
            +region_id: int [FK]
        }
    }

    %% ======================================================================================
    %% NOTA: NAMESPACE SHARED ELIMINADO
    %% Los archivos ahora se manejan directamente en las entidades usando JSONB array.
    %% Schema: filesSchema = { provider: enum, dimension?: int, key: string, name: string,
    %%                         size: number, mimetype: string, created_at: timestamp }
    %% Ejemplo: user.photo: jsonb[] (array de filesSchema)
    %% Módulo: src/modules/uploads - Maneja subida, procesamiento y limpieza automática
    %% ======================================================================================


    %% ======================================================================================
    %% 14. REPORTS (Reportes y Programación)
    %% ======================================================================================
    namespace Reports {
        class report_definition {
            +id: int [PK]
            +name: text[100]
            +description: text?
            +type: enum(FINANCIAL, ACADEMIC, ENROLLMENT, OPERATIONAL, COMPLIANCE, EXECUTIVE)
            +output_format: enum(PDF, EXCEL, CSV, HTML, JSON)
            +query_config: jsonb -- Keys: base_entity: text, columns: Object[], filters: Object[], aggregations: Object[]
            +permissions_required: jsonb -- Keys: text[50][]
            +is_system: boolean
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int? [FK]
            +created_by_id: int? [FK]
        }
        class report_schedule {
            +id: int [PK]
            +name: text[100]
            +cron_expression: text[50]
            +timezone: text[50]
            +delivery_config: jsonb -- Keys: method: text, recipients: Object[], subject: text, attach_report: boolean
            +is_active: boolean
            +last_run_at: timestamp?
            +next_run_at: timestamp?
            +failure_count: int
            +created_at: timestamp
            +updated_at: timestamp?
            +report_definition_id: int [FK]
            +created_by_id: int [FK]
            +tenant_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 15. CALENDAR (Eventos y Calendario)
    %% ======================================================================================
    namespace Calendar {
        class calendar_event {
            +id: int [PK]
            +title: text[200]
            +description: text?
            +event_type: enum(CLASS_SESSION, EXAM, MEETING, DEADLINE, HOLIDAY, PERSONAL, MAINTENANCE)
            +location: text[200]?
            +color: text[25]?
            +visibility: enum(PUBLIC, PRIVATE, HIDDEN)
            +recurrence_rule: text[200]? -- RRULE RFC 5545
            +recurrence_exceptions: jsonb? -- Keys: deleted: date[], modified: Object[]
            +reminders: jsonb? -- Keys: (method: text, minutes_before: int)[]
            +attendees_config: jsonb? -- Keys: require_rsvp: boolean, max_attendees: int
            +is_all_day: boolean
            +start_datetime: timestamp
            +end_datetime: timestamp
            +timezone: text[50]
            +created_at: timestamp
            +updated_at: timestamp?
            +organizer_user_id: int [FK]
            +class_group_id: int? [FK]
            +tenant_id: int [FK]
        }
        class event_attendee {
            +id: int [PK]
            +status: enum(PENDING, ACCEPTED, DECLINED, TENTATIVE)
            +responded_at: timestamp?
            +created_at: timestamp
            +updated_at: timestamp?
            +event_id: int [FK]
            +user_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 16. WEBHOOKS (Integraciones Salientes)
    %% ======================================================================================
    namespace Webhooks {
        class webhook_config {
            +id: int [PK]
            +name: text[100]
            +url: text[500]
            +secret: text[200]
            +events: jsonb -- Keys: text[50][] (e.g., 'student.created', 'payment.received')
            +headers: jsonb? -- Keys: (header_name: text[100], header_value: text[500])
            +retry_config: jsonb -- Keys: max_attempts: int, initial_delay_seconds: int, backoff_multiplier: decimal
            +is_active: boolean
            +failure_count: int
            +last_triggered_at: timestamp?
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
            +created_by_id: int [FK]
        }
        class webhook_log {
            +id: bigint [PK]
            +event_type: text[50]
            +request_payload: jsonb
            +response_status: int?
            +response_body: text?
            +response_time_ms: int?
            +attempt_number: int
            +error_message: text?
            +delivered_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +webhook_config_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 17. INTEGRATION (LMS y Sistemas Externos)
    %% ======================================================================================
    namespace Integration {
        class lms_integration {
            +id: int [PK]
            +name: text[100]
            +type: enum(LTI_1_1, LTI_1_3, SCORM_1_2, SCORM_2004, XAPI, GOOGLE_CLASSROOM, MICROSOFT_TEAMS, CANVAS, MOODLE)
            +status: enum(PENDING, ACTIVE, ERROR, DISABLED)
            +config: jsonb -- Keys: varies by type (issuer, client_id, endpoint, etc.)
            +credentials_enc: text? -- AES-256 encrypted credentials
            +sync_errors: jsonb? -- Keys: (error: text, occurred_at: timestamp)[]
            +last_sync_at: timestamp?
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int [FK]
        }
        class scorm_package {
            +id: int [PK]
            +title: text[200]
            +version: enum(SCORM_1_2, SCORM_2004)
            +manifest_data: jsonb -- Keys: parsed imsmanifest.xml
            +entry_point: text[500]
            +storage_path: text[500]
            +is_published: boolean
            +package_zip: jsonb[] -- filesSchema
            +created_at: timestamp
            +updated_at: timestamp?
            +lms_integration_id: int? [FK]
            +subject_id: int? [FK]
            +tenant_id: int [FK]
        }
        class xapi_statement {
            +id: bigint [PK]
            +statement_id: uuid(UQ)
            +actor_mbox: text[200]
            +verb_id: text[200]
            +object_id: text[500]
            +result_score: decimal?
            +result_success: boolean?
            +result_completion: boolean?
            +context_data: jsonb? -- Keys: instructor, team, revision
            +timestamp: timestamp
            +stored_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +student_id: int? [FK]
            +lms_integration_id: int [FK]
        }
    }

    %% ======================================================================================
    %% 18. BACKGROUND (Trabajos en Segundo Plano - BullMQ)
    %% ======================================================================================
    namespace Background {
        class queue_job {
            +id: uuid [PK]
            +name: text[100] -- Human readable job name
            +queue_name: enum(default, notifications, reports, ai, sync, billing, cleanup)
            +job_type: text[50] -- SEND_EMAIL, GENERATE_REPORT, AI_GRADE, etc.
            +priority: int -- 1 (highest) to 10 (lowest)
            +status: enum(PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED, RETRYING)
            +payload: jsonb -- Keys: varies by job_type (template_id: int, user_id: int, variables: Object)
            +result: jsonb? -- Keys: success: boolean, output: Object, error: text[2000]
            +progress: int? -- 0-100 percentage for long-running jobs
            +attempts: int
            +max_attempts: int
            +error_message: text?
            +error_stack_trace: text?
            +bullmq_job_id: text[100]? -- BullMQ internal job ID
            +bullmq_opts: jsonb? -- Keys: delay: int, repeat: Object, backoff: Object, removeOnComplete: boolean
            +job_target_type: text[50]? -- Polymorphic: 'user', 'invoice', 'student_profile', etc.
            +job_target_id: text[50]? -- Polymorphic: ID of the target entity
            +scheduled_at: timestamp
            +started_at: timestamp?
            +completed_at: timestamp?
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int? [FK] -- NULL for system-wide jobs
            +created_by_user_id: int? [FK]
            %% Polymorphic: job_target_type + job_target_id -> Any entity
        }
        class queue_job_log {
            +id: bigint [PK]
            +level: enum(DEBUG, INFO, WARN, ERROR)
            +message: text
            +metadata: jsonb? -- Keys: duration_ms: int, memory_mb: decimal, progress: int
            +logged_at: timestamp
            +created_at: timestamp
            +updated_at: timestamp?
            +queue_job_id: uuid [FK]
        }
        class scheduled_task {
            +id: int [PK]
            +name: text[100](UQ)
            +description: text?
            +cron_expression: text[50] -- e.g., '0 6 * * *'
            +timezone: text[50]
            +job_type: text[50]
            +job_payload: jsonb -- Keys: varies by job_type
            +is_active: boolean
            +last_run_at: timestamp?
            +next_run_at: timestamp?
            +last_run_status: enum(SUCCESS, FAILED, SKIPPED)?
            +failure_count: int
            +created_at: timestamp
            +updated_at: timestamp?
            +tenant_id: int? [FK]
        }
    }


    %% ======================================================================================
    %% RELACIONES ESTRATÉGICAS
    %% ======================================================================================

    SecurityCore.tenant "1" *-- "*" SecurityCore.user : contains
    SecurityCore.user "1" *-- "*" SecurityCore.user_session : logins
    SecurityCore.user "1" *-- "*" SecurityCore.mfa_device : secures
    SecurityCore.role "1" -- "*" SecurityCore.permission : has_via_pivot

    SecurityCore.user "1" -- "0..1" Profiles.staff_profile : is_profile
    SecurityCore.user "1" -- "0..1" Profiles.student_profile : is_profile

    Profiles.person "1" -- "0..1" Profiles.staff_profile : identity
    Profiles.person "1" -- "0..1" Profiles.student_profile : identity
    Profiles.person "1" -- "0..1" Profiles.guardian_profile : identity
    Profiles.address_entry "*" -- "1" Profiles.person : lives_at hiding_billing_address_relation
    %% Addressable used for billing/shipping in profiles and invoices
    Profiles.biometric_record "*" -- "1" Profiles.person : biometric_identity

    Finance.student_fee_schedule "1" -- "1" Profiles.student_profile : tracks_debt
    Finance.student_benefit "1" -- "1" Profiles.student_profile : assigned_to
    Finance.cash_register "*" -- "1" SecurityCore.user : managed_by

    Academic.academic_program "1" *-- "*" Academic.subject : contains
    Academic.subject "1" *-- "*" Academic.subject_unit : syllabus
    Academic.class_group "1" *-- "*" Academic.enrollment : students
    Academic.class_group "1" *-- "*" Academic.class_session : sessions
    Academic.class_session "1" *-- "*" Academic.attendance_record : roll_call
    Academic.period_segment "1" -- "*" Academic.gradebook_entry : term_grades

    Academic.class_group "1" -- "*" Assessment.exam_assignment : assigns
    Assessment.exam_assignment "1" -- "*" Assessment.exam_attempt : attempts
    Assessment.exam_attempt "1" *-- "*" Assessment.exam_proctoring_event : proctoring_logs

    SecurityCore.user "1" -- "1" Community.social_profile : social_identity
    Community.social_group "1" -- "*" Community.social_post : feed
    Community.social_post "*" -- "*" .attachments : jsonb[] (filesSchema)
    Community.social_post "*" -- "1" Community.social_comment : polymorphic_comments
    Community.social_reaction "*" -- "1" Community.social_post : polymorphic_reacts
    Community.content_report "*" -- "1" Community.social_post : polymorphic_reports

    Intelligence.chat_channel "1" *-- "*" Intelligence.channel_participant : members
    Intelligence.chat_channel "1" *-- "*" Intelligence.chat_message : history
    Intelligence.student_risk_profile "1" -- "1" Profiles.student_profile : monitors
    Intelligence.ai_learning_path "*" -- "1" Profiles.student_profile : personalized_for
    Intelligence.langchain_agent "*" -- "0..1" Academic.subject : tutor_of

    %% Shared.media_resource - ELIMINADO (ahora se usa JSONB filesSchema en cada entidad)

    Certification.certificate_definition "*" -- "0..1" Academic.academic_program : certifies_program
    Certification.certificate_definition "*" -- "0..1" Academic.subject : certifies_subject
    Certification.student_certificate "*" -- "1" Profiles.student_profile : awarded_to
    Certification.student_certificate "*" -- "1" Certification.certificate_definition : instance_of
    Certification.certificate_definition "*" -- "1" Certification.certificate_template : uses_design

    %% Shared.tag y Shared.taggable - ELIMINADOS (ver nota NAMESPACE SHARED)

    Engagement.achievement_definition "*" -- "1" SecurityCore.tenant : defined_by
    Engagement.student_badge "*" -- "1" Profiles.student_profile : earned_by
    Engagement.student_badge "*" -- "1" Engagement.achievement_definition : type_of

    Wellness.health_incident "*" -- "1" Profiles.student_profile : affects
    Wellness.health_incident "*" -- "1" SecurityCore.user : reported_by

    Resources.asset_item "*" -- "0..1" Academic.classroom : located_in
    Resources.asset_loan "*" -- "1" Resources.asset_item : item
    Resources.asset_loan "*" -- "1" SecurityCore.user : loaned_to

    Portfolio.portfolio_project "*" -- "1" Profiles.student_profile : author
    Portfolio.portfolio_project "*" -- "0..1" Academic.subject : related_to

    Localization.country "1" *-- "*" Localization.region : contains
    Localization.region "1" *-- "*" Localization.city : contains
    Profiles.address_entry "*" -- "1" Localization.city : located_in
    SecurityCore.tenant "*" -- "0..1" Localization.city : located_in
    Profiles.student_profile "*" -- "0..1" Localization.city : born_in

    Finance.fiscal_note "*" -- "1" Finance.invoice : corrects
    Finance.payment_gateway_config "*" -- "1" SecurityCore.tenant : configured_by

    Background.queue_job "*" -- "0..1" SecurityCore.tenant : scoped_to
    Background.queue_job "*" -- "0..1" SecurityCore.user : created_by
    Background.queue_job "1" *-- "*" Background.queue_job_log : logs
    Background.scheduled_task "*" -- "0..1" SecurityCore.tenant : scoped_to
    %% Polymorphic: queue_job.job_target_type + job_target_id -> Any entity (user, invoice, student_profile, etc.)

    Reports.report_definition "*" -- "0..1" SecurityCore.tenant : scoped_to
    Reports.report_definition "*" -- "0..1" SecurityCore.user : created_by
    Reports.report_schedule "*" -- "1" Reports.report_definition : schedules
    Reports.report_schedule "*" -- "1" SecurityCore.user : created_by
    Reports.report_schedule "*" -- "1" SecurityCore.tenant : scoped_to

    Calendar.calendar_event "*" -- "1" SecurityCore.user : organized_by
    Calendar.calendar_event "*" -- "0..1" Academic.class_group : linked_to
    Calendar.calendar_event "*" -- "1" SecurityCore.tenant : scoped_to
    Calendar.event_attendee "*" -- "1" Calendar.calendar_event : attends
    Calendar.event_attendee "*" -- "1" SecurityCore.user : is_user

    Webhooks.webhook_config "*" -- "1" SecurityCore.tenant : scoped_to
    Webhooks.webhook_config "*" -- "1" SecurityCore.user : created_by
    Webhooks.webhook_log "*" -- "1" Webhooks.webhook_config : logs

    Integration.lms_integration "*" -- "1" SecurityCore.tenant : scoped_to
    Integration.scorm_package "*" -- "0..1" Integration.lms_integration : belongs_to
    Integration.scorm_package "*" -- "0..1" Academic.subject : linked_to
    Integration.scorm_package "*" -- "1" SecurityCore.tenant : scoped_to
    Integration.xapi_statement "*" -- "1" Integration.lms_integration : tracked_by
    Integration.xapi_statement "*" -- "0..1" Profiles.student_profile : performed_by

    Intelligence.notification_log "*" -- "0..1" Intelligence.system_notification_template : uses_template
    Intelligence.notification_log "*" -- "1" SecurityCore.user : sent_to
    Intelligence.notification_log "*" -- "1" SecurityCore.tenant : scoped_to
