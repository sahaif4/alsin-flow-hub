import { useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ToolUsageStat {
  tool_name: string;
  transaction_count: number;
}

interface FinancialReport {
  total_income: number;
  year: number;
  month: number;
}

const AdminReportsPage = () => {
    const [year, setYear] = useState<string>(String(new Date().getFullYear()));
    const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [toolUsage, setToolUsage] = useState<ToolUsageStat[]>([]);
    const [financials, setFinancials] = useState<FinancialReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFetchReports = async () => {
        setIsLoading(true);
        setToolUsage([]);
        setFinancials(null);
        try {
            const usagePromise = api.get(`/reports/usage/monthly?year=${year}&month=${month}`);
            const financialPromise = api.get(`/reports/financial/monthly?year=${year}&month=${month}`);

            const [usageResponse, financialResponse] = await Promise.all([usagePromise, financialPromise]);

            setToolUsage(usageResponse.data);
            setFinancials(financialResponse.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setIsLoading(false);
        }
    };

    const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));
    const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Laporan Bulanan</h1>
                <p className="text-muted-foreground">Analisis data penggunaan alat dan keuangan.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Pilih Periode</CardTitle>
                    <CardDescription>Pilih tahun dan bulan untuk melihat laporan.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFetchReports} disabled={isLoading}>
                        {isLoading ? "Fetching..." : "Generate Report"}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && <p>Loading reports...</p>}

            {financials && !isLoading && (
                <Card>
                    <CardHeader><CardTitle>Ringkasan Keuangan - {months.find(m => m.value === String(financials.month))?.label} {financials.year}</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">Total Pendapatan: Rp {financials.total_income.toLocaleString('id-ID')},-</p>
                    </CardContent>
                </Card>
            )}
            {toolUsage.length > 0 && !isLoading && (
                 <Card>
                    <CardHeader><CardTitle>Statistik Penggunaan Alat</CardTitle></CardHeader>
                    <CardContent className="grid gap-8">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={toolUsage}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="tool_name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="transaction_count" fill="#8884d8" name="Jumlah Transaksi" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Alat</TableHead>
                                    <TableHead className="text-right">Jumlah Transaksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {toolUsage.map(stat => (
                                    <TableRow key={stat.tool_name}>
                                        <TableCell className="font-medium">{stat.tool_name}</TableCell>
                                        <TableCell className="text-right">{stat.transaction_count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
             {!financials && !toolUsage.length && !isLoading && (
                <p className="text-center text-muted-foreground">No data for the selected period. Please generate a report.</p>
             )}
        </div>
    );
}

export default AdminReportsPage;
