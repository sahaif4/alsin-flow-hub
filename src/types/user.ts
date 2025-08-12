export enum UserRole {
    ADMIN = "admin",
    KEPALA_BENGKEL = "kepala_bengkel",
    TEKNISI_OPERATOR = "teknisi_operator",
    PLP = "plp",
    DOSEN = "dosen",
    MAHASISWA = "mahasiswa",
    PETANI_INSTANSI = "petani_instansi",
}

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: UserRole;
    created_at: string; // Dates will be strings in JSON
    approved_at?: string | null;
}
