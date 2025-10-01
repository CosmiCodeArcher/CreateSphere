import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Clock, TrendingUp, Share2, Heart, 
  CheckCircle2, Circle, Award, Shield 
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

const ProjectDetail = () => {
  const { id } = useParams();
  const [backingAmount, setBackingAmount] = useState("");

  // Mock project data
  const project = {
    title: "Cosmic Dreams: An Animated Short Film",
    description: "A visually stunning animated journey through space, exploring themes of hope and discovery. This 15-minute short film combines traditional hand-drawn animation with cutting-edge 3D rendering to create a unique visual experience.",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
    category: "Film",
    creator: {
      name: "Luna Studios",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
      bio: "Independent animation studio focused on thought-provoking storytelling",
    },
    goalAmount: 50,
    currentAmount: 38.5,
    backers: 247,
    daysLeft: 15,
    milestones: [
      { title: "Pre-production", completed: true, amount: 10 },
      { title: "Animation Phase 1", completed: true, amount: 15 },
      { title: "Animation Phase 2", completed: false, amount: 15 },
      { title: "Post-production", completed: false, amount: 10 },
    ],
    rewards: [
      { amount: 0.1, title: "Digital Thank You", description: "Your name in the credits + exclusive wallpaper", backers: 89 },
      { amount: 0.5, title: "Supporter NFT", description: "Limited edition NFT + all previous rewards", backers: 112 },
      { amount: 1.0, title: "Behind the Scenes", description: "Exclusive BTS content + NFT badge + all previous", backers: 46 },
    ],
  };

  const progress = (project.currentAmount / project.goalAmount) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Image */}
              <div className="relative overflow-hidden rounded-2xl aspect-video card-shadow">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 glass-card">
                  {project.category}
                </Badge>
              </div>

              {/* Project Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
                    <p className="text-lg text-muted-foreground">{project.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Creator Info */}
                <Card className="glass-card">
                  <CardContent className="flex items-center gap-4 p-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={project.creator.avatar} />
                      <AvatarFallback>LS</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{project.creator.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.creator.bio}</p>
                    </div>
                    <Button variant="outline">Follow</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="story" className="w-full">
                <TabsList className="glass-card w-full justify-start">
                  <TabsTrigger value="story">Story</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger value="updates">Updates</TabsTrigger>
                  <TabsTrigger value="backers">Backers</TabsTrigger>
                </TabsList>

                <TabsContent value="story" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Project</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        Cosmic Dreams is a passion project that has been in development for over two years. 
                        Our team of 8 talented artists and animators are committed to creating something truly special.
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        The film explores themes of hope, discovery, and the human spirit through the lens of 
                        space exploration. Using a unique blend of animation techniques, we're creating visuals 
                        that have never been seen before.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 pt-4">
                        <div className="flex gap-3">
                          <Shield className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-semibold">Smart Contract Secured</h4>
                            <p className="text-sm text-muted-foreground">Funds released by milestones</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Award className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-semibold">NFT Rewards</h4>
                            <p className="text-sm text-muted-foreground">Exclusive backer benefits</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {project.milestones.map((milestone, index) => (
                          <div key={index} className="flex gap-4 items-start">
                            {milestone.completed ? (
                              <CheckCircle2 className="h-6 w-6 text-primary mt-1" />
                            ) : (
                              <Circle className="h-6 w-6 text-muted-foreground mt-1" />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold">{milestone.title}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {milestone.amount} ETH
                                </span>
                              </div>
                              <Badge variant={milestone.completed ? "default" : "secondary"}>
                                {milestone.completed ? "Completed" : "In Progress"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="updates">
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <p>No updates yet. Check back soon!</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="backers">
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <p>Backer list coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="card-shadow sticky top-24">
                <CardContent className="p-6 space-y-6">
                  {/* Funding Progress */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-bold text-primary mb-1">
                        {project.currentAmount} ETH
                      </div>
                      <div className="text-sm text-muted-foreground">
                        pledged of {project.goalAmount} ETH goal
                      </div>
                    </div>

                    <Progress value={progress} className="h-3" />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-2xl font-bold">{project.backers}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          backers
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{project.daysLeft}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          days left
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Choose Your Reward</h3>
                    {project.rewards.map((reward, index) => (
                      <Card key={index} className="hover:border-primary transition-colors cursor-pointer">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="font-semibold">{reward.amount} ETH</div>
                            <Badge variant="secondary" className="text-xs">
                              {reward.backers} backers
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{reward.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {reward.description}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button variant="gradient" size="lg" className="w-full">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Back this project
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    All or nothing. This project will only be funded if it reaches its goal.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
