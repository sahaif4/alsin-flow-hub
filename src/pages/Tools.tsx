import { useState, useEffect } from "react";
import api from "@/services/api";
import { Tool } from "@/types/tool";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { NavLink } from "react-router-dom";

const ToolsPage = () => {
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'tersedia':
        return 'success';
      case 'dipinjam':
        return 'warning';
      case 'dalam_perawatan':
      case 'rusak':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return <div>Loading tools...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Katalog Alat & Mesin</h1>
          <p className="text-muted-foreground">
            Jelajahi semua alat dan mesin yang tersedia untuk dipinjam atau disewa.
          </p>
        </header>
        {/* TODO: Add role-based check here to show button only for admins */}
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Alat
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <NavLink to={`/tools/${tool.id}`} key={tool.id} className="h-full">
            <Card className="flex flex-col h-full hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle>{tool.name}</CardTitle>
                <CardDescription className="capitalize">{tool.category.replace("_", " ")}</CardDescription>
              </CardHeader>
            <CardContent className="flex-grow">
              <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                <img
                  src={tool.image_url || "/placeholder.svg"}
                  alt={tool.name}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">
                {tool.description || "No description available."}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Badge variant={getStatusVariant(tool.status) as any}>
                    <span className="capitalize">{tool.status.replace("_", " ")}</span>
                </Badge>
                {tool.price && <div className="font-semibold">Rp {tool.price.toLocaleString('id-ID')}/hari</div>}
            </CardFooter>
          </Card>
        ))}
      </div>
       {tools.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p>Tidak ada alat yang tersedia saat ini.</p>
        </div>
      )}
    </div>
  );
};

export default ToolsPage;
