// frontend/src/components/campaign/DonorList.tsx
import { useEffect, useState } from "react";
import { getCampaignDonors } from "../../services/donation.service";
import { Donor } from "../../types/donation.types";
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
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DonorListProps {
  campaignId: string;
}

const DonorList = ({ campaignId }: DonorListProps) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDonors, setTotalDonors] = useState(0);
  const limit = 5; // Number of donors per page

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
    return <p>Loading donors...</p>;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Top Donors ({totalDonors})</CardTitle>
      </CardHeader>
      <CardContent>
        {donors.length === 0 ? (
          <p>No donations yet.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell className="font-medium">{donor.donorName}</TableCell>
                    <TableCell className="text-right">${parseFloat(donor.amount.toString()).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DonorList;