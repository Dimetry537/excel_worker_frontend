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
    <div className="bg-gray-100 px-4 pt-10">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-blue-800 text-center">
          {editingId ? "Редактировать врача" : "Добавить врача"}
        </h2>

        <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ФИО врача"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-lg"
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
              className="bg-gray-500 hover:bg-gray-600 text-white text-lg font-semibold px-6 py-3 rounded-lg"
            >
              Отмена
            </button>
          )}
        </form>

        <ul className="space-y-4">
          {doctors.map((doc) => (
            <li
              key={doc.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <span className="text-lg">{doc.full_name}</span>
              <div className="space-x-4">
                <button
                  onClick={() => handleEdit(doc)}
                  className="text-yellow-600 hover:underline text-lg"
                >
                  ✏️ Редактировать
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-600 hover:underline text-lg"
                >
                  🗑 Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
