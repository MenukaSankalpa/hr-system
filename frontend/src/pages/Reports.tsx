// File: src/components/Reports.tsx (FULLY FIXED)

import { useState, useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner"; // Assuming you have 'sonner' for toasts
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2, Filter } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// 💡 Configuration: Use the backend URL
const API_URL = "http://localhost:4000"; 

// --- API Calls ---

/**
 * Fetches report statistics (KPIs) from the backend, filtered by date range.
 */
const fetchReportStats = async (dateRange: string) => {
    const res = await fetch(`${API_URL}/api/applicants/dashboard-stats?range=${dateRange}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch report statistics. Status: ${res.status}`);
    }
    return res.json();
};

/**
 * Calls the backend to generate and return a report file (CSV or PDF) as a Blob.
 */
const generateReport = async (format: 'csv' | 'pdf', dateRange: string) => {
    const res = await fetch(`${API_URL}/api/applicants/report/${format}?range=${dateRange}`);

    if (!res.ok) {
        // Attempt to read error message if it's not a CORS or network error
        const errorText = await res.text();
        throw new Error(`Failed to generate ${format.toUpperCase()} report. Server message: ${errorText || 'Unknown error'}`);
    }

    // Return the Blob for download
    return await res.blob();
};


// --- Main Component ---

export default function Reports() {
    const [dateRange, setDateRange] = useState('last-30-days');
    const [isDownloading, setIsDownloading] = useState(false);

    // Fetch data based on selected date range
    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ["reportStats", dateRange],
        queryFn: () => fetchReportStats(dateRange),
        // Default structure while loading/on error
        placeholderData: { 
            totalApplicants: 0, 
            selectedCount: 0, 
            notSelectedCount: 0,
            monthly: [], // Ensure monthly exists for charts if they were added
        },
    });

    // --- Handlers ---

    const handleGenerateReport = async (format: 'csv' | 'pdf') => {
        setIsDownloading(true);
        const fileName = `recruitment_report_${dateRange}_${new Date().toISOString().split('T')[0]}.${format}`;

        try {
            const blob = await generateReport(format, dateRange);
            
            // Create a temporary link element to trigger the download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url); // Clean up

            toast.success(`${format.toUpperCase()} report successfully started download!`);
        } catch (error: any) {
            console.error(error);
            // Display a user-friendly error message
            toast.error(error.message || `Error generating ${format.toUpperCase()} report.`);
        } finally {
            setIsDownloading(false);
        }
    };
    
    // --- Render Logic ---

    // Memoize the KPI card data
    const kpiCards = useMemo(() => [
        {
            title: "Total Applicants",
            value: stats?.totalApplicants || 0,
            colorClass: "text-gray-900",
        },
        {
            title: "Selected",
            value: stats?.selectedCount || 0,
            colorClass: "text-green-600",
        },
        {
            title: "Not Selected",
            value: stats?.notSelectedCount || 0,
            colorClass: "text-red-600",
        },
    ], [stats]);


    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Recruitment Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        Generate and export recruitment reports based on filtered data.
                    </p>
                </div>

                {/* Export/Download Buttons */}
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => handleGenerateReport('csv')}
                        disabled={isDownloading}
                    >
                        {isDownloading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <FileText className="h-4 w-4 mr-2" />
                        )}
                        Export CSV
                    </Button>
                    <Button 
                        onClick={() => handleGenerateReport('pdf')}
                        disabled={isDownloading}
                    >
                         {isDownloading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* --- Filters Card --- */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                         <Filter className="h-5 w-5 text-primary" /> Filters
                    </CardTitle>
                    <Button variant="ghost" onClick={() => refetch()} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <span className="text-sm">Refresh Data</span>
                        )}
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <Select 
                                value={dateRange} 
                                onValueChange={setDateRange}
                                disabled={isLoading} 
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-time">All Time</SelectItem>
                                    <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                                    <SelectItem value="this-year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom Range (WIP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Add other filters here... */}
                    </div>
                </CardContent>
            </Card>

            {/* --- Real-Time KPI Cards --- */}
            <div className="grid gap-6 md:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-3 text-center py-8">
                        <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
                        <p className="mt-2 text-muted-foreground">Fetching report data...</p>
                    </div>
                ) : (
                    kpiCards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader>
                                <CardTitle className="text-sm">{card.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${card.colorClass || ''}`}>
                                    {card.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
            
            {/* Chart Area using stats.monthly data */}
            {/* ... */}
        </div>
    );
}