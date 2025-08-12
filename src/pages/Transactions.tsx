import { useState, useEffect } from "react";
import api from "@/services/api";
import { Transaction, TransactionStatus } from "@/types/transaction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/transactions/me");
        setTransactions(response.data);
      } catch (err) {
        setError("Failed to fetch transactions.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.APPROVED: return 'success';
      case TransactionStatus.PENDING_APPROVAL: return 'secondary';
      case TransactionStatus.REJECTED: return 'destructive';
      case TransactionStatus.RETURNED: return 'default';
      default: return 'outline';
    }
  };


  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Transaksi Saya</h1>
        <p className="text-muted-foreground">
          Riwayat peminjaman dan penyewaan alat Anda.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>Berikut adalah semua permintaan peminjaman dan penyewaan Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alat</TableHead>
                <TableHead>Tanggal Pinjam</TableHead>
                <TableHead>Tanggal Kembali</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tipe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.tool.name}</TableCell>
                    <TableCell>{format(new Date(tx.start_date), "dd LLL yyyy")}</TableCell>
                    <TableCell>{format(new Date(tx.end_date), "dd LLL yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(tx.status)} className="capitalize">
                        {tx.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-right">{tx.transaction_type}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Anda belum memiliki transaksi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
