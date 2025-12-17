import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, Edit, Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/lib/api";

interface ApiApplicant {
  _id: string;
  name: string;
  nicNumber: string;
  phone: string;
  age: number;
  hometown: string;
  experience: string;
  comments: string;
  overallResult: string;
  status: "selected" | "not-selected" | "future-select" | "pending";
  punctuality: number;
  preparedness: number;
  communicationSkills: number;
  experienceRequired: number;
  qualificationRequired: number;
  interviewer1Name?: string;
  interviewer1Designation?: string;
  interviewer1Sign?: string;
  interviewer1Date?: string;
  interviewer2Name?: string;
  interviewer2Designation?: string;
  interviewer2Sign?: string;
  interviewer2Date?: string;
  interviewer3Name?: string;
  interviewer3Designation?: string;
  interviewer3Sign?: string;
  interviewer3Date?: string;
  appointmentDate?: string;
  position?: string;
  companyName?: string;
  department?: string;
  agreedSalary?: number;
  benefits?: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  cvFile?: string;
}

// Helper Component
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1">{value || "N/A"}</p>
    </div>
  );
}

// Status visuals helper
const getStatusVisuals = (status: string) => {
  const s = (status || "pending").toLowerCase().trim();
  switch (s) {
    case "selected": return { iconClassName: "text-green-500", badgeClassName: "bg-green-500 text-white" };
    case "not-selected": return { iconClassName: "text-red-500", badgeClassName: "bg-red-500 text-white" };
    case "future-select": return { iconClassName: "text-blue-500", badgeClassName: "bg-blue-500 text-white" };
    case "pending": default: return { iconClassName: "text-gray-500", badgeClassName: "bg-gray-100 text-gray-800" };
  }
};

export default function ApplicantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const [applicant, setApplicant] = useState<ApiApplicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch single applicant
  const fetchApplicant = useCallback(async () => {
    setLoading(true);
    try {
      const data: ApiApplicant = await authenticatedFetch(`/applicants/${id}`);
      if (!data.status) data.status = data.overallResult === "Selected" ? "selected" : "pending";
      setApplicant(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch applicant", variant: "destructive" });
      setApplicant(null);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchApplicant();
  }, [fetchApplicant]);

  const handleStatusChange = async (newStatus: string) => {
    if (!applicant) return;
    setIsUpdating(true);
    try {
      await authenticatedFetch(`/applicants/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast({ title: "Success", description: `Status updated to ${newStatus}` });
      fetchApplicant();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Status update failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => window.print();
  const handleExportPdf = () => toast({ title: "Info", description: "PDF export coming soon" });

  if (loading) return <p className="p-6">Loading applicant details...</p>;
  if (!applicant) return <p className="p-6">Applicant not found</p>;

  // Marks calculation
  const marks = {
    punctuality: applicant.punctuality,
    preparedness: applicant.preparedness,
    communicationSkills: applicant.communicationSkills,
    experienceRequired: applicant.experienceRequired,
    qualificationRequired: applicant.qualificationRequired,
  };
  const totalMarks = Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0);

  // Interviewers
  const interviewers = [1,2,3].map(i => ({
    name: applicant[`interviewer${i}Name`],
    designation: applicant[`interviewer${i}Designation`],
    sign: applicant[`interviewer${i}Sign`],
    date: applicant[`interviewer${i}Date`],
  })).filter(x => x.name);

  return (
    <div className="p-6 max-w-6xl mx-auto" ref={contentRef}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/applicants")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{applicant.name}</h1>
          <p className="text-muted-foreground mt-1">{applicant.position || "No position assigned"}</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={() => navigate(`/applicants/edit/${id}`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="default" onClick={handleExportPdf}>
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Status & Total Marks */}
      <div className="grid gap-6 mb-6 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent>
            <Badge className={getStatusVisuals(applicant.status).badgeClassName}>{applicant.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Marks</CardTitle></CardHeader>
          <CardContent><Badge variant="outline">{totalMarks}/50</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Created By</CardTitle></CardHeader>
          <CardContent>{applicant.createdByName}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Created At</CardTitle></CardHeader>
          <CardContent>{new Date(applicant.createdAt).toLocaleDateString()}</CardContent>
        </Card>
      </div>

      {/* Change Status */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Change Status</CardTitle></CardHeader>
        <CardContent>
          <Select defaultValue={applicant.status} onValueChange={handleStatusChange} disabled={isUpdating}>
            <SelectTrigger className="w-full max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="selected">Selected</SelectItem>
              <SelectItem value="not-selected">Not Selected</SelectItem>
              <SelectItem value="future-select">Future Select</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="print:hidden">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="interview">Interview Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Info label="Name" value={applicant.name} />
              <Info label="NIC" value={applicant.nicNumber} />
              <Info label="Phone" value={applicant.phone} />
              <Info label="Age" value={applicant.age} />
              <Info label="Hometown" value={applicant.hometown} />
              <Info label="Experience" value={applicant.experience} />
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle>Comments & Result</CardTitle></CardHeader>
            <CardContent>
              <Info label="Comments" value={applicant.comments} />
              {applicant.overallResult && <Badge variant="secondary">{applicant.overallResult}</Badge>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cv">
          <Card><CardHeader><CardTitle>CV Document</CardTitle></CardHeader>
            <CardContent>
              {applicant.cvFile ? (
                <a
                  href={`${import.meta.env.VITE_API_URL}/uploads/${applicant.cvFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View / Download CV
                </a>
              ) : (
                <p>No CV uploaded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview">
          {interviewers.length > 0 ? interviewers.map((i, idx) => (
            <Card key={idx} className="mb-4">
              <CardHeader><CardTitle>Interview {idx+1}</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Info label="Name" value={i.name} />
                <Info label="Designation" value={i.designation} />
                <Info label="Signature" value={i.sign} />
                <Info label="Date" value={i.date} />
              </CardContent>
            </Card>
          )) : <p>No interview notes</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
