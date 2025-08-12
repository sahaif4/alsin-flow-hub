import { useState, useEffect } from "react";
import api from "@/services/api";
import { MaintenanceReport } from "@/types/maintenance";
import { columns, MaintenanceReportWithActions } from "./maintenance/columns";
import { DataTable } from "../tools/data-table";
import { useToast } from "@/components/ui/use-toast";

const AdminMaintenancePage = () => {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/maintenance/all");
      setReports(response.data);
    } catch (err) {
      setError("Failed to fetch maintenance reports.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAssign = async (reportId: number) => {
    // In a real UI, this would open a modal to select from a list of technicians.
    const technicianId = prompt("Enter Technician User ID to assign:");
    if (!technicianId || isNaN(parseInt(technicianId))) {
      toast({ title: "Invalid ID", description: "Please enter a valid user ID.", variant: "destructive" });
      return;
    }

    try {
      await api.post(`/maintenance/${reportId}/assign/${technicianId}`);
      toast({ title: "Success", description: "Technician assigned." });
      fetchReports();
    } catch (err) {
      toast({ title: "Error", description: "Failed to assign technician.", variant: "destructive" });
    }
  };

  const handleResolve = async (reportId: number) => {
     try {
      await api.post(`/maintenance/${reportId}/resolve`);
      toast({ title: "Success", description: "Report marked as resolved." });
      fetchReports();
    } catch (err) {
      toast({ title: "Error", description: "Failed to resolve report.", variant: "destructive" });
    }
  };

  const dataWithActions: MaintenanceReportWithActions[] = reports.map(r => ({
    ...r,
    onAssign: handleAssign,
    onResolve: handleResolve,
  }));

  if (isLoading) return <div>Loading reports...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Perawatan</h1>
        <p className="text-muted-foreground">
          Lihat semua laporan kerusakan dan kelola proses perbaikan.
        </p>
      </header>
      <DataTable columns={columns} data={dataWithActions} />
    </div>
  );
};

export default AdminMaintenancePage;
