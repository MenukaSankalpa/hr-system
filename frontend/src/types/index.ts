export type UserRole = 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export type ApplicantStatus = 'selected' | 'not-selected' | 'future-select' | 'pending';

export type OverallResult = 
  | 'MEETS JOB REQUIREMENT'
  | 'DOES NOT MEET JOB REQUIREMENT'
  | 'OVER QUALIFIED FOR THE JOB'
  | 'SUITABLE FOR ANOTHER POSITION';

export interface Interviewer {
  name: string;
  designation: string;
  sign: string;
  date: string;
}

export interface AppointmentDetails {
  appointmentDate: string;
  position: string;
  companyName: string;
  department: string;
  agreedSalary: number;
  benefits: string;
}

export interface Marks {
  punctuality: number;
  preparedness: number;
  communicationSkills: number;
  experienceRequired: number;
  qualificationRequired: number;
}

export interface Applicant {
  id: string;
  name: string;
  hometown: string;
  age: number;
  employeeStatus: string;
  familyDetails: string;
  reasonForLeaving: string;
  experience: string;
  phone: string;
  nicNumber: string;
  marks: Marks;
  totalMarks: number;
  comments: string;
  noticePeriod: string;
  presentSalary: number;
  expectedSalary: number;
  possibleStartDate: string;
  overallResult: OverallResult | null;
  interviewers: Interviewer[];
  appointmentDetails: AppointmentDetails | null;
  cvFile: File | null;
  cvUrl?: string;
  status: ApplicantStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalApplicants: number;
  selectedCount: number;
  notSelectedCount: number;
  futureSelectCount: number;
  openPositions: number;
  todaysInterviews: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  applicantName: string;
  userName: string;
  timestamp: string;
}
