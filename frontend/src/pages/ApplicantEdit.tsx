import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ArrowLeft, Save } from "lucide-react";
import { motion } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface Applicant {
  name: string;
  hometown: string;
  age: number;
  employeeStatus: string;
  familyDetails: string;
  reasonForLeaving: string;
  experience: string;
  phone: string;
  nicNumber: string;

  comments: string;
  noticePeriod: string;
  presentSalary: number;
  expectedSalary: number;
  possibleStartDate: string;
  overallResult: string;

  appointmentDate: string;
  position: string;
  companyName: string;
  department: string;
  agreedSalary: number;
  benefits: string;
}

// -------- API --------
const fetchApplicant = async (id: string) => {
  const res = await fetch(`http://localhost:4000/api/applicants/${id}`);
  if (!res.ok) throw new Error("Failed to fetch applicant");
  return res.json();
};

const updateApplicant = async (id: string, data: Partial<Applicant>) => {
  const res = await fetch(`http://localhost:4000/api/applicants/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Update failed");
  }

  return res.json();
};

// -------- Component --------
export default function ApplicantEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Applicant>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["applicant", id],
    queryFn: () => fetchApplicant(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (updatedData: Partial<Applicant>) =>
      updateApplicant(id!, updatedData),
    onSuccess: () => {
      toast({ title: "Success", description: "Applicant updated successfully" });
      queryClient.invalidateQueries(["applicants"]);
      navigate("/applicants");
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* 🔥 BACK ICON + TITLE HEADER FIXED */}
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/applicants")}
            className="
              rounded-lg 
              p-2 
              transition-all 
              hover:bg-orange-300/40
              dark:hover:bg-orange-400/30
              group
            "
          >
            <ArrowLeft
              className="
                h-5 w-5 
                text-white
                transition
              "
            />
          </Button>
        </motion.div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Edit Applicant
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update applicant details
          </p>
        </div>
      </div>

      <Card className="p-8 shadow-xl dark:bg-neutral-900 bg-white rounded-2xl border dark:border-neutral-700 transition">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

          {/* BASIC FIELDS */}
          <div>
            <Label>Name</Label>
            <Input name="name" value={formData.name || ""} onChange={handleChange} required />
          </div>

          <div>
            <Label>Hometown</Label>
            <Input name="hometown" value={formData.hometown || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Age</Label>
            <Input type="number" name="age" value={formData.age || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Employee Status</Label>
            <Input name="employeeStatus" value={formData.employeeStatus || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Phone</Label>
            <Input name="phone" value={formData.phone || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>NIC Number</Label>
            <Input name="nicNumber" value={formData.nicNumber || ""} onChange={handleChange} />
          </div>

          {/* APPOINTMENT */}
          <div>
            <Label>Appointment Date</Label>
            <Input type="date" name="appointmentDate" value={formData.appointmentDate || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Position</Label>
            <Input name="position" value={formData.position || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Company Name</Label>
            <Input name="companyName" value={formData.companyName || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Department</Label>
            <Input name="department" value={formData.department || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Agreed Salary</Label>
            <Input type="number" name="agreedSalary" value={formData.agreedSalary || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Benefits</Label>
            <Input name="benefits" value={formData.benefits || ""} onChange={handleChange} />
          </div>

          {/* SALARIES */}
          <div>
            <Label>Present Salary</Label>
            <Input type="number" name="presentSalary" value={formData.presentSalary || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Expected Salary</Label>
            <Input type="number" name="expectedSalary" value={formData.expectedSalary || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Notice Period</Label>
            <Input name="noticePeriod" value={formData.noticePeriod || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Possible Start Date</Label>
            <Input type="date" name="possibleStartDate" value={formData.possibleStartDate || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Overall Result</Label>
            <Input name="overallResult" value={formData.overallResult || ""} onChange={handleChange} />
          </div>

          {/* COMMENTS */}
          <div className="col-span-2">
            <Label>Comments</Label>
            <Input name="comments" value={formData.comments || ""} onChange={handleChange} />
          </div>

          {/* SUBMIT */}
          <div className="col-span-2">
            <Button type="submit" className="w-full flex items-center gap-2">
              <Save size={18} />
              {mutation.isLoading ? "Updating..." : "Update Applicant"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
