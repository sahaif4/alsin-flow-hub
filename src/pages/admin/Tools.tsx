import { useState, useEffect } from "react";
import api from "@/services/api";
import { Tool } from "@/types/tool";
import { columns } from "./tools/columns";
import { DataTable } from "./tools/data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const AdminToolsPage = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/tools");
        setTools(response.data);
      } catch (err) {
        setError("Failed to fetch tools.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTools();
  }, []);

  // We could add logic here for the "Tambah Alat Baru" button to open a form dialog.
  // For now, it's a placeholder.

  if (isLoading) return <div>Loading tools...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Alat</h1>
          <p className="text-muted-foreground">
            Tambah, ubah, dan hapus data alat dan mesin dari sistem.
          </p>
        </header>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Tambah Alat Baru
        </Button>
      </div>
      <DataTable columns={columns} data={tools} />
    </div>
  );
};

export default AdminToolsPage;
