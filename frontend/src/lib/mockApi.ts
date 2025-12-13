import { Applicant, User, DashboardStats, ActivityLog } from '@/types';

// Mock data
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'superadmin',
    email: 'superadmin@system.com',
    role: 'superadmin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@gmail.com',
    role: 'admin',
    createdAt: '2024-01-15T00:00:00Z',
  },
];

export const mockApplicants: Applicant[] = [
  {
    id: '1',
    name: 'John Doe',
    hometown: 'Colombo',
    age: 28,
    employeeStatus: 'Employed',
    familyDetails: 'Married with one child',
    reasonForLeaving: 'Seeking career growth',
    experience: '5 years',
    phone: '+94771234567',
    nicNumber: '199512345678',
    marks: {
      punctuality: 8,
      preparedness: 9,
      communicationSkills: 8,
      experienceRequired: 7,
      qualificationRequired: 8,
    },
    totalMarks: 40,
    comments: 'Excellent candidate with strong technical skills',
    noticePeriod: '1 month',
    presentSalary: 80000,
    expectedSalary: 120000,
    possibleStartDate: '2024-03-01',
    overallResult: 'MEETS JOB REQUIREMENT',
    interviewers: [
      {
        name: 'Sarah Williams',
        designation: 'HR Manager',
        sign: 'SW',
        date: '2024-02-15',
      },
    ],
    appointmentDetails: {
      appointmentDate: '2024-03-01',
      position: 'Senior Developer',
      companyName: 'Tech Corp',
      department: 'Engineering',
      agreedSalary: 120000,
      benefits: 'Health insurance, Annual bonus, Remote work flexibility',
    },
    cvFile: null,
    status: 'selected',
    createdBy: '2',
    createdByName: 'admin',
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-15T15:30:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    hometown: 'Kandy',
    age: 25,
    employeeStatus: 'Unemployed',
    familyDetails: 'Single',
    reasonForLeaving: 'Fresh graduate',
    experience: '1 year internship',
    phone: '+94777654321',
    nicNumber: '199812345678',
    marks: {
      punctuality: 9,
      preparedness: 8,
      communicationSkills: 9,
      experienceRequired: 5,
      qualificationRequired: 8,
    },
    totalMarks: 39,
    comments: 'Promising candidate, needs more experience',
    noticePeriod: 'Immediate',
    presentSalary: 0,
    expectedSalary: 60000,
    possibleStartDate: '2024-02-20',
    overallResult: 'SUITABLE FOR ANOTHER POSITION',
    interviewers: [
      {
        name: 'Michael Brown',
        designation: 'Team Lead',
        sign: 'MB',
        date: '2024-02-12',
      },
    ],
    appointmentDetails: null,
    cvFile: null,
    status: 'future-select',
    createdBy: '1',
    createdByName: 'superadmin',
    createdAt: '2024-02-08T09:00:00Z',
    updatedAt: '2024-02-12T14:20:00Z',
  },
];

export const mockStats: DashboardStats = {
  totalApplicants: 45,
  selectedCount: 12,
  notSelectedCount: 18,
  futureSelectCount: 10,
  openPositions: 8,
  todaysInterviews: 3,
};

export const mockActivities: ActivityLog[] = [
  {
    id: '1',
    action: 'Added new applicant',
    applicantName: 'John Doe',
    userName: 'admin',
    timestamp: '2024-02-10T10:00:00Z',
  },
  {
    id: '2',
    action: 'Changed status to Selected',
    applicantName: 'John Doe',
    userName: 'superadmin',
    timestamp: '2024-02-15T15:30:00Z',
  },
  {
    id: '3',
    action: 'Added new applicant',
    applicantName: 'Jane Smith',
    userName: 'superadmin',
    timestamp: '2024-02-08T09:00:00Z',
  },
];

// Mock API functions
export const mockLogin = async (
  identifier: string,
  password: string
): Promise<{ user: User; token: string } | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = mockUsers.find(
    (u) =>
      (u.username === identifier || u.email === identifier) &&
      password === '123'
  );

  if (user) {
    return {
      user,
      token: `mock-token-${user.id}`,
    };
  }

  return null;
};

export const mockGetApplicants = async (
  userId?: string,
  role?: string
): Promise<Applicant[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (role === 'admin' && userId) {
    return mockApplicants.filter((a) => a.createdBy === userId);
  }

  return mockApplicants;
};

export const mockGetStats = async (): Promise<DashboardStats> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockStats;
};

export const mockGetActivities = async (): Promise<ActivityLog[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockActivities;
};

export const mockGetUsers = async (): Promise<User[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockUsers.filter((u) => u.role === 'admin');
};
