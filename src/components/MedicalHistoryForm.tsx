import { useState, useEffect } from "react";
import {
  createMedicalHistory,
  getCaxCodes,
  getDoctors,
  getNurses,
  searchPatients,
} from "../api/medicalHistory";
import type { MedicalHistoryCreate, Patient } from "../api/medicalHistory";

export default function MedicalHistoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState<MedicalHistoryCreate>({
    admission_date: "",
    discharge_date: "",
    full_name: "",
    birth_date: "",
    address: "",
    diagnosis: "",
    icd10_code: "",
    cax_code_id: 0,
    doctor_id: 0,
    nurse_id: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caxCodes, setCaxCodes] = useState<{ id: number; cax_name: string }[]>([]);
  const [doctors, setDoctors] = useState<{ id: number; full_name: string }[]>([]);
  const [nurses, setNurses] = useState<{ id: number; full_name: string }[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchParams, setSearchParams] = useState({
    lastname: "",
    firstname: "",
    secondname: "",
    birthdate: "",
    address: "",
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    getCaxCodes().then(setCaxCodes);
    getDoctors().then(setDoctors);
    getNurses().then(setNurses);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: name === "lastname" ? 
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : 
        value,
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmptyQuery = Object.values(searchParams).every(param => !param || param.trim() === "");
    if (isEmptyQuery) {
      setSearchError("Введите хотя бы один параметр поиска");
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      // Преобразование даты из YYYY-MM-DD в DD.MM.YYYY, если она введена
      let formattedBirthdate = searchParams.birthdate;
      if (formattedBirthdate) {
        const [year, month, day] = formattedBirthdate.split("-");
        formattedBirthdate = `${day}.${month}.${year}`;
      }
      const result = await searchPatients(
        searchParams.lastname || undefined,
        searchParams.firstname || undefined,
        searchParams.secondname || undefined,
        formattedBirthdate || undefined,
        searchParams.address || undefined
      );
      if (Array.isArray(result)) {
        setPatients(result);
      } else {
        setSearchError(result.error);
        setPatients([]);
      }
    } catch (e: unknown) {
      setSearchError(e instanceof Error ? e.message : "Ошибка при поиске пациентов");
      setPatients([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    // Преобразование даты из DD.MM.YYYY в YYYY-MM-DD
    const [day, month, year] = patient.birthdate.split(".");
    const formattedBirthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    setForm(prev => ({
      ...prev,
      full_name: patient.pname,
      birth_date: formattedBirthDate,
      address: patient.address,
    }));
    setPatients([]);
    setSearchParams({
      lastname: "",
      firstname: "",
      secondname: "",
      birthdate: "",
      address: "",
    });
  };

  const handleClearSearch = () => {
    setSearchParams({
      lastname: "",
      firstname: "",
      secondname: "",
      birthdate: "",
      address: "",
    });
    setPatients([]);
    setSearchError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createMedicalHistory({
        ...form,
        cax_code_id: Number(form.cax_code_id),
        doctor_id: Number(form.doctor_id),
        nurse_id: Number(form.nurse_id),
      });
      setForm({
        admission_date: "",
        discharge_date: "",
        full_name: "",
        birth_date: "",
        address: "",
        diagnosis: "",
        icd10_code: "",
        cax_code_id: 0,
        doctor_id: 0,
        nurse_id: 0,
      });
      if (onSuccess) onSuccess();
      alert("История успешно сохранена");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row gap-6 w-auto max-w-4xl">
        {/* Форма поиска пациентов */}
        <div className="w-auto md:w-1/2 bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Поиск пациента</h3>
          <form onSubmit={handleSearch}>
            <div className="mb-3">
              <label className="block mb-1">Фамилия</label>
              <input
                name="lastname"
                value={searchParams.lastname}
                onChange={handleSearchChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Имя</label>
              <input
                name="firstname"
                value={searchParams.firstname}
                onChange={handleSearchChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Отчество</label>
              <input
                name="secondname"
                value={searchParams.secondname}
                onChange={handleSearchChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Дата рождения</label>
              <input
                name="birthdate"
                type="date"
                value={searchParams.birthdate}
                onChange={handleSearchChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Адрес</label>
              <input
                name="address"
                value={searchParams.address}
                onChange={handleSearchChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                disabled={searchLoading}
              >
                {searchLoading ? "Поиск..." : "Найти пациента"}
              </button>
              <button
                type="button"
                onClick={handleClearSearch}
                className="w-full bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                disabled={searchLoading}
              >
                Очистить
              </button>
            </div>
          </form>

          {searchError && <div className="text-red-600 mt-2">{searchError}</div>}
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">
              {patients.length > 0
                ? `Найдено пациентов: ${patients.length} (показаны первые 100)`
                : "Пациенты не найдены (показаны первые 100)"}
            </h4>
            {patients.length > 0 && (
              <ul className="border rounded max-h-60 overflow-y-auto">
                {patients.map((patient, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    {patient.pname} (Дата рождения: {patient.birthdate}, Адрес: {patient.address})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Форма создания медицинской истории */}
        <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 text-blue-800">Добавить историю болезни</h2>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block mb-1">ФИО пациента</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Дата рождения</label>
              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Адрес</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Диагноз</label>
              <input
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Код МКБ-10</label>
              <input
                name="icd10_code"
                value={form.icd10_code}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Дата поступления</label>
              <input
                type="date"
                name="admission_date"
                value={form.admission_date}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Дата выписки</label>
              <input
                type="date"
                name="discharge_date"
                value={form.discharge_date || ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Код ЦАХ</label>
              <select
                name="cax_code_id"
                value={form.cax_code_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value={0}>Выберите код</option>
                {caxCodes.map(cax => (
                  <option key={cax.id} value={cax.id}>
                    {cax.cax_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Врач</label>
              <select
                name="doctor_id"
                value={form.doctor_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value={0}>Выберите врача</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Медсестра</label>
              <select
                name="nurse_id"
                value={form.nurse_id}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              >
                <option value={0}>Выберите медсестру</option>
                {nurses.map(nurse => (
                  <option key={nurse.id} value={nurse.id}>
                    {nurse.full_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
