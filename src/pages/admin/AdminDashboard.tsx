import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Logo } from "../../components/Logo";
import {
  LogOut,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchSubmissions,
  fetchDashboardStats,
  fetchSubmissionById,
} from "../../services/adminApi";
import type { Submission } from "../../services/adminApi";
import { QuestionnaireDetailModal } from "../../components/admin/QuestionnaireDetailModal";

export const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("adminAuth");
    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }

    loadDashboardData();
  }, [navigate, currentPage]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load stats and submissions in parallel
      const [statsData, submissionsData] = await Promise.all([
        fetchDashboardStats().catch(() => null),
        fetchSubmissions(currentPage, 20),
      ]);

      if (statsData) {
        setStats(statsData);
      }

      setSubmissions(submissionsData.submissions || []);
      setTotalSubmissions(submissionsData.pagination?.total || 0);
      setTotalPages(submissionsData.pagination?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load data", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      // If unauthorized, redirect to login
      if (
        error instanceof Error &&
        (error.message.includes("Unauthorized") ||
          error.message.includes("login"))
      ) {
        navigate("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    await loadDashboardData();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminId");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewSubmission = async (id: string) => {
    try {
      const submission = await fetchSubmissionById(id);
      setSelectedSubmission(submission);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Failed to load submission details", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(submissions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `myrtle-submissions-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600">
                  {localStorage.getItem("adminEmail") || "Survey Submissions"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={loadSubmissions}
                disabled={isLoading}
                className="h-9"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={submissions.length === 0}
                className="h-9"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleLogout} className="h-9">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#27DC85]">
                  {stats.stats?.totalSubmissions || totalSubmissions}
                </div>
                <p className="text-sm text-slate-600 mt-1">Total Submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-slate-900">
                  ₦{stats.stats?.totalNetWorth?.toLocaleString() || "0"}
                </div>
                <p className="text-sm text-slate-600 mt-1">Total Net Worth</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-slate-900">
                  ₦{stats.stats?.averageNetWorth?.toLocaleString() || "0"}
                </div>
                <p className="text-sm text-slate-600 mt-1">Average Net Worth</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-slate-900">
                  Page {currentPage} of {totalPages}
                </div>
                <p className="text-sm text-slate-600 mt-1">Pagination</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Persona & Risk Distribution */}
        {stats &&
          (stats.personaDistribution || stats.riskProfileDistribution) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {stats.personaDistribution && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Persona Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.personaDistribution).map(
                        ([persona, count]) => (
                          <div
                            key={persona}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-slate-700">
                              {persona}
                            </span>
                            <span className="text-sm font-semibold text-[#27DC85]">
                              {count as number}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {stats.riskProfileDistribution && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Risk Profile Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.riskProfileDistribution).map(
                        ([profile, count]) => (
                          <div
                            key={profile}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-slate-700">
                              {profile}
                            </span>
                            <span className="text-sm font-semibold text-[#27DC85]">
                              {count as number}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

        <Card>
          <CardHeader>
            <CardTitle>
              All Submissions ({totalSubmissions || submissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#27DC85] mb-4" />
                <p className="text-slate-600">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No submissions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Net Worth
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Persona
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Risk Profile
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4 text-sm text-slate-900 font-medium">
                          {submission.fullName}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-700">
                          {submission.email}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-700">
                          {submission.phone}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-700">
                          {submission.netWorth
                            ? `₦${submission.netWorth.toLocaleString()}`
                            : "N/A"}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-700">
                          {submission.persona || "N/A"}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-700">
                          {submission.riskProfile || "N/A"}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewSubmission(submission.id)}
                            className="h-8 text-xs"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && submissions.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="h-9"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Questionnaire Detail Modal */}
      <QuestionnaireDetailModal
        submission={selectedSubmission}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubmission(null);
        }}
      />
    </div>
  );
};
