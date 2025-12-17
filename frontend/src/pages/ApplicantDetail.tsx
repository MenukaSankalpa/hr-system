import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, Edit, Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
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

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1">{value || "N/A"}</p>
    </div>
  );
}

export default function ApplicantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [applicant, setApplicant] = useState<ApiApplicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchApplicant = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authenticatedFetch(`/applicants/${id}`);
      if (!data.status) data.status = data.overallResult === "Selected" ? "selected" : "pending";
      setApplicant(data);
    } catch (err) {
      console.error(err);
      setApplicant(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

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
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Status update failed", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => window.print();
  const handleExportPdf = async () => {
    toast({ title: "Info", description: "PDF export feature coming soon" });
  };

  if (loading) return <p className="p-6">Loading applicant details...</p>;
  if (!applicant) return <p className="p-6">Applicant not found</p>;

  // Prepare marks & interviewers
  (applicant as any).marks = {
    punctuality: applicant.punctuality,
    preparedness: applicant.preparedness,
    communicationSkills: applicant.communicationSkills,
    experienceRequired: applicant.experienceRequired,
    qualificationRequired: applicant.qualificationRequired,
  };
  (applicant as any).totalMarks = Object.values((applicant as any).marks).reduce(
    (sum: number, mark: number) => sum + (mark || 0),
    0
  );
  (applicant as any).interviewers = [];
  for (let i = 1; i <= 3; i++) {
    const name = (applicant as any)[`interviewer${i}Name`];
    if (name) {
      (applicant as any).interviewers.push({
        name,
        designation: (applicant as any)[`interviewer${i}Designation`],
        sign: (applicant as any)[`interviewer${i}Sign`],
        date: (applicant as any)[`interviewer${i}Date`],
      });
    }
  }
  (applicant as any).appointmentDetails = applicant.position
    ? {
        position: applicant.position,
        companyName: applicant.companyName,
        department: applicant.department,
        agreedSalary: applicant.agreedSalary,
        appointmentDate: applicant.appointmentDate,
        benefits: applicant.benefits,
      }
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto" ref={contentRef}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/applicants")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{applicant.name}</h1>
          <p className="text-muted-foreground mt-1">
            {applicant.appointmentDetails?.position || "No position assigned"}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" onClick={() => navigate(`/applicants/edit/${id}`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="default" onClick={handleExportPdf} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Status & Total Marks */}
      <div className="grid gap-6 mb-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={applicant.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Total Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{(applicant as any).totalMarks}/50</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Created By</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{applicant.createdByName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Created At</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{new Date(applicant.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Change Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Change Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            defaultValue={applicant.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="selected">Selected</SelectItem>
              <SelectItem value="not-selected">Not Selected</SelectItem>
              <SelectItem value="future-select">Future Select</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          {isUpdating && <p className="text-xs text-muted-foreground mt-2">Updating...</p>}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="print:hidden">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="interview">Interview Notes</TabsTrigger>
          <TabsTrigger value="appointment">Appointment</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Info label="Name" value={applicant.name} />
              <Info label="NIC Number" value={applicant.nicNumber} />
              <Info label="Phone" value={applicant.phone} />
              <Info label="Age" value={applicant.age} />
              <Info label="Hometown" value={applicant.hometown} />
              <Info label="Experience" value={applicant.experience} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries((applicant as any).marks).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <Badge variant="outline">{value}/10</Badge>
                </div>
              ))}
              <div className="pt-3 border-t flex items-center justify-between font-bold">
                <span>Total Marks</span>
                <Badge>{(applicant as any).totalMarks}/50</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments & Overall Result</CardTitle>
            </CardHeader>
            <CardContent>
              <Info label="Comments" value={applicant.comments} />
              {applicant.overallResult && <Badge variant="secondary">{applicant.overallResult}</Badge>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CV Tab */}
        <TabsContent value="cv">
          <Card>
            <CardHeader>
              <CardTitle>CV Document</CardTitle>
            </CardHeader>
            <CardContent>
              {applicant.cvFile ? (
                <div className="flex flex-col items-center gap-4 p-6 border rounded-lg border-dashed hover:border-blue-500">
                  <FileText className="h-16 w-16 text-blue-500" />
                  <p>Uploaded CV</p>
                  <a
                    href={`${import.meta.env.VITE_API_URL}/uploads/${applicant.cvFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View / Download CV
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                  <p>No CV uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interview Tab */}
        <TabsContent value="interview">
          {(applicant as any).interviewers.length > 0 ? (
            (applicant as any).interviewers.map((interviewer: any, idx: number) => (
              <Card key={idx} className="mb-4">
                <CardHeader>
                  <CardTitle>Interview {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <Info label="Name" value={interviewer.name} />
                  <Info label="Designation" value={interviewer.designation} />
                  <Info label="Signature" value={interviewer.sign} />
                  <Info label="Date" value={interviewer.date} />
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No interview notes available</p>
          )}
        </TabsContent>

        {/* Appointment Tab */}
        <TabsContent value="appointment">
          {applicant.appointmentDetails ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Position" value={applicant.appointmentDetails.position} />
              <Info label="Company" value={applicant.appointmentDetails.companyName} />
              <Info label="Department" value={applicant.appointmentDetails.department} />
              <Info
                label="Salary"
                value={
                  applicant.appointmentDetails.agreedSalary
                    ? `LKR ${applicant.appointmentDetails.agreedSalary.toLocaleString()}`
                    : "N/A"
                }
              />
              <Info label="Date" value={applicant.appointmentDetails.appointmentDate} />
              <Info label="Benefits" value={applicant.appointmentDetails.benefits} />
            </div>
          ) : (
            <p>No appointment details</p>
          )}
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Created By: {applicant.createdByName}</p>
              <p>Created At: {new Date(applicant.createdAt).toLocaleString()}</p>
              <p>Status: {applicant.status}</p>
              <p>Last Updated: {new Date(applicant.updatedAt || applicant.createdAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
