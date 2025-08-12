import { useState, useEffect } from "react";
import api from "@/services/api";
import { User } from "@/types/user";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/users/");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: number) => {
    try {
      await api.post(`/users/${userId}/approve`);
      toast({
        title: "Success",
        description: "User has been approved.",
      });
      fetchUsers(); // Refresh the list
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve user.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">Menyetujui pendaftaran pengguna baru dan melihat semua pengguna terdaftar.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>Total {users.length} pengguna terdaftar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Bergabung</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    <Badge variant={user.approved_at ? "success" : "secondary"}>
                      {user.approved_at ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(user.created_at), "dd LLL yyyy")}</TableCell>
                  <TableCell className="text-right">
                    {!user.approved_at && (
                      <Button size="sm" onClick={() => handleApprove(user.id)}>
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
