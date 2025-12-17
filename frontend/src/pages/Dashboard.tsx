// File: src/components/Dashboard.tsx (FINAL, STYLED, & CONNECTED)

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
    Legend, // Included for complete Pie Chart display
} from "recharts";

// --- API Configuration ---
// This URL must match the server.js file running on port 4000
const API_URL = "http://localhost:4000"; 

// --- Data Fetching Functions ---

// Fetch key statistics (KPIs, Charts)
const fetchStats = async () => {
    const res = await fetch(`${API_URL}/api/applicants/dashboard-stats`);
    if (!res.ok) throw new Error("Failed to load stats");
    return res.json();
};

// Fetch recent activity
const fetchActivities = async () => {
    const res = await fetch(`${API_URL}/api/applicants/recent-activity`);
    if (!res.ok) throw new Error("Failed to load activities");
    return res.json();
};

// --- Framer Motion Animations ---
const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

// --- Chart Colors (Tailwind/CSS variable compatible) ---
const COLORS = [
    "hsl(var(--success))",      // Selected (Index 0)
    "hsl(var(--destructive))",  // Not Selected (Index 1)
    "hsl(var(--info))",         // Future Select (Index 2)
    "hsl(var(--warning))",      // Pending (Index 3)
];

// --- Main Dashboard Component ---

export default function Dashboard() {
    // Note: The useQuery hook handles loading states and caching
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ["stats"],
        queryFn: fetchStats,
    });

    const { data: activities, isLoading: isLoadingActivities } = useQuery({
        queryKey: ["activities"],
        queryFn: fetchActivities,
    });

    // --- KPI Card Data ---
    const kpiCards = [
        {
            title: "Total Applicants",
            value: stats?.totalApplicants || 0,
            icon: Users,
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            title: "Selected",
            value: stats?.selectedCount || 0,
            icon: UserCheck,
            color: "text-success",
            bgColor: "bg-success/10",
        },
        {
            title: "Not Selected",
            value: stats?.notSelectedCount || 0,
            icon: UserX,
            color: "text-destructive",
            bgColor: "bg-destructive/10",
        },
        {
            title: "Future Select",
            value: stats?.futureSelectCount || 0,
            icon: Clock,
            color: "text-info",
            bgColor: "bg-info/10",
        },
        {
            // Title changed to match the fixed KPI list in File 2's structure (was Open Positions/Briefcase in File 1's mock, now back to Pending/Briefcase based on File 2 data structure)
            title: "Pending", 
            value: stats?.pendingCount || 0,
            icon: Briefcase,
            color: "text-warning",
            bgColor: "bg-warning/10",
        },
        {
            title: "Today's Interviews",
            // Assuming the backend has a 'todaysInterviews' or similar field (set to 0 in File 2's kpiCards, using 0 for safety here)
            value: stats?.todaysInterviews || 0, 
            icon: Calendar,
            color: "text-accent",
            bgColor: "bg-accent/10",
        },
    ];

    // --- Chart Data Mapping ---
    // This structure matches the Pie Chart and the COLORS array
    const chartData = [
        { name: "Selected", value: stats?.selectedCount || 0 },
        { name: "Not Selected", value: stats?.notSelectedCount || 0 },
        { name: "Future Select", value: stats?.futureSelectCount || 0 },
        { name: "Pending", value: stats?.pendingCount || 0 },
    ];

    const monthlyData =
        stats?.monthly?.map((m: any) => ({
            // Mongoose returns month number (1-12), map to short name
            month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m.month - 1],
            applicants: m.applicants,
        })) || [];

    if (isLoadingStats || isLoadingActivities) {
        return (
            <div className="p-6 text-center text-lg text-primary">
                Loading Dashboard Data...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Recruitment Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Here is your recruitment analytics overview.
                    </p>
                </div>
            </div>
            
            {/* --- KPI Cards Section (Fixed 3-column layout) --- */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 md:grid-cols-3" 
            >
                {kpiCards.map((card) => (
                    <motion.div key={card.title} variants={item}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {card.title}
                                </CardTitle>
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
                {/* --- Applicant Status Distribution Pie Chart --- */}
                <Card>
                    <CardHeader>
                        <CardTitle>Applicant Status Distribution</CardTitle>
                    </CardHeader>
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
                                    labelLine={false}
                                    // Enhanced label to show name and percentage
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                {/* Enhanced Tooltip for clarity */}
                                <Tooltip formatter={(value, name) => [value, name]} /> 
                                {/* Added Legend for key interpretation */}
                                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* --- Monthly Applicants Bar Chart --- */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Applicants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                {/* Enhanced YAxis to start from zero and add a label */}
                                <YAxis allowDecimals={false} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} /> 
                                <Tooltip formatter={(value) => [value, 'Applicants']} />
                                <Bar
                                    dataKey="applicants"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* --- Recent Activity Timeline --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activities?.length > 0 ? (
                            activities.map((act: any) => (
                                <div
                                    key={act.id}
                                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                                >
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-medium">{act.userName}</span>{" "}
                                            {/* Action comes pre-formatted from the backend mock data */}
                                            {act.action}{" "}
                                            <span className="font-medium">{act.applicantName}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(act.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground pt-4">No recent activity found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}