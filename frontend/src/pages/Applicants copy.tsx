import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
// Assuming useToast is imported from a shadcn component structure
import { useToast } from "@/hooks/use-toast";

// ===================================================
// ⭐ 1. TYPES AND ROBUST STYLING/ICON HELPER FUNCTION
// ===================================================

// Define the available standard variants
type BadgeVariant = "default" | "destructive" | "outline";
type ApplicantStatus = "selected" | "not-selected" | "future-select" | "pending";

interface StatusVisuals {
  icon: React.ElementType; // Lucide icon component
  iconClassName: string; // Tailwind class for icon color
  variant: BadgeVariant;
  badgeClassName?: string; // Tailwind classes for badge colors
}

/**
 * Returns the necessary variant, custom Tailwind classes, and the icon for the status.
 */
const getStatusVisuals = (
  status: ApplicantStatus | string
): StatusVisuals => {
  // Ensure the status is clean and lowercase for reliable matching
  const normalizedStatus = (status || "pending").toLowerCase().trim();

  switch (normalizedStatus) {
    case "selected":
      return {
        icon: CheckCircle,
        iconClassName: "text-green-500",
        variant: "default",
        badgeClassName: "bg-green-500 hover:bg-green-600 text-white border-transparent",
      };

    case "future-select":
      return {
        icon: Star,
        iconClassName: "text-blue-500",
        variant: "default",
        badgeClassName: "bg-blue-500 hover:bg-blue-600 text-white border-transparent",
      };

    case "not-selected":
      return {
        icon: XCircle,
        iconClassName: "text-red-500",
        variant: "destructive",
        badgeClassName: "bg-red-500 hover:bg-red-600 text-white border-transparent",
      };

    case "pending":
    default:
      return {
        icon: Clock,
        iconClassName: "text-gray-500",
        variant: "outline",
      };
  }
};

// ⭐ GET applicants from backend API
async function getApplicants() {
  const res = await fetch("http://localhost:4000/api/applicants");

  if (!res.ok) throw new Error("Failed to fetch applicants");

  return res.json(); // returns array
}

// ⭐ DELETE applicant from backend API
async function deleteApplicant(id: string) {
  const res = await fetch(`http://localhost:4000/api/applicants/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      throw new Error("Invalid server error");
    }
    throw new Error(errorData?.message || "Failed to delete applicant");
  }
  return res.json();
}

// ===================================================
// ⭐ 2. MAIN COMPONENT
// ===================================================
export default function Applicants() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for the custom Delete Confirmation Dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    applicantId: "",
    applicantName: "",
  });

  // ⭐ Fetch applicants
  const { data, isLoading } = useQuery({
    queryKey: ["applicants"],
    queryFn: getApplicants,
  });

  // ⭐ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteApplicant,
    onSuccess: (data, variables) => {
      // Show success notification with the applicant's name
      toast({
        title: "Deletion Successful",
        description: `${deleteDialog.applicantName} has been permanently removed.`,
      });

      // Invalidate the query to force a data refresh
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      setDeleteDialog({ open: false, applicantId: "", applicantName: "" });
    },
    onError: (error: any) => {
      // Show error notification
      toast({
        title: "Error Deleting Applicant",
        description: error.message || "Failed to delete applicant due to a network error.",
        variant: "destructive",
      });
      setDeleteDialog({ open: false, applicantId: "", applicantName: "" });
    },
  });

  const applicants = data || [];

  // Function to open the custom delete dialog
  const openDeleteConfirmation = (id: string, name: string) => {
    setDeleteDialog({
      open: true,
      applicantId: id,
      applicantName: name,
    });
  };

  // Function to execute the delete mutation
  const confirmDelete = () => {
    if (deleteDialog.applicantId) {
      deleteMutation.mutate(deleteDialog.applicantId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applicants</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track applicant records
          </p>
        </div>

        <Button onClick={() => navigate("/applicants/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Applicant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applicants</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>NIC</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : applicants.length > 0 ? (
                  applicants.map((applicant: any) => {
                    const visuals = getStatusVisuals(applicant.status);
                    const IconComponent = visuals.icon;

                    return (
                      <TableRow key={applicant._id}>
                        <TableCell className="font-medium">
                          {applicant.name}
                        </TableCell>

                        <TableCell>{applicant.nicNumber || "-"}</TableCell>
                        <TableCell>{applicant.phone || "-"}</TableCell>
                        <TableCell>{applicant.position || "-"}</TableCell>

                        <TableCell>
                          {applicant.totalMarks ?? 0}/50
                        </TableCell>

                        {/* ⭐ RENDER ICON AND BADGE TOGETHER */}
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <IconComponent
                              className={`h-4 w-4 ${visuals.iconClassName}`}
                            />
                            <Badge
                              variant={visuals.variant as any}
                              className={`capitalize ${visuals.badgeClassName}`}
                            >
                              {applicant.status || "Pending"}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell>{applicant.createdByName || "-"}</TableCell>

                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/applicants/${applicant._id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(`/applicants/edit/${applicant._id}`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                openDeleteConfirmation(
                                  applicant._id,
                                  applicant.name
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No applicants found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ⭐ Custom Delete Confirmation Dialog (Modern Style) */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ ...deleteDialog, open })
        }
      >
        <DialogContent className="max-w-xs rounded-lg shadow-2xl">
          <DialogHeader className="items-center text-center pt-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mb-2 animate-pulse" />
            <DialogTitle className="text-xl font-extrabold text-red-700">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              Are you sure you want to permanently delete the applicant{" "}
              <span className="font-bold text-foreground">
                "{deleteDialog.applicantName}"
              </span>
              ? This action is irreversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-row gap-3 mt-4 w-full">
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ ...deleteDialog, open: false })
              }
              className="flex-1 transition-all duration-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 transition-all duration-300"
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}