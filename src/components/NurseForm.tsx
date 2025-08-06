import { useEffect, useState } from "react";
import {
  createNurse,
  getNurses,
  deleteNurse,
  updateNurse,
} from "../api/nurses";
import type { Nurse } from "../api/nurses";

export default function NurseForm() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchNurses = async () => {
    try {
      const data = await getNurses();
      setNurses(data);
    } catch (error) {
      console.error("Ошибка загрузки медсестёр:", error);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await updateNurse(editingId, { full_name: name });
        setEditingId(null);
      } else {
        await createNurse({ full_name: name });
      }
      setName("");
      await fetchNurses();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить медсестру?")) return;
    try {
      await deleteNurse(id);
      await fetchNurses();
    } catch (error) {
      console.error("Ошибка при удалении:", error);
    }
  };

  const handleEdit = (nurse: Nurse) => {
    setEditingId(nurse.id);
    setName(nurse.full_name);
  };

  return (
    <div className="bg-gray-100 p-10">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-blue-800 text-center">
          {editingId ? "Редактировать медсестру" : "Добавить медсестру"}
        </h2>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-base"
            placeholder="ФИО медсестры"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {editingId ? "Сохранить" : "Добавить"}
          </button>
        </form>

        <ul className="space-y-3">
          {nurses.map((nurse) => (
            <li
              key={nurse.id}
              className="flex justify-between items-center border-b pb-1"
            >
              <span>{nurse.full_name}</span>
              <div className="space-x-3">
                <button
                  onClick={() => handleEdit(nurse)}
                  className="text-yellow-600 hover:underline"
                >
                  ✏️ Редактировать
                </button>
                <button
                  onClick={() => handleDelete(nurse.id)}
                  className="text-red-600 hover:underline"
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
