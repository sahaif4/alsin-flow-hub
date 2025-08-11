import { Button } from "@/components/ui/button";
import { Tractor, Menu, User } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
            <Tractor className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">ALSIN</h1>
            <p className="text-xs text-muted-foreground">Bengkel Pertanian</p>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#beranda" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Beranda
          </a>
          <a href="#layanan" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Layanan
          </a>
          <a href="#tentang" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Tentang
          </a>
          <a href="#kontak" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Kontak
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <User className="w-4 h-4" />
            Masuk
          </Button>
          <Button variant="default" size="sm">
            Daftar
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;