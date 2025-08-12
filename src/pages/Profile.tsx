import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading profile...</div>;
  }

  const getInitials = (name: string) => {
      const names = name.split(' ');
      if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Profil Pengguna</h1>
        <p className="text-muted-foreground">Lihat dan kelola informasi profil Anda di sini.</p>
      </header>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.full_name}`} alt={user.full_name} />
                <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
                <CardTitle className="text-2xl">{user.full_name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <h3 className="font-medium text-sm">Role</h3>
                    <Badge variant="secondary" className="capitalize w-fit">{user.role.replace(/_/g, " ")}</Badge>
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="font-medium text-sm">Bergabung Sejak</h3>
                    <p className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                 <div className="flex flex-col gap-1">
                    <h3 className="font-medium text-sm">Status Akun</h3>
                    <p className="text-sm text-muted-foreground">
                        {user.approved_at ? `Disetujui pada ${new Date(user.approved_at).toLocaleDateString('id-ID')}` : 'Menunggu Persetujuan Admin'}
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
