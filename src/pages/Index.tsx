import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// A specific dashboard component for Admins
const AdminDashboard = () => (
  <div>
    <h2 className="text-xl font-semibold mb-2">System Overview</h2>
    <p className="text-muted-foreground">
      As an administrator, you can manage all aspects of the system from the navigation menu.
    </p>
    {/* In the future, we can add stats like "Total Users", "Tools out for rent", etc. */}
  </div>
);

// A generic dashboard for other authenticated users
const UserDashboard = () => {
    const { user } = useAuth();
    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">My Dashboard</h2>
            <p className="text-muted-foreground">
                Welcome back, {user?.full_name}. You can manage your activities from the menu.
            </p>
            {/* In the future, we can add "My recent transactions", "Tools due soon", etc. */}
        </div>
    );
}

const Index = () => {
  const { user } = useAuth();

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return <AdminDashboard />;

      // Here you can add more cases for other specific roles
      // case UserRole.KEPALA_BENGKEL:
      //   return <WorkshopHeadDashboard />;
      // case UserRole.TEKNISI_OPERATOR:
      //   return <TechnicianDashboard />;

      // A default dashboard for all other roles
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Selamat Datang, {user?.full_name}!</h1>
        <p className="text-muted-foreground">
          Here's an overview of the workshop's activities.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {renderDashboardByRole()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
