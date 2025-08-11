import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  CreditCard, 
  MessageSquare, 
  Calendar,
  BarChart3,
  Settings,
  Users,
  FileText,
  Truck,
  RotateCcw,
  HelpCircle
} from "lucide-react";

const services = [
  {
    icon: Wrench,
    title: "Peminjaman Alat & Mesin",
    description: "Form peminjaman dengan status ketersediaan real-time untuk semua alat pertanian",
    features: ["Status ketersediaan", "Form digital", "Persetujuan otomatis"]
  },
  {
    icon: RotateCcw,
    title: "Pengembalian & Inspeksi",
    description: "Sistem pengembalian dengan dokumentasi foto kondisi alat",
    features: ["Upload foto kondisi", "Checklist inspeksi", "Laporan kerusakan"]
  },
  {
    icon: Truck,
    title: "Penyewaan untuk Petani",
    description: "Layanan penyewaan alat untuk petani dan instansi pertanian",
    features: ["Paket sewa fleksibel", "Pengiriman tersedia", "Harga kompetitif"]
  },
  {
    icon: CreditCard,
    title: "Pembayaran Digital",
    description: "Sistem pembayaran terintegrasi dengan kuitansi dan tagihan otomatis",
    features: ["Multiple payment", "E-receipt", "Tracking pembayaran"]
  },
  {
    icon: Settings,
    title: "Tools Bengkel",
    description: "Manajemen peminjaman tools dan peralatan bengkel internal",
    features: ["Inventory tracking", "Booking system", "Maintenance log"]
  },
  {
    icon: MessageSquare,
    title: "Chat & Konsultasi",
    description: "Platform komunikasi dengan fitur lampiran file dan pilihan penerima",
    features: ["Chat real-time", "File sharing", "Expert consultation"]
  },
  {
    icon: Calendar,
    title: "Perawatan & Perbaikan",
    description: "Penjadwalan perawatan dan sistem penugasan tim bengkel",
    features: ["Jadwal maintenance", "Task assignment", "Progress tracking"]
  },
  {
    icon: Users,
    title: "Evaluasi Tim",
    description: "Sistem evaluasi kinerja tim bengkel dengan laporan harian dan mingguan",
    features: ["Performance metrics", "Daily reports", "Team analytics"]
  },
  {
    icon: BarChart3,
    title: "Laporan Bulanan",
    description: "Dashboard analitik penggunaan alat dan laporan keuangan lengkap",
    features: ["Usage analytics", "Financial reports", "Data visualization"]
  },
  {
    icon: FileText,
    title: "Manajemen Alat",
    description: "Panel admin untuk kelola alat, upload gambar, dan spesifikasi",
    features: ["Asset management", "Photo gallery", "Specification docs"]
  },
  {
    icon: HelpCircle,
    title: "Bantuan & Support",
    description: "Layanan kontak dan bantuan teknis 24/7 untuk pengguna sistem",
    features: ["24/7 support", "Knowledge base", "Video tutorials"]
  }
];

const Services = () => {
  return (
    <section id="layanan" className="py-24 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Fitur Lengkap untuk
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              Manajemen Pertanian Modern
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sistem terintegrasi yang menggabungkan semua aspek operasional bengkel ALSIN 
            dalam satu platform yang mudah digunakan
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-lg group-hover:scale-110 transition-transform">
                    <service.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-4">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="outline" size="sm" className="w-full group-hover:bg-primary/5">
                  Pelajari Lebih Lanjut
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;