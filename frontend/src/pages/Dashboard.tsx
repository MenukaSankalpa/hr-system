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

const API_URL = "http://localhost:4000";

const fetchStats = async () => {
  const res = await fetch(`${API_URL}/api/applicants/dashboard-stats`);
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
};

const fetchActivities = async () => {
  const res = await fetch(`${API_URL}/api/applicants/recent-activity`);
  if (!res.ok) throw new Error("Failed to load activities");
  return res.json();
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COLORS = ["hsl(var(--success))", "hsl(var(--destructive))", "hsl(var(--info))", "hsl(var(--warning))"];

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery(["stats"], fetchStats);
  const { data: activities, isLoading: isLoadingActivities } = useQuery(["activities"], fetchActivities);

  if (isLoadingStats || isLoadingActivities) {
    return <div className="p-6 text-center text-lg text-primary">Loading Dashboard Data...</div>;
  }

  const kpiCards = [
    { title: "Total Applicants", value: stats?.totalApplicants || 0, icon: Users, color: "text-primary", bgColor: "bg-primary/10" },
    { title: "Selected", value: stats?.selectedCount || 0, icon: UserCheck, color: "text-success", bgColor: "bg-success/10" },
    { title: "Not Selected", value: stats?.notSelectedCount || 0, icon: UserX, color: "text-destructive", bgColor: "bg-destructive/10" },
    { title: "Future Select", value: stats?.futureSelectCount || 0, icon: Clock, color: "text-info", bgColor: "bg-info/10" },
    { title: "Pending", value: stats?.pendingCount || 0, icon: Briefcase, color: "text-warning", bgColor: "bg-warning/10" },
    { title: "Today's Interviews", value: stats?.todaysInterviews || 0, icon: Calendar, color: "text-accent", bgColor: "bg-accent/10" },
  ];

  const chartData = [
    { name: "Selected", value: stats?.selectedCount || 0 },
    { name: "Not Selected", value: stats?.notSelectedCount || 0 },
    { name: "Future Select", value: stats?.futureSelectCount || 0 },
    { name: "Pending", value: stats?.pendingCount || 0 },
  ];

  const monthlyData = stats?.monthly?.map((m: any) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m.month-1],
    applicants: m.applicants,
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recruitment Dashboard</h1>
          <p className="text-muted-foreground mt-1">Here is your recruitment analytics overview.</p>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {kpiCards.map(card => (
          <motion.div key={card.title} variants={item}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Applicant Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}
                >
                  {chartData.map((entry,index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value,name) => [value,name]} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly Applicants</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [value, 'Applicants']} />
                <Bar dataKey="applicants" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities?.length > 0 ? activities.map((act: any) => (
              <div key={act.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{act.userName}</span> {act.action} <span className="font-medium">{act.applicantName}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(act.timestamp).toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground pt-4">No recent activity found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
