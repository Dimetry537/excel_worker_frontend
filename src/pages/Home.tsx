import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMedicalHistoriesFiltered,
  cancelMedicalHistory,
  reactivateMedicalHistory,
} from "@/api/medicalHistory";
import { startOfMonth, endOfMonth, formatISO } from "date-fns";
import { api } from "@/api/client";
import type { MedicalHistoryRead } from "@/types/entities/medicalHistory";
import { formatDate } from "@/utils/formatDate";
import { usePersistedFilters } from "@/hooks/usePersistedFilters";

const PAGE_SIZE = 50;

export default function Home() {
  const navigate = useNavigate();
  const [filters, setFilters] = usePersistedFilters();
  const [allHistories, setAllHistories] = useState<MedicalHistoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  type SortableField =
    | "history_number"
    | "patient_full_name"
    | "admission_date"
    | "discharge_date"
    | "diagnosis"
    | "icd10_code"
    | "cax_code_name"
    | "doctor_full_name"
    | "nurse_full_name";

  const [sortColumn, setSortColumn] = useState<SortableField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchHistories = async () => {
    try {
      const data = await getMedicalHistoriesFiltered({
        full_name: filters.fullName || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
      });
      setAllHistories(data);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ошибка загрузки данных");
    }
  }
    
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMedicalHistoriesFiltered({
          full_name: filters.fullName || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        });
        setAllHistories(data);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters]);

  const handleCancel = async (historyId: number) => {
    if (!confirm("Вы уверены, что хотите отменить эту историю болезни?")) return;
    try {
      await cancelMedicalHistory(historyId);
      await fetchHistories();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка при отмене");
    }
  };

  const handleReactivate = async (historyId: number) => {
    if (!confirm("Активировать историю болезни?")) return;
    try {
      await reactivateMedicalHistory(historyId);
      await fetchHistories();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка при активации");
    }
  };

  const handleSort = (column: SortableField) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (col: SortableField) => {
    if (sortColumn === col) return sortDirection === "asc" ? " ↑" : " ↓";
    return "";
  };

  const getSortValue = (h: MedicalHistoryRead, column: SortableField) => {
    switch (column) {
      case "history_number": return h.history_number;
      case "patient_full_name": return h.patient.full_name.toLowerCase();
      case "admission_date": return h.admission_date || "";
      case "discharge_date": return h.discharge_date || "";
      case "diagnosis": return h.diagnosis.toLowerCase();
      case "icd10_code": return h.icd10_code;
      case "cax_code_name": return h.cax_code?.cax_name?.toLowerCase() || "";
      case "doctor_full_name": return h.doctor?.full_name?.toLowerCase() || "";
      case "nurse_full_name": return h.nurse?.full_name?.toLowerCase() || "";
      default: return "";
    }
  };

  const sorted = [...allHistories].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = getSortValue(a, sortColumn);
    const bVal = getSortValue(b, sortColumn);
    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginatedHistories = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleReset = () => {
    const today = new Date();
    const newFilters = {
      fullName: "",
      startDate: formatISO(startOfMonth(today), { representation: "date" }),
      endDate: formatISO(endOfMonth(today), { representation: "date" }),
    };
    setFilters(newFilters);
    fetchHistories();
  };

  const handleGenerateReport = async () => {
    if (exporting) return;
    setExporting(true);
    setError(null);

    try {
      const resp = await api<{ task_id: string }>("/medical_history/export", {
        method: "POST",
        query: {
          full_name: filters.fullName.trim() || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        },
      });

      const taskId = resp.task_id;
      alert("Отчёт формируется... Файл скачается автоматически");

      interface TaskStatus {
        state: "PENDING" | "PROGRESS" | "SUCCESS" | "FAILURE";
        result?: string;
      }

      const pollStatus = async () => {
        try {
          const statusData = await api<TaskStatus>(`/medical_history/tasks/status/${taskId}`);

          if (statusData.state === "SUCCESS" && statusData.result) {
            const filePath = statusData.result.startsWith("/") ? statusData.result : `/${statusData.result}`;
            const downloadUrl = filePath;

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = filePath.split("/").pop() || "medical_report.xlsx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert("Отчёт успешно скачан!");
          } else if (statusData.state === "FAILURE") {
            throw new Error("Ошибка генерации отчёта на сервере");
          } else {
            setTimeout(pollStatus, 2000);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Ошибка при проверке статуса задачи");
        } finally {
          setExporting(false);
        }
      };

      pollStatus();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось запустить экспорт");
      setExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6">Истории болезни</h1>

      {/* Фильтры с календарями */}
      <div className="bg-white p-5 rounded-lg shadow mb-6 flex flex-wrap gap-6 items-end">
        <div className="min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">ФИО пациента</label>
          <input
            type="text"
            value={filters.fullName}
            onChange={(e) => setFilters(prev => ({ ...prev, fullName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Иванов Иван Иванович"
          />
        </div>

        {/* Дата с — календарь */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата поступления с</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
            lang="ru"
          />
          {!filters.startDate && (
            <span className="absolute left-3 top-9 text-gray-400 pointer-events-none peer-focus:hidden">
              ДД.ММ.ГГГГ
            </span>
          )}
        </div>

        {/* Дата по — календарь */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">по</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
            lang="ru"
          />
          {!filters.endDate && (
            <span className="absolute left-3 top-9 text-gray-400 pointer-events-none peer-focus:hidden">
              ДД.ММ.ГГГГ
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={fetchHistories} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Поиск
          </button>
          <button onClick={handleReset} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition">
            Сброс (текущий месяц)
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerateReport}
        disabled={exporting}
        className={`min-w-[240px] px-6 py-2 rounded font-semibold transition flex items-center justify-center gap-2 shadow-md mb-6 ${
          exporting
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
        }`}
      >
        {exporting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
            </svg>
            Формируется...
          </>
        ) : (
          <>Скачать отчёт (Excel)</>
        )}
      </button>

      {/* Пагинация */}
      {allHistories.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Показано {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, allHistories.length)} из {allHistories.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400 transition"
            >
              ← Предыдущая
            </button>
            <span className="px-4 py-2">Страница {currentPage} из {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400 transition"
            >
              Следующая →
            </button>
          </div>
        </div>
      )}

      {/* Таблица */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-300">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="border-b-2 border-gray-300">
                <th onClick={() => handleSort("history_number")} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300">
                  № истории{getSortIcon("history_number")}
                </th>
                <th onClick={() => handleSort("patient_full_name")} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300">
                  Пациент{getSortIcon("patient_full_name")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  Дата рождения
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  Адрес
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  Диагноз
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  МКБ-10
                </th>
                <th onClick={() => handleSort("admission_date")} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300">
                  Поступление{getSortIcon("admission_date")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  Выписка
                </th>
                <th onClick={() => handleSort("cax_code_name")} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300">
                  ЦАХ{getSortIcon("cax_code_name")}
                </th>
                <th onClick={() => handleSort("doctor_full_name")} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300">
                  Врач{getSortIcon("doctor_full_name")}
                </th>
                <th onClick={() => handleSort("nurse_full_name")} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300">
                  Медсестра{getSortIcon("nurse_full_name")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistories.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-24 text-center text-gray-500 text-lg border-b border-gray-300">
                    Нет данных по заданным фильтрам
                  </td>
                </tr>
              ) : (
                paginatedHistories.map((h, index) => (
                  <tr 
                  key={h.id}
                  className={`border-b border-gray-300 hover:bg-gray-50 transition cursor-pointer ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50`}
                  onClick={() => navigate(`/history/${h.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-center text-gray-900 border-r border-gray-300">
                      {h.history_number}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-300">
                      {h.patient.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-300">
                      {formatDate(h.patient.birth_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate border-r border-gray-300" title={h.patient.address}>
                      {h.patient.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate border-r border-gray-300" title={h.diagnosis}>
                      {h.diagnosis}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-300">
                      {h.icd10_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300">
                      {formatDate(h.admission_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-300">
                      {h.discharge_date ? formatDate(h.discharge_date) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300">
                      {h.cax_code?.cax_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300">
                      {h.doctor?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300">
                      {h.nurse?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-300">
                      {h.cancelled ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          Отменена
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          Активна
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {h.cancelled ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReactivate(h.id);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-5 py-2 rounded transition shadow"
                        >
                          Активировать
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(h.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-5 py-2 rounded transition shadow"
                        >
                          Отменить
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
