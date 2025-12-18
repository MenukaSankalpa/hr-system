// File: src/components/Dashboard.tsx

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ✅ USE CENTRAL API HELPER
import { authenticatedFetch } from "@/lib/api";

// ================= API FUNCTIONS =================

// 🔥 NO localhost anymore
const fetchStats = async () => {
  return authenticatedFetch("/applicants/dashboard-stats");
};

const fetchActivities = async () => {
  return authenticatedFetch("/applicants/recent-activity");
};

// ================= ANIMATIONS =================

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// ================= COLORS =================

const COLORS = [
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(var(--info))",
  "hsl(var(--warning))",
];

// ================= COMPONENT =================

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchStats,
  });

  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ["dashboard-activities"],
    queryFn: fetchActivities,
  });

  if (loadingStats || loadingActivities) {
    return (
      <div className="p-6 text-center text-lg text-primary">
        Loading Dashboard...
      </div>
    );
  }

  const kpiCards = [
    { title: "Total Applicants", value: stats?.totalApplicants || 0, icon: Users },
    { title: "Selected", value: stats?.selectedCount || 0, icon: UserCheck },
    { title: "Not Selected", value: stats?.notSelectedCount || 0, icon: UserX },
    { title: "Future Select", value: stats?.futureSelectCount || 0, icon: Clock },
    { title: "Pending", value: stats?.pendingCount || 0, icon: Briefcase },
    { title: "Today's Interviews", value: stats?.todaysInterviews || 0, icon: Calendar },
  ];

  const chartData = [
    { name: "Selected", value: stats?.selectedCount || 0 },
    { name: "Not Selected", value: stats?.notSelectedCount || 0 },
    { name: "Future Select", value: stats?.futureSelectCount || 0 },
    { name: "Pending", value: stats?.pendingCount || 0 },
  ];

  const monthlyData =
    stats?.monthly?.map((m: any) => ({
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m.month - 1],
      applicants: m.applicants,
    })) || [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Recruitment Dashboard</h1>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3"
      >
        {kpiCards.map((card) => (
          <motion.div key={card.title} variants={item}>
            <Card>
              <CardHeader className="flex justify-between">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <card.icon className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="value" label>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applicants" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activities?.length ? activities.map((a: any) => (
            <p key={a.id} className="text-sm">
              {a.userName} {a.action} {a.applicantName}
            </p>
          )) : "No recent activity"}
        </CardContent>
      </Card>
    </div>
  );
}
 