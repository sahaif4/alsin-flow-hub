import { useState, useEffect } from "react";
import api from "@/services/api";
import { WorkLog } from "@/types/worklog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const WorkLogsPage = () => {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [notes, setNotes] = useState("");
  const [target, setTarget] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/worklogs/me");
      setLogs(response.data);
    } catch (err) {
      setError("Failed to fetch work logs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast({ title: "Error", description: "Notes cannot be empty.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/worklogs/", {
        notes: notes,
        target_description: target || null,
      });
      toast({ title: "Success", description: "Work log submitted." });
      setNotes("");
      setTarget("");
      fetchLogs(); // Refresh list
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit work log.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Log Kerja Harian</h1>
        <p className="text-muted-foreground">Catat pekerjaan harian dan lihat riwayat Anda.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Submit Log Baru</CardTitle>
          <CardDescription>Isi form di bawah untuk mencatat pekerjaan Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan Pekerjaan</Label>
              <Textarea
                id="notes"
                placeholder="Deskripsikan pekerjaan yang Anda lakukan hari ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                rows={5}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target">Target Mingguan (Opsional)</Label>
              <Input
                id="target"
                placeholder="Contoh: Menyelesaikan perbaikan traktor"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? "Submitting..." : "Submit Log"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Log Kerja</CardTitle>
          <CardDescription>Log kerja Anda sebelumnya, diurutkan dari yang terbaru.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading logs...</p>}
          {error && <p className="text-destructive">{error}</p>}
          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map(log => (
                <div key={log.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <p className="font-semibold">{log.notes}</p>
                  {log.target_description && <p className="text-sm mt-1 text-muted-foreground">Target: {log.target_description}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(log.log_date), "eeee, dd LLL yyyy, HH:mm")}
                  </p>
                </div>
              ))
            ) : (
              !isLoading && <p className="text-sm text-muted-foreground">Anda belum memiliki log kerja.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkLogsPage;
