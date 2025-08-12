import { useState, useEffect } from "react";
import api from "@/services/api";
import { Transaction } from "@/types/transaction";
import { columns, TransactionWithActions } from "./transactions/columns";
import { DataTable } from "../tools/data-table";
import { useToast } from "@/components/ui/use-toast";

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/transactions/all");
      setTransactions(response.data);
    } catch (err) {
      setError("Failed to fetch transactions.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/transactions/${id}/approve`);
      toast({ title: "Success", description: "Transaction approved." });
      fetchTransactions();
    } catch (err) {
      toast({ title: "Error", description: "Failed to approve transaction.", variant: "destructive" });
    }
  };

  const handleReject = async (id: number) => {
     try {
      await api.post(`/transactions/${id}/reject`);
      toast({ title: "Success", description: "Transaction rejected." });
      fetchTransactions();
    } catch (err) {
      toast({ title: "Error", description: "Failed to reject transaction.", variant: "destructive" });
    }
  };

  const dataWithActions: TransactionWithActions[] = transactions.map(tx => ({
    ...tx,
    onApprove: handleApprove,
    onReject: handleReject,
  }));

  if (isLoading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Transaksi</h1>
        <p className="text-muted-foreground">
          Approve atau tolak permintaan peminjaman dan penyewaan dari pengguna.
        </p>
      </header>
      <DataTable columns={columns} data={dataWithActions} />
    </div>
  );
};

export default AdminTransactionsPage;
