import { TrendingUp, Users, Clock, Star } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "500+",
    label: "Alat & Mesin Tersedia",
    description: "Berbagai jenis alat pertanian modern"
  },
  {
    icon: Users,
    value: "1,200+",
    label: "Petani Terdaftar",
    description: "Aktif menggunakan sistem"
  },
  {
    icon: Clock,
    value: "98%",
    label: "System Uptime",
    description: "Keandalan sistem 24/7"
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Rating Kepuasan",
    description: "Feedback pengguna"
  }
];

const Stats = () => {
  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_center,_white_2px,_transparent_2px)] bg-[length:60px_60px]" />
      </div>
      
      <div className="container px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Dipercaya oleh Ribuan Petani
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Angka-angka yang membuktikan komitmen kami untuk mendukung pertanian Indonesia
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-primary-foreground/90">
                  {stat.label}
                </div>
                <div className="text-sm text-primary-foreground/70">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;