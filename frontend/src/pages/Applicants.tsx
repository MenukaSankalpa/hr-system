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
import { useToast } from "@/hooks/use-toast";

// ⭐ Replace this with your actual Render URL
const API_BASE_URL = "https://backendhr-1-rxgk.onrender.com/api";

type BadgeVariant = "default" | "destructive" | "outline";
type ApplicantStatus = "selected" | "not-selected" | "future-select" | "pending";

interface StatusVisuals {
  icon: React.ElementType;
  iconClassName: string;
  variant: BadgeVariant;
  badgeClassName?: string;
}

const getStatusVisuals = (status: ApplicantStatus | string): StatusVisuals => {
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
    default:
      return {
        icon: Clock,
        iconClassName: "text-gray-500",
        variant: "outline",
      };
  }
};

// ⭐ API FETCH FUNCTIONS
async function getApplicants() {
  const res = await fetch(`${API_BASE_URL}/applicants`);
  if (!res.ok) throw new Error("Failed to fetch applicants");
  return res.json();
}

async function deleteApplicant(id: string) {
  const res = await fetch(`${API_BASE_URL}/applicants/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Failed to delete applicant");
  }
  return res.json();
}

export default function Applicants() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    applicantId: "",
    applicantName: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["applicants"],
    queryFn: getApplicants,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplicant,
    onSuccess: () => {
      toast({
        title: "Deletion Successful",
        description: `${deleteDialog.applicantName} has been removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      setDeleteDialog({ open: false, applicantId: "", applicantName: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Applicant",
        description: error.message,
        variant: "destructive",
      });
      setDeleteDialog({ ...deleteDialog, open: false });
    },
  });

  const applicants = data || [];

  const openDeleteConfirmation = (id: string, name: string) => {
    setDeleteDialog({ open: true, applicantId: id, applicantName: name });
  };

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
          <p className="text-muted-foreground mt-1">Manage applicant records</p>
        </div>
        <Button onClick={() => navigate("/applicants/new")}>
          <Plus className="h-4 w-4 mr-2" /> Add Applicant
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Applicants</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>NIC</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : applicants.length > 0 ? (
                  applicants.map((applicant: any) => {
                    const visuals = getStatusVisuals(applicant.status);
                    const IconComponent = visuals.icon;
                    return (
                      <TableRow key={applicant._id}>
                        <TableCell className="font-medium">{applicant.name}</TableCell>
                        <TableCell>{applicant.nicNumber || "-"}</TableCell>
                        <TableCell>{applicant.phone || "-"}</TableCell>
                        <TableCell>{applicant.position || "-"}</TableCell>
                        <TableCell>{applicant.totalMarks ?? 0}/50</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <IconComponent className={`h-4 w-4 ${visuals.iconClassName}`} />
                            <Badge variant={visuals.variant as any} className={`capitalize ${visuals.badgeClassName}`}>
                              {applicant.status || "Pending"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/applicants/${applicant._id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/applicants/edit/${applicant._id}`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDeleteConfirmation(applicant._id, applicant.name)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">No applicants found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="max-w-xs">
          <DialogHeader className="items-center text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Delete <span className="font-bold">"{deleteDialog.applicantName}"</span>? This is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialog({ ...deleteDialog, open: false })} className="flex-1">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending} className="flex-1">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}