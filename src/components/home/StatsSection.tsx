import { TrendingUp, Users, Rocket, DollarSign } from "lucide-react";

const stats = [
  {
    icon: DollarSign,
    value: "12.5M ETH",
    label: "Total Funded",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Rocket,
    value: "1,234",
    label: "Projects Launched",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    value: "45.2K",
    label: "Active Backers",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: TrendingUp,
    value: "89%",
    label: "Success Rate",
    gradient: "from-green-500 to-emerald-500",
  },
];

export const StatsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Powered by Community</h2>
          <p className="text-muted-foreground text-lg">
            Real numbers from our decentralized platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center space-y-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center animate-float`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-gradient">
                    {stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
