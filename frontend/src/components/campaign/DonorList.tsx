import { useEffect, useState } from "react";
import { getCampaignDonors } from "../../services/donation.service";
import type { Donor } from "../../types/donation.types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

interface DonorListProps {
  campaignId: string;
}

const DonorList = ({ campaignId }: DonorListProps) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDonors, setTotalDonors] = useState(0);
  const limit = 5;

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      try {
        const response = await getCampaignDonors(campaignId, currentPage, limit);
        setDonors(response.donors);
        setTotalPages(response.totalPages);
        setTotalDonors(response.totalDonors);
      } catch (error) {
        console.error("Error fetching campaign donors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [campaignId, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">Top Donors</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 shadow-sm">
<CardHeader className="border-b border-gray-100">
<div className="flex items-center justify-between">
<CardTitle className="text-xl">Top Donors</CardTitle>
<span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
{totalDonors} {totalDonors === 1 ? 'Donor' : 'Donors'}
</span>
</div>
</CardHeader>
<CardContent className="pt-6">
{donors.length === 0 ? (
<div className="text-center py-8">
<Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
<p className="text-gray-600">No donations yet</p>
<p className="text-sm text-gray-500 mt-1">Be the first to support this campaign!</p>
</div>
) : (
<div className="space-y-4">
<div className="overflow-hidden border border-gray-200 rounded-lg">
<Table>
<TableHeader>
<TableRow className="bg-gray-50">
<TableHead className="font-semibold text-gray-700">Donor</TableHead>
<TableHead className="text-right font-semibold text-gray-700">Amount</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{donors.map((donor, index) => (
<TableRow
key={donor.id}
className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
>
<TableCell className="font-medium text-gray-900">
<div className="flex items-center gap-2">
<div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
<span className="text-emerald-700 font-semibold text-sm">
{donor.donorName.charAt(0).toUpperCase()}
</span>
</div>
{donor.donorName}
</div>
</TableCell>
<TableCell className="text-right font-semibold text-emerald-600">
Rs. {parseFloat(donor.amount.toString()).toFixed(2)}
</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    )}
  </CardContent>
</Card>
);
};
export default DonorList;