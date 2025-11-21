import { useState, useEffect } from "react";
import {
  createMedicalHistory,
  searchPatients,
  suggestDischargeDate,
} from "../api/medicalHistory";
import { getCaxCodes } from "../api/caxCodes";
import { getDoctors } from "../api/doctors";
import { getNurses } from "../api/nurses";

import type { CaxCode } from "../api/caxCodes";
import type { Personal } from "../api/personal";
import type { OraclePatient } from "@/types/oraclePatients";
import { toIsoDateSafe } from "@/utils/formatDate";

interface MedicalHistoryCreatePayload {
  admission_date: string;
  discharge_date?: string | null;
  full_name: string;
  birth_date: string;
  address: string;
  workplace?: string | null;
  diagnosis: string;
  icd10_code: string;
  cax_code_id: number;
  doctor_id: number;
  nurse_id: number;
}

export default function MedicalHistoryForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [caxCodes, setCaxCodes] = useState<CaxCode[]>([]);
  const [doctors, setDoctors] = useState<Personal[]>([]);
  const [nurses, setNurses] = useState<Personal[]>([]);
  const [patients, setPatients] = useState<OraclePatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<OraclePatient | null>(null);

  const [form, setForm] = useState({
    admission_date: "",
    discharge_date: "",
    diagnosis: "",
    icd10_code: "",
    cax_code_id: 0,
    doctor_id: 0,
    nurse_id: 0,
    patient_full_name: "",
    patient_birth_date: "",
    patient_address: "",
    patient_workplace: "",
  });

  const [searchParams, setSearchParams] = useState({
    lastname: "",
    firstname: "",
    secondname: "",
    birthdate: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCaxCodes(), getDoctors(), getNurses()])
      .then(([cax, docs, nurs]) => {
        setCaxCodes(cax);
        setDoctors(docs);
        setNurses(nurs);
      })
      .catch(() => setError("Ошибка загрузки справочников"));
  }, []);

  useEffect(() => {
    if (form.admission_date && form.cax_code_id > 0) {
      setSuggestLoading(true);
      suggestDischargeDate({
        admission_date: form.admission_date,
        cax_code_id: form.cax_code_id,
      })
        .then((res) =>
          setForm((prev) => ({ ...prev, discharge_date: res.discharge_date }))
        )
        .catch(() => {})
        .finally(() => setSuggestLoading(false));
    }
  }, [form.admission_date, form.cax_code_id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasValue = Object.values(searchParams).some((v) => v.trim());
    if (!hasValue) {
      setSearchError("Заполните хотя бы одно поле для поиска");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const result = await searchPatients(searchParams);
      if ("error" in result) {
        setSearchError(result.error);
        setPatients([]);
      } else {
        setPatients(result);
      }
    } catch {
      setSearchError("Ошибка соединения с Oracle");
      setPatients([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPatient = (patient: OraclePatient) => {
    const workplace = [patient.lastworkplace, patient.position]
      .filter(Boolean)
      .join(", ");

    setSelectedPatient(patient);
    setForm((prev) => ({
      ...prev,
      patient_full_name: patient.pname,
      patient_birth_date: patient.birthdate,
      patient_address: patient.address || "",
      patient_workplace: workplace || "Не указано",
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setError("Сначала выберите пациента из поиска");
      return;
    }

    setLoading(true);
    setError(null);

    const payload: MedicalHistoryCreatePayload = {
      admission_date: form.admission_date,
      discharge_date: form.discharge_date || null,
      full_name: form.patient_full_name,
      birth_date: toIsoDateSafe(form.patient_birth_date),
      address: form.patient_address,
      workplace:
        form.patient_workplace === "Не указано" ? null : form.patient_workplace,
      diagnosis: form.diagnosis,
      icd10_code: form.icd10_code,
      cax_code_id: Number(form.cax_code_id),
      doctor_id: Number(form.doctor_id),
      nurse_id: Number(form.nurse_id),
    };

    try {
      await createMedicalHistory(payload);
      onSuccess?.();
      setForm({
        admission_date: "",
        discharge_date: "",
        diagnosis: "",
        icd10_code: "",
        cax_code_id: 0,
        doctor_id: 0,
        nurse_id: 0,
        patient_full_name: "",
        patient_birth_date: "",
        patient_address: "",
        patient_workplace: "",
      });
      setSelectedPatient(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Не удалось создать медицинскую историю";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[360px] mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Создание медицинской истории</h2>

      {/* Поиск пациента в Oracle */}
      <div className="mb-8 p-5 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Поиск пациента</h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Фамилия" name="lastname" value={searchParams.lastname} onChange={(e) => setSearchParams(p => ({ ...p, lastname: e.target.value }))} className="border rounded px-3 py-2" />
          <input placeholder="Имя" name="firstname" value={searchParams.firstname} onChange={(e) => setSearchParams(p => ({ ...p, firstname: e.target.value }))} className="border rounded px-3 py-2" />
          <input placeholder="Отчество" name="secondname" value={searchParams.secondname} onChange={(e) => setSearchParams(p => ({ ...p, secondname: e.target.value }))} className="border rounded px-3 py-2" />
          <input placeholder="ДД.ММ.ГГГГ" name="birthdate" value={searchParams.birthdate} onChange={(e) => setSearchParams(p => ({ ...p, birthdate: e.target.value }))} className="border rounded px-3 py-2" />
          <input placeholder="Адрес" name="address" value={searchParams.address} onChange={(e) => setSearchParams(p => ({ ...p, address: e.target.value }))} className="border rounded px-3 py-2 md:col-span-2" />
          <button type="submit" disabled={searchLoading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
            {searchLoading ? "Поиск..." : "Найти"}
          </button>
        </form>

        {searchError && <p className="text-red-600 mt-3">{searchError}</p>}
        {patients.length > 0 && (
          <div className="mt-4 border rounded bg-white max-h-64 overflow-y-auto">
            {patients.map((p, i) => (
              <div key={i} onClick={() => handleSelectPatient(p)} className="p-3 border-b hover:bg-gray-100 cursor-pointer">
                <strong>{p.pname}</strong> | {p.birthdate} | {p.address || "—"}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Инфо о выбранном пациенте */}
      {selectedPatient && (
        <div className="mb-6 p-4 bg-blue-50 border rounded">
          <p><strong>Пациент:</strong> {form.patient_full_name}</p>
          <p><strong>Дата рождения:</strong> {form.patient_birth_date}</p>
          <p><strong>Адрес:</strong> {form.patient_address || "—"}</p>
          <p><strong>Место работы:</strong> {form.patient_workplace}</p>
        </div>
      )}

      {/* Основная форма */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-medium">Код ЦАХ *</label>
            <select name="cax_code_id" value={form.cax_code_id} onChange={handleChange} required className="w-full border rounded px-3 py-2">
              <option value={0}>Выберите</option>
              {caxCodes.map(c => <option key={c.id} value={c.id}>{c.cax_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium">Дата поступления *</label>
            <input type="date" name="admission_date" value={form.admission_date} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium">Дата выписки {suggestLoading && "(расчёт...)"}</label>
            <input type="date" name="discharge_date" value={form.discharge_date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            <p className="text-xs text-gray-600 mt-1">Авторасчёт по коду ЦАХ (с учётом выходных и праздников)</p>
          </div>
        </div>

        <div>
          <label className="block font-medium">Диагноз *</label>
          <input type="text" name="diagnosis" value={form.diagnosis} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block font-medium">Код МКБ-10 *</label>
          <input type="text" name="icd10_code" value={form.icd10_code} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block font-medium">Врач *</label>
            <select name="doctor_id" value={form.doctor_id} onChange={handleChange} required className="w-full border rounded px-3 py-2">
              <option value={0}>Выберите</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-medium">Медсестра *</label>
            <select name="nurse_id" value={form.nurse_id} onChange={handleChange} required className="w-full border rounded px-3 py-2">
              <option value={0}>Выберите</option>
              {nurses.map(n => <option key={n.id} value={n.id}>{n.full_name}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading || !selectedPatient || form.cax_code_id === 0 || form.doctor_id === 0 || form.nurse_id === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded disabled:opacity-50"
        >
          {loading ? "Сохранение..." : "Создать историю болезни"}
        </button>
      </form>
    </div>
  );
}
