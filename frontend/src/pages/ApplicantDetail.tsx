import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeft, Edit, Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/lib/api";
import { FaFileAlt, FaDownload } from "react-icons/fa";


/* ===================== TYPES ===================== */

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

/* ===================== HELPERS ===================== */

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1">{value || "N/A"}</p>
    </div>
  );
}

const BACKEND_URL = "https://hr-system-2bau.onrender.com";

/* ===================== COMPONENT ===================== */

export default function ApplicantDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const [applicant, setApplicant] = useState<ApiApplicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);

  /* ===================== FETCH ===================== */

  const fetchApplicant = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await authenticatedFetch(`/applicants/${id}`);
      if (!data.status) {
        data.status =
          data.overallResult === "Selected" ? "selected" : "pending";
      }
      setApplicant(data);
    } catch (error) {
      console.error(error);
      setApplicant(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplicant();
  }, [fetchApplicant]);

  /* ===================== ACTIONS ===================== */

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    if (!id) return;
    try {
      setExporting(true);
      const response = await fetch(
        `${BACKEND_URL}/api/applicants/report/pdf?id=${id}`,
        { credentials: "include" }
      );
      if (!response.ok) throw new Error("PDF export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${applicant?.name}-Interview-Report.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !applicant) return;
    setIsUpdating(true);
    try {
      await authenticatedFetch(`/applicants/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast({ title: "Success", description: "Status updated" });
      fetchApplicant();
    } catch {
      toast({
        title: "Error",
        description: "Status update failed",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  /* ===================== STATES ===================== */

  if (loading) return <p className="p-6">Loading applicant details...</p>;
  if (!applicant) return <p className="p-6">Applicant not found</p>;

  const marks = {
    punctuality: applicant.punctuality,
    preparedness: applicant.preparedness,
    communicationSkills: applicant.communicationSkills,
    experienceRequired: applicant.experienceRequired,
    qualificationRequired: applicant.qualificationRequired,
  };

  const totalMarks = Object.values(marks).reduce(
    (sum, m) => sum + (m || 0),
    0
  );

  const interviewers = [1, 2, 3]
    .map((i) => ({
      name: (applicant as any)[`interviewer${i}Name`],
      designation: (applicant as any)[`interviewer${i}Designation`],
      sign: (applicant as any)[`interviewer${i}Sign`],
      date: (applicant as any)[`interviewer${i}Date`],
    }))
    .filter((i) => i.name);

  const appointmentDetails = applicant.position
    ? {
        position: applicant.position,
        companyName: applicant.companyName,
        department: applicant.department,
        agreedSalary: applicant.agreedSalary,
        appointmentDate: applicant.appointmentDate,
        benefits: applicant.benefits,
      }
    : null;

  /* ===================== RENDER ===================== */

  return (
    <div ref={contentRef} className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate("/applicants")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{applicant.name}</h1>
          <p className="text-muted-foreground">
            {appointmentDetails?.position || "No position assigned"}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/applicants/edit/${id}`)}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
        <Button onClick={handleExportPdf} disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exporting..." : "Export PDF"}
        </Button>
      </div>

      {/* STATUS */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusBadge status={applicant.status} />
          <Select
            value={applicant.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="max-w-xs mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="selected">Selected</SelectItem>
              <SelectItem value="not-selected">Not Selected</SelectItem>
              <SelectItem value="future-select">Future Select</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs defaultValue="overview">
        <TabsList className="print:hidden">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="appointment">Appointment</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Info label="NIC" value={applicant.nicNumber} />
              <Info label="Phone" value={applicant.phone} />
              <Info label="Age" value={applicant.age} />
              <Info label="Hometown" value={applicant.hometown} />
              <Info label="Experience" value={applicant.experience} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scores</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(marks).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span>{k}</span>
                  <Badge>{v}/10</Badge>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <Badge>{totalMarks}/50</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CV */}
        {/* <TabsContent value="cv">
          <Card>
            <CardHeader>
              <CardTitle>CV</CardTitle>
            </CardHeader>
            <CardContent>
              {applicant.cvFile ? (
                <a
                  href={`${BACKEND_URL}/uploads/${applicant.cvFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Download CV
                </a>
              ) : (
                <p>No CV uploaded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent> */}
        <TabsContent value="cv">
  <Card className="border-muted shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        CV
      </CardTitle>
    </CardHeader>

    <CardContent className="flex items-center justify-center min-h-[120px]">
      {applicant.cvFile ? (
        <a
          href={`${BACKEND_URL}/uploads/${applicant.cvFile}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition"
        >
          <Download className="w-4 h-4" />
          Download CV
        </a>
      ) : (
        <div className="text-center text-muted-foreground text-sm flex flex-col items-center gap-1">
          <FileText className="w-6 h-6 text-muted-foreground" />
          <span>No CV uploaded</span>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>


        {/* INTERVIEW */}
        <TabsContent value="interview">
          {interviewers.length ? (
            interviewers.map((i, idx) => (
              <Card key={idx} className="mb-4">
                <CardHeader>
                  <CardTitle>Interviewer {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <Info label="Name" value={i.name} />
                  <Info label="Designation" value={i.designation} />
                  <Info label="Signature" value={i.sign} />
                  <Info label="Date" value={i.date} />
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No interview data</p>
          )}
        </TabsContent>

        {/* APPOINTMENT */}
        <TabsContent value="appointment">
          {appointmentDetails ? (
            <Card>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Info label="Position" value={appointmentDetails.position} />
                <Info label="Company" value={appointmentDetails.companyName} />
                <Info label="Department" value={appointmentDetails.department} />
                <Info
                  label="Salary"
                  value={
                    appointmentDetails.agreedSalary
                      ? `LKR ${appointmentDetails.agreedSalary.toLocaleString()}`
                      : "N/A"
                  }
                />
                <Info label="Date" value={appointmentDetails.appointmentDate} />
                <Info label="Benefits" value={appointmentDetails.benefits} />
              </CardContent>
            </Card>
          ) : (
            <p>No appointment details</p>
          )}
        </TabsContent>

        {/* AUDIT */}
        <TabsContent value="audit">
          <Card>
            <CardContent>
              <p>Created By: {applicant.createdByName}</p>
              <p>Created At: {new Date(applicant.createdAt).toLocaleString()}</p>
              <p>Status: {applicant.status}</p>
              <p>
                Last Updated:{" "}
                {new Date(applicant.updatedAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
