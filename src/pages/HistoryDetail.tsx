import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMedicalHistoryById,
  cancelMedicalHistory,
  reactivateMedicalHistory,
  startGenerateReport,
} from "@/api/medicalHistory";
import { getOperationsByHistoryId } from "@/api/operation";
import { formatDate } from "@/utils/formatDate";
import EditMedicalHistoryForm from "@/components/EditMedicalHistoryForm";
import EditPatientForm from "@/components/EditPatientForm";
import AddOperationForm from "@/components/AddOperationForm";
import type { OperationRead } from "@/types/entities/operation";
import type { MedicalHistoryRead } from "@/types/entities/medicalHistory";
import { toast } from "sonner";

export default function HistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const historyId = Number(id);

  const [history, setHistory] = useState<MedicalHistoryRead | null>(null);
  const [operations, setOperations] = useState<OperationRead[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"history" | "patient" | "operation">("history");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hist, ops] = await Promise.all([
        getMedicalHistoryById(historyId),
        getOperationsByHistoryId(historyId),
      ]);
      setHistory(hist);
      setOperations(ops);
    } catch {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [hist, ops] = await Promise.all([
          getMedicalHistoryById(historyId),
          getOperationsByHistoryId(historyId),
        ]);
        setHistory(hist);
        setOperations(ops);
      } catch {
        toast.error("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [historyId]);

  const handleToggleStatus = async () => {
    if (!history) return;
    try {
      if (history.cancelled) {
        await reactivateMedicalHistory(historyId);
        toast.success("История активирована");
      } else {
        await cancelMedicalHistory(historyId);
        toast.success("История отменена");
      }
      await fetchData();
    } catch {
      toast.error("Ошибка изменения статуса");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const { task_id } = await startGenerateReport(historyId);
      toast.loading("Генерация отчёта...", { id: "report-toast" });

      const checkStatus = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/report-task/${task_id}`);
          if (res.ok) {
            toast.dismiss("report-toast");
            toast.success("Отчёт готов!");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `История_болезни_${history?.history_number || historyId}.docx`;
            a.click();
            URL.revokeObjectURL(url);
          } else {
            setTimeout(checkStatus, 2000);
          }
        } catch {
          toast.dismiss("report-toast");
          toast.error("Ошибка при проверке статуса отчёта");
        }
      };

      setTimeout(checkStatus, 2000);
    } catch {
      toast.error("Не удалось запустить генерацию отчёта");
    }
  };

  if (loading) return <div className="p-12 text-center text-xl">Загрузка...</div>;
  if (!history) return <div className="p-12 text-center text-red-600 text-xl">История не найдена</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Заголовок и кнопки */}
      <div className="flex justify-between items-start">
        <div>
          <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4 inline-block">
            ← Назад к списку
          </button>
          <h1 className="text-4xl font-bold">
            История болезни № {history.history_number}
          </h1>
          <p className="text-2xl text-gray-700 mt-2">{history.patient.full_name}</p>
          <div className="flex gap-4 mt-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${history.cancelled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              {history.cancelled ? "Отменена" : "Активна"}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleToggleStatus}
            className={`px-6 py-3 rounded font-medium text-white ${history.cancelled ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {history.cancelled ? "Активировать" : "Отменить"}
          </button>
          <button
            onClick={handleGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium"
          >
            DOCX отчёт
          </button>
        </div>
      </div>

      {/* Вкладки */}
      <div className="border-b border-gray-300">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 px-2 font-semibold text-lg border-b-4 transition-all ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
          >
            Редактировать историю
          </button>
          <button
            onClick={() => setActiveTab("patient")}
            className={`pb-4 px-2 font-semibold text-lg border-b-4 transition-all ${
              activeTab === "patient"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
          >
            Пациент
          </button>
          <button
            onClick={() => setActiveTab("operation")}
            className={`pb-4 px-2 font-semibold text-lg border-b-4 transition-all ${
              activeTab === "operation"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
          >
            Операции
          </button>
        </div>
      </div>

      {/* Содержимое вкладок */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {activeTab === "history" && history && (
          <EditMedicalHistoryForm
            history={history}
            onSuccess={fetchData}
            onClose={() => {}}
          />
        )}

        {activeTab === "patient" && history && (
          <EditPatientForm
            patient={history.patient}
            onSuccess={fetchData}
            onClose={() => {}}
          />
        )}

        {activeTab === "operation" && (
          <div className="space-y-8">
            <AddOperationForm historyId={historyId} onSuccess={fetchData} />

            <div>
              <h3 className="text-xl font-bold mb-4">Список операций</h3>
              {operations.length === 0 ? (
                <p className="text-gray-500">Операций не проводилось</p>
              ) : (
                <div className="space-y-4">
                  {operations.map((op) => (
                    <div key={op.id} className="border rounded-lg p-5 bg-gray-50">
                      <h4 className="font-bold text-lg">{op.oper_name}</h4>
                      <p className="text-sm mt-2 whitespace-pre-wrap">{op.oper_protocol}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        Добавлена: {new Date(op.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Основные данные (всегда видны) */}
      <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
        <div>
          <p><strong>Поступление:</strong> {formatDate(history.admission_date)}</p>
          <p><strong>Выписка:</strong> {history.discharge_date ? formatDate(history.discharge_date) : "—"}</p>
          <p><strong>Диагноз:</strong> {history.diagnosis}</p>
          <p><strong>МКБ-10:</strong> {history.icd10_code}</p>
        </div>
        <div>
          <p><strong>ЦАХ:</strong> {history.cax_code?.cax_name || "—"}</p>
          <p><strong>Врач:</strong> {history.doctor?.full_name || "—"}</p>
          <p><strong>Медсестра:</strong> {history.nurse?.full_name || "—"}</p>
        </div>
      </div>
    </div>
  );
}
