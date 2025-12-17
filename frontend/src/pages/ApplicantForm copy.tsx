import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// 1. UPDATED ZOD SCHEMA: Added totalMarks field
const applicantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hometown: z.string().optional(),
  age: z.number().optional(),
  employeeStatus: z.string().optional(),
  familyDetails: z.string().optional(),
  reasonForLeaving: z.string().optional(),
  experience: z.string().optional(),
  phone: z.string().optional(),
  nicNumber: z.string().optional(),
  // Marks fields (0-10)
  punctuality: z.number().min(0).max(10).default(0),
  preparedness: z.number().min(0).max(10).default(0),
  communicationSkills: z.number().min(0).max(10).default(0),
  experienceRequired: z.number().min(0).max(10).default(0),
  qualificationRequired: z.number().min(0).max(10).default(0),
  // Calculated field
  totalMarks: z.number().min(0).max(50).default(0), // New field for total marks
  comments: z.string().optional(),
  noticePeriod: z.string().optional(),
  // Salary fields
  presentSalary: z.number().optional(),
  expectedSalary: z.number().optional(),
  possibleStartDate: z.string().optional(),
  overallResult: z.string().optional(),
  interviewer1Name: z.string().optional(),
  interviewer1Designation: z.string().optional(),
  interviewer1Sign: z.string().optional(),
  interviewer1Date: z.string().optional(),
  interviewer2Name: z.string().optional(),
  interviewer2Designation: z.string().optional(),
  interviewer2Sign: z.string().optional(),
  interviewer2Date: z.string().optional(),
  interviewer3Name: z.string().optional(),
  interviewer3Designation: z.string().optional(),
  interviewer3Sign: z.string().optional(),
  interviewer3Date: z.string().optional(),
  appointmentDate: z.string().optional(),
  position: z.string().optional(),
  companyName: z.string().optional(),
  department: z.string().optional(),
  agreedSalary: z.number().optional(),
  benefits: z.string().optional(),
});

type ApplicantFormData = z.infer<typeof applicantSchema>;

export default function ApplicantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [cvFile, setCvFile] = useState<File | null>(null);

  const form = useForm<ApplicantFormData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      name: '',
      punctuality: 0,
      preparedness: 0,
      communicationSkills: 0,
      experienceRequired: 0,
      qualificationRequired: 0,
      totalMarks: 0, // Set initial value
    },
  });

  // Watch the five scoring fields
  const watchedMarks = form.watch([
    'punctuality',
    'preparedness',
    'communicationSkills',
    'experienceRequired',
    'qualificationRequired',
  ]);

  // Calculate the sum of watched marks
  const calculatedTotalMarks =
    (watchedMarks[0] || 0) +
    (watchedMarks[1] || 0) +
    (watchedMarks[2] || 0) +
    (watchedMarks[3] || 0) +
    (watchedMarks[4] || 0);

  // Read the current totalMarks value from form state for display
  const totalMarksFromFormState = form.watch('totalMarks');

  // 2. useEffect to calculate and set totalMarks in the form state
  useEffect(() => {
    // Only update if the calculated value differs from the current form value
    if (calculatedTotalMarks !== totalMarksFromFormState) {
        form.setValue('totalMarks', calculatedTotalMarks, { shouldValidate: true });
    }
  }, [calculatedTotalMarks, form, totalMarksFromFormState]);


  // 3. REVISED onSubmit function for FormData
  const onSubmit = async (data: ApplicantFormData) => {
    try {
      const formData = new FormData();

      // Add all text and numeric fields. Number fields must be converted to string.
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert numbers to string explicitly for FormData
          const stringValue = typeof value === 'number' ? String(value) : value;
          formData.append(key, stringValue);
        }
      });

      // Add CV file
      if (cvFile) {
        formData.append("cvFile", cvFile);
      }

      const url = id
        ? `http://localhost:4000/api/applicants/${id}`
        : "http://localhost:4000/api/applicants";

      const response = await fetch(url, {
        method: id ? "PUT" : "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Error saving applicant");
      }

      toast({
        title: "Success",
        description: id
          ? "Applicant updated successfully"
          : "Applicant created successfully",
      });

      navigate("/applicants");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/applicants')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {id ? 'Edit Applicant' : 'Add New Applicant'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Fill in the applicant information below
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nicNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIC Number</FormLabel>
                        <FormControl>
                          <Input placeholder="199512345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hometown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hometown</FormLabel>
                        <FormControl>
                          <Input placeholder="Colombo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="28"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+94771234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employeeStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="familyDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Married with two children..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <Input placeholder="5 years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reasonForLeaving"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Leaving</FormLabel>
                        <FormControl>
                          <Input placeholder="Career growth" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>


          {/* Marks & Scoring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Marks & Scoring</CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-lg">
                      {/* Display the calculated total marks */}
                      Total: {calculatedTotalMarks}/50
                    </Badge>
                  </div>
                </div>
                <Progress value={(calculatedTotalMarks / 50) * 100} className="mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="punctuality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Punctuality (0-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            // Ensure the field value is set correctly for number type
                            value={field.value || ''} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preparedness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preparedness (0-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communicationSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Skills (0-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experienceRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Required (0-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualificationRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualification Required (0-10)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* HIDDEN Field for totalMarks - it's included in data now */}
                  <FormField
                    control={form.control}
                    name="totalMarks"
                    render={() => <FormItem className="hidden" />}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about the candidate..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="overallResult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Result</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MEETS JOB REQUIREMENT">
                            Meets Job Requirement
                          </SelectItem>
                          <SelectItem value="DOES NOT MEET JOB REQUIREMENT">
                            Does Not Meet Job Requirement
                          </SelectItem>
                          <SelectItem value="OVER QUALIFIED FOR THE JOB">
                            Over Qualified for the Job
                          </SelectItem>
                          <SelectItem value="SUITABLE FOR ANOTHER POSITION">
                            Suitable for Another Position
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>


          {/* Salary & Notice Period */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Salary & Notice Period</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="presentSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Present Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="80000"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120000"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="noticePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notice Period</FormLabel>
                        <FormControl>
                          <Input placeholder="1 month" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="possibleStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Possible Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>


          {/* Interviewers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Interviewers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">Interviewer {num}</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`interviewer${num}Name` as keyof ApplicantFormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`interviewer${num}Designation` as keyof ApplicantFormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Designation</FormLabel>
                            <FormControl>
                              <Input placeholder="HR Manager" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`interviewer${num}Sign` as keyof ApplicantFormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Signature</FormLabel>
                            <FormControl>
                              <Input placeholder="JS" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`interviewer${num}Date` as keyof ApplicantFormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>


          {/* Appointment Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Developer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Tech Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Engineering" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreedSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agreed Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120000"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Health insurance, Annual bonus, Remote work flexibility..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>



          {/* CV Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>CV Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop or click to upload CV (PDF, DOC, DOCX)
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCvFile(file);
                          toast({
                            title: 'File uploaded',
                            description: file.name,
                          });
                        }
                      }}
                    />
                  </div>
                  {cvFile && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">{cvFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCvFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          
          {/* Action Buttons */}
          <div className="flex items-center gap-4 sticky bottom-0 bg-background/95 backdrop-blur p-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/applicants')}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {id ? 'Update Applicant' : 'Save Applicant'}
            </Button>
          </div>1
        </form>
      </Form>
    </div>
  );
}