import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const allProjects = [
  {
    id: "1",
    title: "Cosmic Dreams: An Animated Short Film",
    description: "A visually stunning animated journey through space, exploring themes of hope and discovery.",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    category: "Film",
    creator: "Luna Studios",
    goalAmount: 50,
    currentAmount: 38.5,
    backers: 247,
    daysLeft: 15,
    featured: true,
  },
  {
    id: "2",
    title: "Echoes: A Generative Music Album",
    description: "An experimental album blending AI-generated soundscapes with live instrumentation.",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    category: "Music",
    creator: "Digital Harmony",
    goalAmount: 25,
    currentAmount: 31.2,
    backers: 189,
    daysLeft: 8,
    featured: true,
  },
  {
    id: "3",
    title: "Urban Canvas: Street Art Documentary",
    description: "Following street artists from 5 continents as they transform cities into galleries.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    category: "Art",
    creator: "Collective Vision",
    goalAmount: 40,
    currentAmount: 22.8,
    backers: 156,
    daysLeft: 23,
  },
  {
    id: "4",
    title: "Neon Nights: Cyberpunk RPG",
    description: "An indie game set in a dystopian future where players shape the narrative through choices.",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    category: "Games",
    creator: "Pixel Forge",
    goalAmount: 75,
    currentAmount: 45.3,
    backers: 523,
    daysLeft: 30,
  },
  {
    id: "5",
    title: "Wild Horizons: Nature Photography Book",
    description: "A collection of breathtaking wildlife photographs from remote corners of the earth.",
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80",
    category: "Photography",
    creator: "Nature's Eye",
    goalAmount: 15,
    currentAmount: 12.7,
    backers: 98,
    daysLeft: 12,
  },
  {
    id: "6",
    title: "The Last Oracle: Fantasy Novel Series",
    description: "An epic fantasy trilogy following a young seer as ancient powers awaken.",
    image: "https://images.unsplash.com/photo-1518176258769-f227c798150e?w=800&q=80",
    category: "Publishing",
    creator: "Emma Stone",
    goalAmount: 20,
    currentAmount: 18.5,
    backers: 234,
    daysLeft: 18,
  },
];

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProjects = allProjects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || project.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="gradient-hero py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-5xl font-bold">Discover Projects</h1>
              <p className="text-xl text-muted-foreground">
                Explore creative projects from around the world
              </p>

              <div className="flex gap-3 mt-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-10 h-12 glass-card"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="glass" size="lg" className="gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="all" className="mb-8" onValueChange={setSelectedCategory}>
              <TabsList className="glass-card">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="film">Film</TabsTrigger>
                <TabsTrigger value="music">Music</TabsTrigger>
                <TabsTrigger value="art">Art</TabsTrigger>
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="photography">Photography</TabsTrigger>
                <TabsTrigger value="publishing">Publishing</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Discover;
