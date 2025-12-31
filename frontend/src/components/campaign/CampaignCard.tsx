
import { Link } from "react-router-dom";
import type{ Campaign } from "../../types/campaign.types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard = ({ campaign }: CampaignCardProps) => {
  return (
    <Card className="w-[300px] flex flex-col">
      <CardHeader>
        <CardTitle>{campaign.title}</CardTitle>
        <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <img src={campaign.coverImage} alt={campaign.title} className="w-full h-32 object-cover rounded-md mb-4" />
        <p>
          Target: ${parseFloat(campaign.targetAmount).toFixed(2)}
        </p>
        <p>Status: {campaign.status}</p>
        <p>Donations: {campaign.donationCount}</p>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Link to={`/campaigns/${campaign.id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
