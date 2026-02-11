import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp } from "lucide-react";

interface Stats {
  totalRecords: number;
  completeRecords: number;
  incompleteRecords: number;
  completionRate: number;
  byCompany: Record<
    string,
    { total: number; complete: number; incomplete: number }
  >;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const statsQuery = trpc.commissioning.getStats.useQuery();

  useEffect(() => {
    if (statsQuery.data) {
      setStats(statsQuery.data as Stats);

      // Prepare chart data
      const data = Object.entries((statsQuery.data as Stats).byCompany).map(
        ([company, data]) => ({
          name: company,
          완료: data.complete,
          미완료: data.incomplete,
          total: data.total,
        })
      );
      setChartData(data);
    }
  }, [statsQuery.data]);

  const pieData = stats
    ? [
        { name: "완료", value: stats.completeRecords, color: "#10b981" },
        { name: "미완료", value: stats.incompleteRecords, color: "#ef4444" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            시운전 정보 관리 대시보드
          </h1>
          <p className="text-slate-600">
            실시간 시운전 정보 현황 및 통계
          </p>
        </div>

        {/* Loading State */}
        {statsQuery.isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-slate-600 ml-4">데이터를 불러오는 중...</p>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Total Records */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        총 시운전 항목
                      </p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">
                        {stats.totalRecords}
                      </p>
                    </div>
                    <div className="text-4xl text-blue-200">📊</div>
                  </div>
                </CardContent>
              </Card>

              {/* Complete Records */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        완료된 항목
                      </p>
                      <p className="text-3xl font-bold text-green-900 mt-2">
                        {stats.completeRecords}
                      </p>
                    </div>
                    <div className="text-4xl text-green-200">✓</div>
                  </div>
                </CardContent>
              </Card>

              {/* Incomplete Records */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        미완료 항목
                      </p>
                      <p className="text-3xl font-bold text-red-900 mt-2">
                        {stats.incompleteRecords}
                      </p>
                    </div>
                    <div className="text-4xl text-red-200">⏳</div>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Rate */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">
                        완료율
                      </p>
                      <p className="text-3xl font-bold text-purple-900 mt-2">
                        {stats.completionRate}%
                      </p>
                    </div>
                    <div className="text-4xl text-purple-200">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Bar Chart */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle>업체별 시운전 현황</CardTitle>
                  <CardDescription>
                    각 업체의 완료/미완료 항목 비교
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#f1f5f9" }}
                        />
                        <Legend />
                        <Bar dataKey="완료" fill="#10b981" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="미완료" fill="#ef4444" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-500 py-8">
                      데이터가 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <CardTitle>전체 완료율</CardTitle>
                  <CardDescription>
                    전체 시운전 항목의 완료 현황
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 flex items-center justify-center">
                  {pieData.length > 0 && pieData[0].value + pieData[1].value > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) =>
                            `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-slate-500 py-8">
                      데이터가 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Company Details Table */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                <CardTitle>업체별 상세 현황</CardTitle>
                <CardDescription>
                  각 업체의 시운전 정보 입력 현황
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">
                          업체명
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">
                          총 항목
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">
                          완료
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">
                          미완료
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">
                          완료율
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.byCompany).map(([company, data]) => {
                        const rate = data.total > 0
                          ? Math.round((data.complete / data.total) * 100)
                          : 0;
                        return (
                          <tr
                            key={company}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-slate-900">
                              {company}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-600">
                              {data.total}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                {data.complete}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                {data.incomplete}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-slate-900 w-10 text-right">
                                  {rate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
