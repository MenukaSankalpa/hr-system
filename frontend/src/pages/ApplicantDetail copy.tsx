import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { mockApplicants } from '@/lib/mockApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ApplicantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In a real app, fetch applicant by ID
  const applicant = mockApplicants[0];

  if (!applicant) {
    return (
      <div className="p-6">
        <p>Applicant not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/applicants')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{applicant.name}</h1>
          <p className="text-muted-foreground mt-1">
            {applicant.appointmentDetails?.position || 'No position assigned'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/applicants/edit/${id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 mb-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={applicant.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-lg">
              {applicant.totalMarks}/50
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Created By</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{applicant.createdByName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Created At</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(applicant.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Change Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Select defaultValue={applicant.status}>
            <SelectTrigger className="w-full max-w-xs">
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="interview">Interview Notes</TabsTrigger>
          <TabsTrigger value="appointment">Appointment</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="mt-1">{applicant.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NIC Number</p>
                  <p className="mt-1">{applicant.nicNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="mt-1">{applicant.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="mt-1">{applicant.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hometown</p>
                  <p className="mt-1">{applicant.hometown}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p className="mt-1">{applicant.experience}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(applicant.marks).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant="outline">{value}/10</Badge>
                  </div>
                ))}
                <div className="pt-3 border-t flex items-center justify-between font-bold">
                  <span>Total Marks</span>
                  <Badge>{applicant.totalMarks}/50</Badge>
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
                <p className="text-sm">{applicant.comments}</p>
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

        <TabsContent value="cv">
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
        </TabsContent>

        <TabsContent value="interview">
          <Card>
            <CardHeader>
              <CardTitle>Interviewers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicant.interviewers.map((interviewer, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="mt-1">{interviewer.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Designation
                        </p>
                        <p className="mt-1">{interviewer.designation}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Signature
                        </p>
                        <p className="mt-1 font-signature text-lg">{interviewer.sign}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date</p>
                        <p className="mt-1">{interviewer.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointment">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {applicant.appointmentDetails ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Position</p>
                    <p className="mt-1">{applicant.appointmentDetails.position}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Company Name
                    </p>
                    <p className="mt-1">{applicant.appointmentDetails.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Department
                    </p>
                    <p className="mt-1">{applicant.appointmentDetails.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Agreed Salary
                    </p>
                    <p className="mt-1">
                      LKR {applicant.appointmentDetails.agreedSalary.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Appointment Date
                    </p>
                    <p className="mt-1">
                      {applicant.appointmentDetails.appointmentDate}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Benefits
                    </p>
                    <p className="text-sm">{applicant.appointmentDetails.benefits}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No appointment details available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                      <span className="font-medium">{applicant.createdByName}</span>{' '}
                      created this applicant
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(applicant.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="h-2 w-2 rounded-full bg-success mt-2" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">superadmin</span> changed status
                      to Selected
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(applicant.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
