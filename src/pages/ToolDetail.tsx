import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Tool, ToolStatus } from "@/types/tool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { MaintenanceReportForm } from "@/components/forms/MaintenanceReportForm";

const ToolDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchTool = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/tools/${id}`);
        setTool(response.data);
      } catch (err) {
        setError("Failed to fetch tool details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  const getStatusVariant = (status: ToolStatus) => {
    switch (status) {
      case ToolStatus.TERSEDIA: return 'success';
      case ToolStatus.DIPINJAM: return 'warning';
      default: return 'destructive';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><div>Loading tool details...</div></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen"><div className="text-destructive">{error}</div></div>;
  }

  if (!tool) {
    return <div className="flex items-center justify-center h-screen"><div>Tool not found.</div></div>;
  }

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                {tool.name}
            </h1>
            <Badge variant={getStatusVariant(tool.status) as any} className="ml-auto sm:ml-0 capitalize">
                {tool.status.replace(/_/g, " ")}
            </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Alat</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center p-4">
                            <img
                                src={tool.image_url || "/placeholder.svg"}
                                alt={tool.name}
                                className="max-h-full max-w-full object-contain rounded-md"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Deskripsi</h3>
                            <p className="text-muted-foreground">{tool.description || "Tidak ada deskripsi."}</p>
                        </div>
                        {tool.specifications && (
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Spesifikasi</h3>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    {Object.entries(tool.specifications).map(([key, value]) => (
                                        <React.Fragment key={key}>
                                            <dt className="font-medium capitalize">{key.replace(/_/g, " ")}</dt>
                                            <dd className="text-muted-foreground">{String(value)}</dd>
                                        </React.Fragment>
                                    ))}
                                </dl>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Status & Peminjaman</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {tool.price && (
                            <div>
                                <h3 className="font-semibold">Harga Sewa</h3>
                                <p className="text-2xl font-bold">Rp {tool.price.toLocaleString('id-ID')},- <span className="text-sm font-normal text-muted-foreground">/ hari</span></p>
                            </div>
                        )}
                        {tool.price && (
                            <div>
                                <h3 className="font-semibold">Harga Sewa</h3>
                                <p className="text-2xl font-bold">Rp {tool.price.toLocaleString('id-ID')},- <span className="text-sm font-normal text-muted-foreground">/ hari</span></p>
                            </div>
                        )}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="lg" disabled={tool.status !== ToolStatus.TERSEDIA}>
                                    {tool.price ? 'Sewa Alat Ini' : 'Pinjam Alat Ini'}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Formulir Peminjaman</DialogTitle>
                                    <DialogDescription>
                                        Pilih tanggal untuk melanjutkan.
                                    </DialogDescription>
                                </DialogHeader>
                                <TransactionForm tool={tool} />
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Report an Issue</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Laporkan Masalah</DialogTitle>
                                </DialogHeader>
                                <MaintenanceReportForm tool={tool} />
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
};

export default ToolDetailPage;
