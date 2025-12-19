// File: src/components/Reports.tsx (FULLY FIXED)

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Download, FileText, Loader2, Filter } from "lucide-react";

/* =========================
   CONFIG — HOSTED BACKEND
   ========================= */
const API_URL = "https://hr-system-2bau.onrender.com";

/* =========================
   API CALLS
   ========================= */

/**
 * Fetch dashboard / report KPIs
 */
const fetchReportStats = async (dateRange: string) => {
  const res = await fetch(
    `${API_URL}/api/applicants/dashboard-stats?range=${dateRange}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch report statistics`);
  }

  return res.json();
};

/**
 * Generate CSV / PDF report
 */
const generateReport = async (
  format: "csv" | "pdf",
  dateRange: string
) => {
  const res = await fetch(
    `${API_URL}/api/applicants/report/${format}?range=${dateRange}`
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      errorText || `Failed to generate ${format.toUpperCase()} report`
    );
  }

  return await res.blob();
};

/* =========================
   MAIN COMPONENT
   ========================= */

export default function Reports() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["reportStats", dateRange],
    queryFn: () => fetchReportStats(dateRange),
    placeholderData: {
      totalApplicants: 0,
      selectedCount: 0,
      notSelectedCount: 0,
      monthly: [],
    },
  });

  /* =========================
     HANDLERS
     ========================= */

  const handleGenerateReport = async (
    format: "csv" | "pdf"
  ) => {
    setIsDownloading(true);

    const fileName = `recruitment_report_${dateRange}_${new Date()
      .toISOString()
      .split("T")[0]}.${format}`;

    try {
      const blob = await generateReport(format, dateRange);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `${format.toUpperCase()} report download started`
      );
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || "Failed to generate report"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  /* =========================
     KPI CARDS
     ========================= */

  const kpiCards = useMemo(
    () => [
      {
        title: "Total Applicants",
        value: stats?.totalApplicants ?? 0,
        colorClass: "text-gray-900",
      },
      {
        title: "Selected",
        value: stats?.selectedCount ?? 0,
        colorClass: "text-green-600",
      },
      {
        title: "Not Selected",
        value: stats?.notSelectedCount ?? 0,
        colorClass: "text-red-600",
      },
    ],
    [stats]
  );

  /* =========================
     RENDER
     ========================= */

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Recruitment Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and export recruitment reports.
          </p>
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={isDownloading}
            onClick={() => handleGenerateReport("csv")}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>

          <Button
            disabled={isDownloading}
            onClick={() => handleGenerateReport("pdf")}
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

      {/* FILTERS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
          <Button
            variant="ghost"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh Data"
            )}
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date Range
              </label>
              <Select
                value={dateRange}
                onValueChange={setDateRange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-time">
                    All Time
                  </SelectItem>
                  <SelectItem value="last-7-days">
                    Last 7 Days
                  </SelectItem>
                  <SelectItem value="last-30-days">
                    Last 30 Days
                  </SelectItem>
                  <SelectItem value="this-year">
                    This Year
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI CARDS */}
      <div className="grid gap-6 md:grid-cols-3">
        {isLoading ? (
          <div className="col-span-3 text-center py-8">
            <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">
              Fetching report data...
            </p>
          </div>
        ) : (
          kpiCards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle className="text-sm">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${card.colorClass}`}
                >
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* CHART AREA (OPTIONAL) */}
      {/* Use stats.monthly if you add charts later */}
    </div>
  );
}
