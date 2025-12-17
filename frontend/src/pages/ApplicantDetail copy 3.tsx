import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react'; // ⭐ Import useRef
import { ArrowLeft, Edit, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast'; // ⭐ Assuming you have this toast hook

// ⚠️ NOTE: To make PDF export work, you must install these packages:
// npm install jspdf html2canvas

// Define the shape of the applicant data returned by the API (based on your Mongoose schema)
interface ApiApplicant {
    _id: string; // MongoDB ID
    name: string;
    nicNumber: string;
    phone: string;
    age: number;
    hometown: string;
    experience: string;
    comments: string;
    overallResult: string;
    status: 'selected' | 'not-selected' | 'future-select' | 'pending'; // MUST be present in fetched data
    
    // Evaluation Scores
    punctuality: number;
    preparedness: number;
    communicationSkills: number;
    experienceRequired: number;
    qualificationRequired: number;
    
    // Interviewers
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

    // Appointment Details
    appointmentDate?: string;
    position?: string;
    companyName?: string;
    department?: string;
    agreedSalary?: number;
    benefits?: string;

    // Audit
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

// Helper component for displaying Info
function Info({ label, value }: { label: string; value: any }) {
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1">{value || "N/A"}</p>
        </div>
    );
}

export default function ApplicantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast(); // ⭐ Use toast for feedback

    const [applicant, setApplicant] = useState<ApiApplicant | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [exporting, setExporting] = useState(false); // ⭐ New state for PDF export

    // ⭐ Ref to target the content area for PDF export and printing
    const contentRef = useRef<HTMLDivElement>(null);

    // --- Data Fetching (Wrapped in useCallback) ---
    const fetchApplicant = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:4000/api/applicants/${id}`); 
            
            if (!res.ok) {
                setApplicant(null);
                return;
            }
            const data: ApiApplicant = await res.json();
            
            // Default status if not explicitly set by the backend
            if (!data.status) {
                data.status = (data.overallResult === 'Selected' ? 'selected' : 'pending') as ApiApplicant['status'];
            }
            setApplicant(data);

        } catch (error) {
            console.error("Error fetching applicant:", error);
            setApplicant(null);
        } finally {
            setLoading(false);
        }
    }, [id]); // Dependency: id

    useEffect(() => {
        fetchApplicant();
    }, [fetchApplicant]); // Dependency: fetchApplicant

    // --- Status Update Handler ---
    const handleStatusChange = async (newStatus: string) => {
        if (!applicant) return;

        setIsUpdating(true);
        try {
            const res = await fetch(`http://localhost:4000/api/applicants/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }), 
            });

            if (res.ok) {
                toast({ title: "Success", description: `Status updated to ${newStatus}.` });
                // Success! Now, re-fetch the applicant data to refresh all fields in the UI
                await fetchApplicant(); 
            } else {
                console.error("Failed to update status on server. Response:", await res.text());
                toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast({ title: "Error", description: "Network error during status update.", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    // ===================================================
    // ⭐ PRINT LOGIC IMPLEMENTATION
    // ===================================================
    const handlePrint = () => {
        // The simplest way to print the entire page content
        window.print();
    };

    // ===================================================
    // ⭐ EXPORT PDF LOGIC IMPLEMENTATION (Requires Libraries)
    // ===================================================
    const handleExportPdf = async () => {
        if (!contentRef.current) return;

        setExporting(true);
        toast({ title: "Processing", description: "Generating PDF... this may take a moment." });

        try {
            // ⚠️ MOCK: Replace this try block with the actual library calls
            /*
            const input = contentRef.current;
            const canvas = await html2canvas(input);
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${applicant?.name || 'applicant'}_details.pdf`);
            */

            // --- MOCK IMPLEMENTATION (Remove after installing libs) ---
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            // --------------------------------------------------------

            toast({ 
                title: "Download Initiated", 
                description: `PDF export simulated for ${applicant?.name || 'Applicant'}`,
            });
            console.log(`PDF Export would trigger now for: ${applicant?.name}`);


        } catch (error) {
            console.error("Error exporting PDF:", error);
            toast({ title: "Error", description: "Failed to generate PDF. Check console.", variant: "destructive" });
        } finally {
            setExporting(false);
        }
    };


    // --- Data Mapping (to match original UI structure) ---
    if (applicant) {
        // 1. Map Evaluation Marks
        (applicant as any).marks = {
            punctuality: applicant.punctuality,
            preparedness: applicant.preparedness,
            communicationSkills: applicant.communicationSkills,
            experienceRequired: applicant.experienceRequired,
            qualificationRequired: applicant.qualificationRequired,
        };
        (applicant as any).totalMarks = Object.values((applicant as any).marks).reduce((sum: number, mark: number) => sum + (mark || 0), 0);

        // 2. Map Interviewers
        (applicant as any).interviewers = [];
        for (let i = 1; i <= 3; i++) {
            const name = (applicant as any)[`interviewer${i}Name`];
            if (name) {
                (applicant as any).interviewers.push({
                    name: name,
                    designation: (applicant as any)[`interviewer${i}Designation`],
                    sign: (applicant as any)[`interviewer${i}Sign`],
                    date: (applicant as any)[`interviewer${i}Date`],
                });
            }
        }

        // 3. Map Appointment Details
        (applicant as any).appointmentDetails = applicant.position ? {
            position: applicant.position,
            companyName: applicant.companyName,
            department: applicant.department,
            agreedSalary: applicant.agreedSalary,
            appointmentDate: applicant.appointmentDate,
            benefits: applicant.benefits,
        } : null;
    }
    
    // --- Loading/Error Handling UI ---
    if (loading) {
        return (
            <div className="p-6">
                <p>Loading applicant details...</p>
            </div>
        );
    }

    if (!applicant) {
        return (
            <div className="p-6">
                <p>Applicant not found</p>
            </div>
        );
    }


    // --- Main Render ---
    return (
      // ⭐ Assign the ref to the main content wrapper for export/print targeting
      <div className="p-6 max-w-6xl mx-auto" ref={contentRef}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/applicants")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{applicant.name}</h1>
            <p className="text-muted-foreground mt-1">
              {applicant.appointmentDetails?.position || "No position assigned"}
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {" "}
            {/* Hide buttons when printing */}
            <Button
              variant="outline"
              onClick={() => navigate(`/applicants/edit/${id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              {" "}
              {/* ⭐ Print button handler */}
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="default"
              onClick={handleExportPdf}
              disabled={exporting} // Disable during export
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export PDF"}{" "}
              {/* ⭐ PDF button handler */}
            </Button>
          </div>
        </div>

        {/* ... (Rest of the Cards/UI remains the same) ... */}

        {/* Status Cards */}
        <div className="grid gap-6 mb-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusBadge status={applicant.status || "pending"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-lg">
                {applicant.totalMarks || 0}/50
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Created By</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {applicant.createdByName || "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Created At</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {applicant.createdAt
                  ? new Date(applicant.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Change Status Card */}
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
            {isUpdating && (
              <p className="text-xs text-muted-foreground mt-2">Updating...</p>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="print:hidden">
            {" "}
            {/* Hide Tabs control when printing */}
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
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Info label="Name" value={applicant.name} />
                  <Info label="NIC Number" value={applicant.nicNumber} />
                  <Info label="Phone" value={applicant.phone} />
                  <Info label="Age" value={applicant.age} />
                  <Info label="Hometown" value={applicant.hometown} />
                  <Info label="Experience" value={applicant.experience} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evaluation Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries((applicant as any).marks).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <Badge variant="outline">{value || 0}/10</Badge>
                      </div>
                    )
                  )}
                  <div className="pt-3 border-t flex items-center justify-between font-bold">
                    <span>Total Marks</span>
                    <Badge>{applicant.totalMarks || 0}/50</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comments & Overall Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Comments
                  </p>
                  <p className="text-sm">{applicant.comments || "N/A"}</p>
                </div>
                {applicant.overallResult && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Overall Result
                    </p>
                    <Badge variant="secondary">{applicant.overallResult}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* End Overview Tab */}

          {/* CV Tab */}
          {
            /* <TabsContent value="cv">
                    <Card>
                        <CardHeader>
                            <CardTitle>CV Document</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                                <div className="text-center">
                                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-sm text-muted-foreground">
                                        No CV uploaded for this applicant
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent> */

            // <TabsContent value="cv">
            //   <Card>
            //     <CardHeader>
            //       <CardTitle>CV Document</CardTitle>
            //     </CardHeader>
            //     <CardContent>
            //       {applicant.cvFile ? (
            //         <div className="flex flex-col items-center justify-center p-6">
            //           <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            //           <p className="text-sm text-muted-foreground mb-2">
            //             Uploaded CV
            //           </p>
            //           <a
            //             href={`http://localhost:4000/uploads/${applicant.cvFile}`}
            //             target="_blank"
            //             rel="noopener noreferrer"
            //             className="text-blue-600 underline"
            //           >
            //             View / Download CV
            //           </a>
            //         </div>
            //       ) : (
            //         <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
            //           <div className="text-center">
            //             <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            //             <p className="text-sm text-muted-foreground">
            //               No CV uploaded for this applicant
            //             </p>
            //           </div>
            //         </div>
            //       )}
            //     </CardContent>
            //   </Card>
            // </TabsContent>

            <TabsContent value="cv">
  <Card>
    <CardHeader>
      <CardTitle>CV Document</CardTitle>
    </CardHeader>
    <CardContent>
      {applicant.cvFile ? (
        <div className="flex flex-col items-center justify-center gap-4 p-6 border rounded-lg border-dashed hover:border-blue-500 transition-colors duration-200">
          <FileText className="h-16 w-16 text-blue-500" />
          <p className="text-sm text-muted-foreground">Uploaded CV</p>
          <a
            href={`http://localhost:4000/uploads/${applicant.cvFile}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 shadow"
          >
            View / Download CV
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 p-12 border-2 border-dashed rounded-lg">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No CV uploaded for this applicant
          </p>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

          }
          {/* End CV Tab */}

          {/* Interview Tab */}
          <TabsContent value="interview">
            <Card>
              <CardHeader>
                <CardTitle>Interviewers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(applicant as any).interviewers.length > 0 ? (
                    (applicant as any).interviewers.map(
                      (interviewer: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="grid gap-3 md:grid-cols-2">
                            <Info label="Name" value={interviewer.name} />
                            <Info
                              label="Designation"
                              value={interviewer.designation}
                            />
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Signature
                              </p>
                              <p className="mt-1 font-signature text-lg">
                                {interviewer.sign || "N/A"}
                              </p>
                            </div>
                            <Info label="Date" value={interviewer.date} />
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No interview notes available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* End Interview Tab */}

          {/* Appointment Tab */}
          <TabsContent value="appointment">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent>
                {applicant.appointmentDetails ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Info
                        label="Position"
                        value={applicant.appointmentDetails.position}
                      />
                      <Info
                        label="Company Name"
                        value={applicant.appointmentDetails.companyName}
                      />
                      <Info
                        label="Department"
                        value={applicant.appointmentDetails.department}
                      />
                      <Info
                        label="Agreed Salary"
                        value={
                          applicant.appointmentDetails.agreedSalary
                            ? `LKR ${applicant.appointmentDetails.agreedSalary.toLocaleString()}`
                            : "N/A"
                        }
                      />
                      <Info
                        label="Appointment Date"
                        value={applicant.appointmentDetails.appointmentDate}
                      />
                    </div>
                    <div className="mt-4 md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Benefits
                      </p>
                      <p className="text-sm">
                        {applicant.appointmentDetails.benefits || "N/A"}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No appointment details available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* End Appointment Tab */}

          {/* Audit Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">
                          {applicant.createdByName || "System"}
                        </span>{" "}
                        created this applicant
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(applicant.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* This item will update after a successful patch/re-fetch */}
                  <div className="flex items-start gap-4 pb-4 border-b">
                    <div className="h-2 w-2 rounded-full bg-success mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        Status changed to{" "}
                        <span className="font-medium">
                          {applicant.status || "Pending"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(
                          applicant.updatedAt || applicant.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* End Audit Tab */}
        </Tabs>
      </div>
    );
}