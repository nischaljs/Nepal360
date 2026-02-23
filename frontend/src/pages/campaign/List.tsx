import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Campaign } from "../../types/campaign.types";
import { CAMPAIGN_CATEGORIES } from "../../types/campaign.types";
import { getAllCampaigns } from "../../services/campaign.service";
import CampaignCard from "../../components/campaign/CampaignCard";
import { toast } from "sonner";
import { Heart, Shield, Search, ListFilter, Sparkles, X } from "lucide-react";
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

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "most_funded", label: "Most Funded" },
  { value: "oldest", label: "Oldest" },
] as const;

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const campaignsPerPage = 9;
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    document.title = "Explore Campaigns | Nepal360";
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 400);
  }, []);

  useEffect(() => {
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const data = await getAllCampaigns({
          search: debouncedSearch || undefined,
          category: selectedCategory || undefined,
          sort: sortOption === "newest" ? undefined : sortOption,
        });
        setCampaigns(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Failed to fetch campaigns.";
        setError(errorMessage);
        toast.error("Error", { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, [debouncedSearch, selectedCategory, sortOption]);

  const filteredAndSortedCampaigns = campaigns;

  const indexOfLastCampaign = currentPage * campaignsPerPage;
  const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
  const currentCampaigns = filteredAndSortedCampaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);
  const totalPages = Math.ceil(filteredAndSortedCampaigns.length / campaignsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setSortOption("newest");
    setCurrentPage(1);
  };

  const sortLabel = SORT_OPTIONS.find(o => o.value === sortOption)?.label || "Newest";
  const hasActiveFilters = !!debouncedSearch || !!selectedCategory || sortOption !== "newest";

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-12">
          <div className="space-y-4 mb-12">
            <div className="h-12 bg-gray-100 rounded-lg w-1/4 animate-pulse"></div>
            <div className="h-6 bg-gray-100 rounded-lg w-1/2 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-gray-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-emerald-600">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-emerald-50/50 py-16 border-b border-emerald-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-6">
              <Sparkles size={14} />
              DISCOVER CAUSES
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              Support what <span className="text-emerald-600 underline decoration-emerald-200">matters</span> to you.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Join thousands of people making a real impact in Nepal. Browse through
              verified campaigns and help change lives today.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by title, cause, or keywords..."
                  className="pl-12 h-14 bg-white border-gray-200 rounded-2xl shadow-sm focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(""); setDebouncedSearch(""); setCurrentPage(1); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-14 px-6 border-gray-200 rounded-2xl bg-white shadow-sm font-bold flex gap-2">
                    <ListFilter size={18} />
                    {sortLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                  <DropdownMenuLabel className="text-xs uppercase text-gray-400">Sort by</DropdownMenuLabel>
                  {SORT_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => { setSortOption(opt.value); setCurrentPage(1); }}
                      className="rounded-lg"
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <div className="container mx-auto px-6 pt-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedCategory(""); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {CAMPAIGN_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setSelectedCategory(selectedCategory === cat.value ? "" : cat.value); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.value
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory
                ? CAMPAIGN_CATEGORIES.find(c => c.value === selectedCategory)?.label + " Campaigns"
                : "Active Campaigns"}
            </h2>
            <p className="text-gray-500">Showing {filteredAndSortedCampaigns.length} results</p>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-emerald-600">
              <X size={14} className="mr-1" /> Clear filters
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : currentCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {currentCampaigns.map((campaign) => (
              <div key={campaign.id} className="transition-transform duration-300 hover:-translate-y-2">
                <CampaignCard campaign={campaign} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No campaigns found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms or filters.</p>
            <Button
              variant="link"
              onClick={clearFilters}
              className="mt-4 text-emerald-600 font-bold"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-20 border-t pt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                    className={currentPage === 1 ? "pointer-events-none opacity-30" : "hover:bg-emerald-50"}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                      className={currentPage === i + 1 ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:text-white" : "hover:bg-emerald-50"}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-30" : "hover:bg-emerald-50"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
};

export default CampaignsPage;
