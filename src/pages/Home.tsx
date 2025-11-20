import { useEffect, useState } from "react";
import {
  getMedicalHistoriesFiltered,
  cancelMedicalHistory,
  reactivateMedicalHistory,
} from "../api/medicalHistory";
import type { MedicalHistoryRead } from "../api/medicalHistory";
import { formatDate } from "../utils/formatDate";

export default function Home() {
  const [histories, setHistories] = useState<MedicalHistoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const getSortValue = (h: MedicalHistoryRead, column: SortableField): string | number | Date | null => {
    switch (column) {
      case "history_number":
        return h.history_number;
      case "patient_full_name":
        return h.patient.full_name.toLowerCase();
      case "admission_date":
        return h.admission_date || "";
      case "discharge_date":
        return h.discharge_date || "";
      case "diagnosis":
        return h.diagnosis.toLowerCase();
      case "icd10_code":
        return h.icd10_code;
      case "cax_code_name":
        return h.cax_code?.cax_name?.toLowerCase() || "";
      case "doctor_full_name":
        return h.doctor?.full_name?.toLowerCase() || "";
      case "nurse_full_name":
        return h.nurse?.full_name?.toLowerCase() || "";
      default:
        return "";
    }
  };

  const fetchHistories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedicalHistoriesFiltered({
        full_name: fullName.trim() || undefined,
        start_date: startDate.trim() || undefined,
        end_date: endDate.trim() || undefined,
      });
      setHistories(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (sortColumn === col) {
      return sortDirection === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  const sortedHistories = [...histories].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = getSortValue(a, sortColumn);
    const bVal = getSortValue(b, sortColumn);
    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6">Истории болезни</h1>

      {/* Фильтры */}
      <div className="bg-white p-5 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
        <div className="min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">ФИО пациента</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Иванов Иван Иванович"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата поступления с</label>
          <input
            type="text"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="01.01.2025 или 2025-01-01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">по</label>
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="31.12.2025"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchHistories}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Поиск
          </button>
          <button
            onClick={() => {
              setFullName("");
              setStartDate("");
              setEndDate("");
              fetchHistories();
            }}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            Сброс
          </button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Таблица с полной жирной сеткой (как в Excel) */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-300">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="border-b-2 border-gray-300">
                <th
                  onClick={() => handleSort("history_number")}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300 last:border-r-0"
                >
                  № истории{getSortIcon("history_number")}
                </th>
                <th
                  onClick={() => handleSort("patient_full_name")}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300 last:border-r-0"
                >
                  Пациент{getSortIcon("patient_full_name")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0">
                  Дата рождения
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0">
                  Адрес
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0">
                  Диагноз
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0">
                  МКБ-10
                </th>
                <th
                  onClick={() => handleSort("admission_date")}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300 last:border-r-0"
                >
                  Поступление{getSortIcon("admission_date")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0">
                  Выписка
                </th>
                <th
                  onClick={() => handleSort("cax_code_name")}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300 last:border-r-0"
                >
                  ЦАХ{getSortIcon("cax_code_name")}
                </th>
                <th
                  onClick={() => handleSort("doctor_full_name")}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300 last:border-r-0"
                >
                  Врач{getSortIcon("doctor_full_name")}
                </th>
                <th
                  onClick={() => handleSort("nurse_full_name")}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition border-r border-gray-300 last:border-r-0"
                >
                  Медсестра{getSortIcon("nurse_full_name")}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-300 last:border-r-0">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHistories.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-24 text-center text-gray-500 text-lg border-b border-gray-300">
                    Нет данных по заданным фильтрам
                  </td>
                </tr>
              ) : (
                sortedHistories.map((h, index) => (
                  <tr
                    key={h.id}
                    className={`border-b border-gray-300 hover:bg-gray-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-center text-gray-900 border-r border-gray-300 last:border-r-0">
                      {h.history_number}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-300 last:border-r-0">
                      {h.patient.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-300 last:border-r-0">
                      {formatDate(h.patient.birth_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate border-r border-gray-300 last:border-r-0" title={h.patient.address}>
                      {h.patient.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate border-r border-gray-300 last:border-r-0" title={h.diagnosis}>
                      {h.diagnosis}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-300 last:border-r-0">
                      {h.icd10_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300 last:border-r-0">
                      {formatDate(h.admission_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-300 last:border-r-0">
                      {h.discharge_date ? formatDate(h.discharge_date) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300 last:border-r-0">
                      {h.cax_code?.cax_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300 last:border-r-0">
                      {h.doctor?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-300 last:border-r-0">
                      {h.nurse?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-center border-r border-gray-300 last:border-r-0">
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
                          onClick={() => handleReactivate(h.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-5 py-2 rounded transition shadow"
                        >
                          Активировать
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCancel(h.id)}
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
