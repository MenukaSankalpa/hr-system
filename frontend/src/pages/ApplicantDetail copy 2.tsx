import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

export default function ApplicantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/applicants/${id}`);
        if (!res.ok) {
          setApplicant(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setApplicant(data);
      } catch (error) {
        console.error("Error fetching applicant:", error);
        setApplicant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading...</p>
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
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
            <p className="text-sm font-medium">{applicant.createdByName || "N/A"}</p>
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="interview">Interview Notes</TabsTrigger>
          <TabsTrigger value="appointment">Appointment</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Overview */}
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
        </TabsContent>

        {/* CV */}
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

        {/* Appointment */}
        <TabsContent value="appointment">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {applicant.appointmentDetails ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Info label="Position" value={applicant.appointmentDetails.position} />
                  <Info label="Company Name" value={applicant.appointmentDetails.companyName} />
                  <Info label="Department" value={applicant.appointmentDetails.department} />
                  <Info label="Agreed Salary" value={applicant.appointmentDetails.agreedSalary} />
                  <Info label="Appointment Date" value={applicant.appointmentDetails.appointmentDate} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No appointment details available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1">{value || "N/A"}</p>
    </div>
  );
}
