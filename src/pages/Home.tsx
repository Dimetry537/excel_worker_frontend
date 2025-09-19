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
                <th className="border px-3 py-2">№ истории</th>
                <th className="border px-3 py-2">ФИО</th>
                <th className="border px-3 py-2">Дата рождения</th>
                <th className="border px-3 py-2">Адрес</th>
                <th className="border px-3 py-2">Диагноз</th>
                <th className="border px-3 py-2">Код МКБ-10</th>
                <th className="border px-3 py-2">Поступление</th>
                <th className="border px-3 py-2">Выписка</th>
                <th className="border px-3 py-2">ЦАХ</th>
                <th className="border px-3 py-2">Врач</th>
                <th className="border px-3 py-2">Медсестра</th>
                <th className="border px-3 py-2">Статус</th>
                <th className="border px-3 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {histories.map((h) => (
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
