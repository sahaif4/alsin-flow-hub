import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  LayoutDashboard, 
  Wrench, 
  RotateCcw, 
  CreditCard,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const workflowSteps = [
  {
    icon: UserPlus,
    title: "Login / Registrasi",
    description: "Daftar dan dapatkan persetujuan admin untuk akses sistem",
    details: "Proses verifikasi cepat dengan approval admin untuk keamanan optimal"
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Sesuai Role",
    description: "Interface yang disesuaikan dengan peran pengguna",
    details: "Admin, operator, dan petani memiliki dashboard yang berbeda"
  },
  {
    icon: Wrench,
    title: "Peminjaman Alat",
    description: "Form peminjaman dengan status ketersediaan real-time",
    details: "Lihat ketersediaan, pilih alat, dan submit request dalam hitungan detik"
  },
  {
    icon: RotateCcw,
    title: "Pengembalian & Inspeksi",
    description: "Dokumentasi kondisi alat saat pengembalian",
    details: "Upload foto, checklist kondisi, dan laporan kerusakan jika ada"
  },
  {
    icon: CreditCard,
    title: "Pembayaran",
    description: "Proses pembayaran digital dengan kuitansi otomatis",
    details: "Multiple payment methods dengan tracking pembayaran lengkap"
  },
  {
    icon: CheckCircle,
    title: "Selesai",
    description: "Transaksi selesai dengan laporan lengkap",
    details: "Dapatkan laporan penggunaan dan feedback untuk layanan yang lebih baik"
  }
];

const Workflow = () => {
  return (
    <section className="py-24 bg-gradient-earth">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Alur Kerja yang
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              Sederhana & Efisien
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ikuti 6 langkah mudah untuk mulai menggunakan sistem manajemen alat pertanian kami
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-3 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="h-full group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <step.icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        <p className="text-xs text-muted-foreground opacity-75">{step.details}</p>
                      </div>

                      <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arrow for desktop */}
                  {index < workflowSteps.length - 1 && index % 3 !== 2 && (
                    <ArrowRight className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-6 h-6 text-primary/40" />
                  )}
                  
                  {/* Down arrow for row break */}
                  {index === 2 && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-6 text-primary/40 rotate-90">
                      <ArrowRight />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-6">
            {workflowSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="group hover:shadow-medium transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        <step.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        <p className="text-xs text-muted-foreground opacity-75">{step.details}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Arrow for mobile */}
                {index < workflowSteps.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="w-5 h-5 text-primary/40 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="lg" className="group">
            Mulai Menggunakan Sistem
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Workflow;