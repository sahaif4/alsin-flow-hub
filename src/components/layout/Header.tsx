import { CircleUser, Menu, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();

  // We can reuse the nav items from Sidebar for the mobile menu
  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/tools", label: "Alat & Mesin" },
    { to: "/transactions", label: "Peminjaman" },
    { to: "/maintenance", label: "Perawatan" },
    { to: "/chat", label: "Konsultasi" },
    { to: "/profile", label: "Profil" },
  ];

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <NavLink
              to="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Tractor className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Bengkel ALSIN</span>
            </NavLink>
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Breadcrumb or Title can go here */}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.full_name || "My Account"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <NavLink to="/profile">Profile</NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
