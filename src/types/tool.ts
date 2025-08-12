export enum ToolCategory {
    OLAH_TANAH = "olah_tanah",
    PANEN = "panen",
    POMPA = "pompa",
    TRANSPORTASI = "transportasi",
    TOOLS_BENGKEL = "tools_bengkel",
    LAINNYA = "lainnya",
}

export enum ToolStatus {
    TERSEDIA = "tersedia",
    DIPINJAM = "dipinjam",
    DALAM_PERAWATAN = "dalam_perawatan",
    RUSAK = "rusak",
}

export interface Tool {
    id: number;
    name: string;
    description: string | null;
    category: ToolCategory;
    status: ToolStatus;
    image_url: string | null;
    price: number | null;
    specifications: Record<string, any> | null;
    created_at: string;
    updated_at: string | null;
}
