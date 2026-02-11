import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ArrowRight, BarChart3, CheckCircle2, Zap } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                시운전 정보 관리
              </h1>
            </div>
            <div className="text-sm text-slate-600">
              {user?.name} 님
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Commissioning Form Card */}
            <Card
              className="shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow group"
              onClick={() => navigate("/commissioning")}
            >
              <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">시운전 정보 입력</CardTitle>
                    <CardDescription className="mt-2">
                      미완료된 시운전 정보를 입력하세요
                    </CardDescription>
                  </div>
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 text-sm mb-4">
                  업체를 선택하고 시운전 날짜, Hz, 암페어 정보를 입력하여 시운전 정보를 관리합니다.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold group-hover:gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/commissioning");
                  }}
                >
                  입력 시작
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Admin Dashboard Card */}
            <Card
              className="shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow group"
              onClick={() => navigate("/dashboard")}
            >
              <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">관리자 대시보드</CardTitle>
                    <CardDescription className="mt-2">
                      시운전 정보 현황을 모니터링하세요
                    </CardDescription>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-600 text-sm mb-4">
                  전체 시운전 정보의 완료율, 업체별 현황, 최근 업데이트 내역을 실시간으로 확인합니다.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold group-hover:gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/dashboard");
                  }}
                >
                  대시보드 보기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      간편한 입력
                    </h3>
                    <p className="text-sm text-slate-600">
                      모바일 최적화된 UI로 언제 어디서나 쉽게 입력할 수 있습니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      실시간 동기화
                    </h3>
                    <p className="text-sm text-slate-600">
                      Google Sheets와 실시간으로 동기화되어 항상 최신 정보를 유지합니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      상세한 분석
                    </h3>
                    <p className="text-sm text-slate-600">
                      완료율, 업체별 현황 등 다양한 통계를 한눈에 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6">
            <span className="text-white font-bold text-2xl">CM</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            시운전 정보 관리 시스템
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            마그네틱 교반기 시운전 정보를 간편하게 입력하고 관리하세요.
            모바일 최적화된 인터페이스로 언제 어디서나 접근 가능합니다.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg px-8 py-6 h-auto rounded-lg shadow-lg hover:shadow-xl transition-all">
              시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="pt-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                간편한 입력
              </h3>
              <p className="text-slate-600">
                업체 선택 후 필요한 정보만 입력하면 자동으로 저장됩니다.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="pt-8">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                실시간 동기화
              </h3>
              <p className="text-slate-600">
                Google Sheets와 실시간으로 동기화되어 항상 최신 정보를 유지합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardContent className="pt-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                상세한 분석
              </h3>
              <p className="text-slate-600">
                완료율, 업체별 현황 등 다양한 통계를 한눈에 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
