import { useEffect, useState } from "react";
import { getMedicalHistoriesFiltered, cancelMedicalHistory, reactivateMedicalHistory } from "../api/medicalHistory";
import type { MedicalHistory } from "../api/medicalHistory";
import { formatDate } from "../utils/formatDate";

export default function Home() {
  const [histories, setHistories] = useState<MedicalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof MedicalHistory | "cax_code.cax_name" | "doctor.full_name" | "nurse.full_name" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isSorted, setIsSorted] = useState(false);

  const fetchHistories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMedicalHistoriesFiltered(fullName, admissionDate);
      setHistories(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Неизвестная ошибка при загрузке историй");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (historyId: number) => {
    try {
      await cancelMedicalHistory(historyId);
      await fetchHistories();
      alert("История успешно отменена");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Ошибка при отмене истории");
      }
    }
  };

  const handleReactivate = async (historyId: number) => {
    try {
      await reactivateMedicalHistory(historyId);
      await fetchHistories();
      alert("История успешно активирована");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Ошибка при активации истории");
      }
    }
  };

  const handleSort = (column: keyof MedicalHistory | "cax_code.cax_name" | "doctor.full_name" | "nurse.full_name") => {
    if (sortColumn === column && isSorted) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setIsSorted(false);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
      setIsSorted(true);
    }
  };

  const sortedHistories = isSorted && sortColumn ? [...histories].sort((a, b) => {
    let valueA: string | number | undefined;
    let valueB: string | number | undefined;

    switch (sortColumn) {
      case "cax_code.cax_name":
        valueA = a.cax_code?.cax_name || "";
        valueB = b.cax_code?.cax_name || "";
        break;
      case "doctor.full_name":
        valueA = a.doctor?.full_name || "";
        valueB = b.doctor?.full_name || "";
        break;
      case "nurse.full_name":
        valueA = a.nurse?.full_name || "";
        valueB = b.nurse?.full_name || "";
        break;
      case "cancelled":
        valueA = a.cancelled || "";
        valueB = b.cancelled || "";
        break;
      case "history_number":
      case "id":
        valueA = a[sortColumn];
        valueB = b[sortColumn];
        break;
      case "full_name":
      case "address":
      case "diagnosis":
      case "icd10_code":
      case "admission_date":
      case "discharge_date":
      case "birth_date":
        valueA = a[sortColumn] || "";
        valueB = b[sortColumn] || "";
        break;
      default:
        valueA = "";
        valueB = "";
        break;
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }
    if (sortColumn === "admission_date" || sortColumn === "discharge_date" || sortColumn === "birth_date") {
      const dateA = valueA ? new Date(valueA).getTime() : 0;
      const dateB = valueB ? new Date(valueB).getTime() : 0;
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    return sortDirection === "asc"
      ? String(valueA).localeCompare(String(valueB), "ru")
      : String(valueB).localeCompare(String(valueA), "ru");
  }) : histories;

  useEffect(() => {
    fetchHistories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistories();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Добро пожаловать в систему Excel Worker
      </h1>
      <p className="text-lg text-center mb-8">
        Выберите раздел из меню выше или просмотрите список историй пациентов:
      </p>

      <form
        onSubmit={handleSearch}
        className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end"
      >
        <div className="w-[500px]">
          <label className="block text-sm font-medium mb-1">ФИО пациента</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Введите фамилию или имя"
          />
        </div>
        <div className="w-[500px]">
          <label className="block text-sm font-medium mb-1">Дата поступления</label>
          <input
            type="date"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Найти
        </button>
        <button
          type="button"
          onClick={() => {
            setFullName("");
            setAdmissionDate("");
            fetchHistories();
          }}
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
        >
          Сбросить
        </button>
      </form>

      {error && <div className="text-red-600 mb-4 text-center">{error}</div>}

      {loading ? (
        <p className="text-center">Загрузка...</p>
      ) : histories.length === 0 ? (
        <p className="text-center text-gray-500">Нет сохранённых историй</p>
      ) : (
        <div className="overflow-x-auto mt-16">
          <table className="table-auto border-collapse border border-gray-300 max-w-5xl mx-auto">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("history_number")}
                >
                  № истории {sortColumn === "history_number" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("full_name")}
                >
                  ФИО {sortColumn === "full_name" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("birth_date")}
                >
                  Дата рождения {sortColumn === "birth_date" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("address")}
                >
                  Адрес {sortColumn === "address" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("diagnosis")}
                >
                  Диагноз {sortColumn === "diagnosis" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("icd10_code")}
                >
                  Код МКБ-10 {sortColumn === "icd10_code" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("admission_date")}
                >
                  Поступление {sortColumn === "admission_date" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("discharge_date")}
                >
                  Выписка {sortColumn === "discharge_date" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("cax_code.cax_name")}
                >
                  ЦАХ {sortColumn === "cax_code.cax_name" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("doctor.full_name")}
                >
                  Врач {sortColumn === "doctor.full_name" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("nurse.full_name")}
                >
                  Медсестра {sortColumn === "nurse.full_name" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th
                  className="border px-3 py-2 cursor-pointer"
                  onClick={() => handleSort("cancelled")}
                >
                  Статус {sortColumn === "cancelled" && isSorted && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th className="border px-3 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistories.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2 text-center">{h.history_number}</td>
                  <td className="border px-3 py-2">{h.full_name}</td>
                  <td className="border px-3 py-2">{formatDate(h.birth_date)}</td>
                  <td className="border px-3 py-2 truncate max-w-[12rem]">{h.address}</td>
                  <td className="border px-3 py-2 truncate max-w-[14rem]">{h.diagnosis}</td>
                  <td className="border px-3 py-2">{h.icd10_code}</td>
                  <td className="border px-3 py-2">{formatDate(h.admission_date)}</td>
                  <td className="border px-3 py-2">{formatDate(h.discharge_date)}</td>
                  <td className="border px-3 py-2">{h.cax_code?.cax_name}</td>
                  <td className="border px-3 py-2">{h.doctor?.full_name}</td>
                  <td className="border px-3 py-2">{h.nurse?.full_name}</td>
                  <td className="border px-3 py-2">{h.cancelled || "Активна"}</td>
                  <td className="border px-3 py-2">
                    {h.cancelled ? (
                      <button
                        onClick={() => handleReactivate(h.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Активировать
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancel(h.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                      >
                        Отменить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
