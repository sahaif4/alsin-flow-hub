import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Tractor, Wrench, MessageSquare, FileText, User, Users, ClipboardList, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/user";

const Sidebar = () => {
  const { user } = useAuth();

  const allNavItems = [
    { to: "/", label: "Dashboard", icon: Home, adminOnly: false },
    { to: "/tools", label: "Alat & Mesin", icon: Tractor, adminOnly: false },
    { to: "/transactions", label: "Peminjaman", icon: FileText, adminOnly: false },
    { to: "/work-logs", label: "Log Kerja", icon: ClipboardList, adminOnly: false }, // For technicians/operators
    { to: "/maintenance", label: "Perawatan", icon: Wrench, adminOnly: false },
    { to: "/chat", label: "Konsultasi", icon: MessageSquare, adminOnly: false },
    { to: "/profile", label: "Profil", icon: User, adminOnly: false },
  ];

  const adminNavItems = [
    { to: "/admin/users", label: "Manajemen Pengguna", icon: Users, adminOnly: true },
    { to: "/admin/tools", label: "Manajemen Alat", icon: Tractor, adminOnly: true },
    { to: "/admin/transactions", label: "Manajemen Transaksi", icon: FileText, adminOnly: true },
    { to: "/admin/maintenance", label: "Manajemen Perawatan", icon: Wrench, adminOnly: true },
    { to: "/admin/reports", label: "Laporan Bulanan", icon: BarChart3, adminOnly: true },
    // Future admin links can go here
  ];

  const navItems = user?.role === UserRole.ADMIN ? [...allNavItems, ...adminNavItems] : allNavItems;

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Tractor className="h-6 w-6" />
            <span>Bengkel ALSIN</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    isActive ? "bg-muted text-primary" : ""
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
