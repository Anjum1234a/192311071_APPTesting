export interface Patient {
    id?: number;
    name: string;
    age: number;
    gender: string;
    last_visit: string;
    dental_condition: string;
    allergies?: string | null;
    systemic_conditions?: string | null;
    emergency_contact?: string | null;
    qr_code?: string | null;
    created_at?: string | null;
}

export interface Doctor {
    id?: number;
    name: string;
    email: string;
    specialization: string;
    password?: string;
    token?: string;
}

export interface ClinicalNote {
    id?: number;
    patient_name: string;
    doctor_email: string;
    note_text: string;
    created_at?: string;
}

export interface PrescriptionRecord {
    id?: number;
    patient_name: string;
    doctor_email: string;
    medications: string;
    created_at?: string;
}

export interface PatientReport {
    id?: number;
    patient_name: string;
    file_name: string;
    file_path: string;
    created_at?: string;
}
