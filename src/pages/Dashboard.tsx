import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Users, Clock, Wallet, 
  Rocket, Gift, BarChart3, Settings 
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const stats = [
    { label: "Total Backed", value: "2.5 ETH", icon: Wallet, color: "from-purple-500 to-pink-500" },
    { label: "Projects Backed", value: "12", icon: Rocket, color: "from-blue-500 to-cyan-500" },
    { label: "NFTs Earned", value: "8", icon: Gift, color: "from-orange-500 to-red-500" },
    { label: "Active Projects", value: "3", icon: BarChart3, color: "from-green-500 to-emerald-500" },
  ];

  const backedProjects = [
    {
      id: "1",
      title: "Cosmic Dreams",
      image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80",
      backed: 0.5,
      progress: 77,
      status: "Active",
    },
    {
      id: "2",
      title: "Echoes Album",
      image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80",
      backed: 1.0,
      progress: 124,
      status: "Funded",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Manage your projects and contributions</p>
            </div>
            <Link to="/create">
              <Button variant="gradient" className="gap-2">
                <Rocket className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="card-shadow hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="backed" className="space-y-6">
            <TabsList className="glass-card">
              <TabsTrigger value="backed">Backed Projects</TabsTrigger>
              <TabsTrigger value="created">My Projects</TabsTrigger>
              <TabsTrigger value="rewards">NFT Rewards</TabsTrigger>
            </TabsList>

            <TabsContent value="backed" className="space-y-6">
              {backedProjects.map((project) => (
                <Card key={project.id} className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              You backed {project.backed} ETH
                            </p>
                          </div>
                          <Badge variant={project.status === "Funded" ? "default" : "secondary"}>
                            {project.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Funding Progress</span>
                            <span className="text-muted-foreground">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex gap-2">
                          <Link to={`/project/${project.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              View Project
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="created">
              <Card className="card-shadow">
                <CardContent className="p-12 text-center space-y-4">
                  <Rocket className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
                    <p className="text-muted-foreground">
                      Start your first project and bring your creative vision to life
                    </p>
                  </div>
                  <Link to="/create">
                    <Button variant="gradient">Create Project</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards">
              <Card className="card-shadow">
                <CardContent className="p-12 text-center space-y-4">
                  <Gift className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Your NFT Collection</h3>
                    <p className="text-muted-foreground">
                      Collect unique NFTs by backing creative projects
                    </p>
                  </div>
                  <Link to="/discover">
                    <Button variant="gradient">Discover Projects</Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
