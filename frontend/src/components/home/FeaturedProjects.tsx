import { ProjectCard } from "@/components/projects/ProjectCard";

const featuredProjects = [
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
];

export const FeaturedProjects = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-3 animate-fade-in">
          <h2 className="text-4xl font-bold">Featured Projects</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover groundbreaking creative projects backed by our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
};
