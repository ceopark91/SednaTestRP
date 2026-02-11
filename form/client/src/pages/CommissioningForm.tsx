import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Record {
  rowIndex: number;
  company: string;
  industry: string;
  model: string;
  serialNumber: string;
  kw: string;
  hz: string;
  ampere: string;
}

export default function CommissioningForm() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [records, setRecords] = useState<Record[]>([]);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [formData, setFormData] = useState({
    hz: "",
    ampere: "",
    commissioningDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedRecords, setCompletedRecords] = useState<number[]>([]);

  // Fetch companies
  const companiesQuery = trpc.commissioning.getCompanies.useQuery();

  // Fetch incomplete records for selected company
  const recordsQuery = trpc.commissioning.getIncompleteRecords.useQuery(
    { company: selectedCompany },
    { enabled: !!selectedCompany }
  );

  // Submit record mutation
  const submitMutation = trpc.commissioning.submitRecord.useMutation();

  useEffect(() => {
    if (recordsQuery.data) {
      setRecords(recordsQuery.data as Record[]);
      setCurrentRecordIndex(0);
      setFormData({ hz: "", ampere: "", commissioningDate: "" });
      setCompletedRecords([]);

      // Pre-fill form with existing data
      const currentRecord = recordsQuery.data[0];
      if (currentRecord) {
        setFormData({
          hz: currentRecord.hz || "",
          ampere: currentRecord.ampere || "",
          commissioningDate: "",
        });
      }
    }
  }, [recordsQuery.data]);

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.hz || !formData.ampere || !formData.commissioningDate) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    const currentRecord = records[currentRecordIndex];
    if (!currentRecord) return;

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        rowIndex: currentRecord.rowIndex,
        hz: formData.hz,
        ampere: formData.ampere,
        commissioningDate: formData.commissioningDate,
      });

      setCompletedRecords((prev) => [...prev, currentRecordIndex]);
      toast.success("시운전 정보가 저장되었습니다!");

      // Move to next record
      if (currentRecordIndex < records.length - 1) {
        const nextIndex = currentRecordIndex + 1;
        setCurrentRecordIndex(nextIndex);
        const nextRecord = records[nextIndex];
        setFormData({
          hz: nextRecord.hz || "",
          ampere: nextRecord.ampere || "",
          commissioningDate: "",
        });
      } else {
        toast.success("모든 시운전 정보 입력이 완료되었습니다!");
        setSelectedCompany("");
        setRecords([]);
      }
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRecord = records[currentRecordIndex];
  const isAllCompleted = completedRecords.length === records.length && records.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            시운전 정보 입력
          </h1>
          <p className="text-slate-600">
            미완료된 시운전 정보를 입력하여 관리하세요.
          </p>
        </div>

        {/* Company Selection */}
        <Card className="mb-6 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-lg">업체 선택</CardTitle>
            <CardDescription>입력할 업체를 선택해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Select value={selectedCompany} onValueChange={handleCompanyChange}>
              <SelectTrigger className="w-full h-12 border-2 border-slate-200 hover:border-blue-400 transition-colors">
                <SelectValue placeholder="업체명을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {companiesQuery.data?.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Records Progress */}
        {records.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium">
              진행 상황: {completedRecords.length} / {records.length} 완료
            </p>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(completedRecords.length / records.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Form */}
        {currentRecord && !isAllCompleted && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="text-lg">
                {currentRecord.model} - {currentRecord.serialNumber || "S/N 없음"}
              </CardTitle>
              <CardDescription>
                {currentRecordIndex + 1} / {records.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">
                    업체명
                  </Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {currentRecord.company}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">
                    산업군
                  </Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {currentRecord.industry}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">
                    KW
                  </Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {currentRecord.kw}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 uppercase">
                    S/N
                  </Label>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {currentRecord.serialNumber || "-"}
                  </p>
                </div>
              </div>

              {/* Input fields */}
              <div className="space-y-4">
                {/* Commissioning Date */}
                <div>
                  <Label htmlFor="date" className="font-semibold text-slate-700">
                    시운전 날짜 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.commissioningDate}
                    onChange={(e) =>
                      handleInputChange("commissioningDate", e.target.value)
                    }
                    className="mt-2 h-11 border-2 border-slate-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Hz */}
                <div>
                  <Label htmlFor="hz" className="font-semibold text-slate-700">
                    Hz <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="hz"
                    type="text"
                    placeholder="예: 60Hz"
                    value={formData.hz}
                    onChange={(e) => handleInputChange("hz", e.target.value)}
                    className="mt-2 h-11 border-2 border-slate-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Ampere */}
                <div>
                  <Label htmlFor="ampere" className="font-semibold text-slate-700">
                    A (암페어) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ampere"
                    type="text"
                    placeholder="예: 3.5A"
                    value={formData.ampere}
                    onChange={(e) => handleInputChange("ampere", e.target.value)}
                    className="mt-2 h-11 border-2 border-slate-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.hz || !formData.ampere || !formData.commissioningDate}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "저장 및 다음"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completion Message */}
        {isAllCompleted && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                완료되었습니다!
              </h2>
              <p className="text-slate-600 mb-6">
                모든 시운전 정보 입력이 완료되었습니다.
              </p>
              <Button
                onClick={() => {
                  setSelectedCompany("");
                  setRecords([]);
                  setCompletedRecords([]);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
              >
                다른 업체 입력하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {selectedCompany && records.length === 0 && !recordsQuery.isLoading && (
          <Card className="shadow-lg border-0">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600">
                미완료된 시운전 정보가 없습니다.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {recordsQuery.isLoading && (
          <Card className="shadow-lg border-0">
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-slate-600 mt-4">데이터를 불러오는 중...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
