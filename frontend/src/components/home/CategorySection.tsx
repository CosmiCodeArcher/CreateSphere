import { Card } from "@/components/ui/card";
import { Film, Music, Palette, Gamepad2, Camera, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Film & Video", icon: Film, count: 234, color: "from-purple-500 to-pink-500" },
  { name: "Music", icon: Music, count: 189, color: "from-blue-500 to-cyan-500" },
  { name: "Art", icon: Palette, count: 312, color: "from-orange-500 to-red-500" },
  { name: "Games", icon: Gamepad2, count: 156, color: "from-green-500 to-emerald-500" },
  { name: "Photography", icon: Camera, count: 98, color: "from-indigo-500 to-purple-500" },
  { name: "Publishing", icon: BookOpen, count: 145, color: "from-pink-500 to-rose-500" },
];

export const CategorySection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-4xl font-bold">Explore by Category</h2>
          <p className="text-muted-foreground text-lg">
            Find projects that inspire you across creative fields
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={`/discover?category=${category.name.toLowerCase()}`}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-fade-in"
              >
                <Card className="p-6 hover:card-shadow hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <div className="text-center space-y-3">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">{category.count} projects</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
