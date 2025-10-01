import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CreateProject = () => {
  const [milestones, setMilestones] = useState([
    { title: "", amount: "", description: "" }
  ]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", amount: "", description: "" }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Project created successfully! (Demo mode)");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 gradient-hero">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium">
                <Rocket className="h-4 w-4 text-primary" />
                <span>Launch Your Vision</span>
              </div>
              <h1 className="text-5xl font-bold">Create a Project</h1>
              <p className="text-muted-foreground text-lg">
                Bring your creative project to life with blockchain-powered crowdfunding
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Project Basics</CardTitle>
                  <CardDescription>
                    Start with the fundamental details about your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter a clear, compelling title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="film">Film & Video</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="games">Games</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="publishing">Publishing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project in detail. What makes it unique?"
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Project Image URL *</Label>
                    <Input
                      id="image"
                      type="url"
                      placeholder="https://..."
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload to IPFS or use a public URL
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Funding Goals */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Funding Details</CardTitle>
                  <CardDescription>
                    Set your funding goal and campaign duration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal">Funding Goal (ETH) *</Label>
                      <Input
                        id="goal"
                        type="number"
                        step="0.01"
                        placeholder="50.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Campaign Duration (days) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="30"
                        min="1"
                        max="60"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card className="card-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Project Milestones</CardTitle>
                      <CardDescription>
                        Define milestones for fund release
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMilestone}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeMilestone(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <div className="space-y-2">
                        <Label>Milestone {index + 1} Title *</Label>
                        <Input
                          placeholder="e.g., Pre-production phase"
                          required
                          value={milestone.title}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[index].title = e.target.value;
                            setMilestones(newMilestones);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Amount (ETH) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="10.00"
                          required
                          value={milestone.amount}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[index].amount = e.target.value;
                            setMilestones(newMilestones);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe what you'll accomplish in this phase"
                          rows={3}
                          value={milestone.description}
                          onChange={(e) => {
                            const newMilestones = [...milestones];
                            newMilestones[index].description = e.target.value;
                            setMilestones(newMilestones);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="submit" variant="gradient" size="lg" className="flex-1">
                  <Rocket className="mr-2 h-5 w-5" />
                  Launch Project
                </Button>
                <Button type="button" variant="outline" size="lg">
                  Save Draft
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                By launching, you agree to CreateSphere's terms and smart contract conditions
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateProject;
