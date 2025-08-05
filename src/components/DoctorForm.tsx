import { useEffect, useState } from "react";
import {
  createDoctor,
  getDoctors,
  deleteDoctor,
  updateDoctor,
} from "../api/doctors";
import type { Doctor } from "../api/doctors";

export default function DoctorForm() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error("Ошибка загрузки врачей:", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await updateDoctor(editingId, { full_name: name });
        setEditingId(null);
      } else {
        await createDoctor({ full_name: name });
      }
      setName("");
      await fetchDoctors();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить врача?")) return;
    try {
      await deleteDoctor(id);
      await fetchDoctors();
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setName(doctor.full_name);
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="text-lg font-semibold mb-2">
        {editingId ? "Редактировать врача" : "Добавить врача"}
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-2 py-1 flex-1"
          placeholder="ФИО врача"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          {editingId ? "Сохранить" : "Добавить"}
        </button>
        {editingId !== null && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
            className="bg-gray-500 text-white px-4 py-1 rounded"
          >
            Отмена
          </button>
        )}
      </form>

      <ul className="list-disc pl-6 space-y-2">
        {doctors.map((doc) => (
          <li key={doc.id} className="flex justify-between items-center">
            <span>{doc.full_name}</span>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(doc)}
                className="text-sm text-yellow-600 hover:underline"
              >
                ✏️ Редактировать
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-sm text-red-600 hover:underline"
              >
                🗑 Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
