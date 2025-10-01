import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  creator: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  daysLeft: number;
  featured?: boolean;
}

export const ProjectCard = ({
  id,
  title,
  description,
  image,
  category,
  creator,
  goalAmount,
  currentAmount,
  backers,
  daysLeft,
  featured = false,
}: ProjectCardProps) => {
  const progress = (currentAmount / goalAmount) * 100;
  const isFullyFunded = progress >= 100;

  return (
    <Card className="group overflow-hidden card-shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <Link to={`/project/${id}`}>
        <div className="relative overflow-hidden aspect-video">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {featured && (
            <Badge className="absolute top-3 right-3 gradient-accent">
              Featured
            </Badge>
          )}
          <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm">
            {category}
          </Badge>
        </div>
      </Link>

      <CardHeader className="pb-3">
        <Link to={`/project/${id}`}>
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground">by {creator}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">{currentAmount} ETH</span>
            <span className="text-muted-foreground">of {goalAmount} ETH</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{backers} backers</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{daysLeft} days left</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link to={`/project/${id}`} className="w-full">
          <Button
            variant={isFullyFunded ? "secondary" : "gradient"}
            className="w-full"
          >
            {isFullyFunded ? (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Fully Funded
              </>
            ) : (
              "Back this project"
            )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
