import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Campaign } from "../../types/campaign.types";
import { getAllCampaigns } from "../../services/campaign.service";
import CampaignCard from "../../components/campaign/CampaignCard";
import { toast } from "sonner";
import { Heart, Shield, ArrowRight, Search, ListFilter } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../components/ui/pagination";

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const campaignsPerPage = 9;

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const data = await getAllCampaigns({
          // Assuming the API supports these query params
          // searchTerm, 
          // sort: sortOption
        });
        setCampaigns(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Failed to fetch campaigns.";
        setError(errorMessage);
        toast.error("Failed to fetch campaigns", {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [
    // sortOption
  ]);

  const filteredAndSortedCampaigns = campaigns
    .filter((campaign) =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "ending-soon":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case "most-funded":
          return (b.totalMoneyRaised || 0) - (a.totalMoneyRaised || 0);
        case "latest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Pagination logic
  const indexOfLastCampaign = currentPage * campaignsPerPage;
  const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
  const currentCampaigns = filteredAndSortedCampaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);
  const totalPages = Math.ceil(filteredAndSortedCampaigns.length / campaignsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          {/* Header Skeleton */}
          <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-4 skeleton"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-8 skeleton"></div>
          
          {/* Filters Skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div className="h-10 bg-gray-200 rounded-lg w-2/5 skeleton"></div>
            <div className="h-10 bg-gray-200 rounded-lg w-24 skeleton"></div>
          </div>

          {/* Campaign Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(campaignsPerPage)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-200 skeleton"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded skeleton"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 skeleton"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Campaigns</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 lg:py-16">
      <div className="container mx-auto px-6">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Explore Campaigns
          </h1>
          <p className="text-xl text-gray-600">
            Find and support causes you care about. Every contribution makes a difference.
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              type="text"
              placeholder="Search campaigns..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto">
                <ListFilter className="w-4 h-4" />
                Sort by: {
                  {
                    "latest": "Latest",
                    "ending-soon": "Ending Soon",
                    "most-funded": "Most Funded"
                  }[sortOption]
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort Campaigns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOption("latest")}>Latest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("ending-soon")}>Ending Soon</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("most-funded")}>Most Funded</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Campaign Grid */}
        {currentCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center col-span-full">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Campaigns Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No campaigns matched your search. Try a different search term or filter.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSortOption("latest");
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;
