import { useEffect, useState } from "react";
import {
  createNurse,
  getNurses,
  deleteNurse,
  updateNurse,
  toggleNurse,
} from "../api/nurses";
import type { Nurse } from "../api/nurses";

export default function NurseForm() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);

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

  const handleToggleActive = async (id: number) => {
    try {
      await toggleNurse(id);
      await fetchNurses();
    } catch (error) {
      console.error("Ошибка при изменении активности:", error);
    }
  };

  const filteredNurses = showInactive ? nurses : nurses.filter((n) => n.is_active);

  return (
    <div>
      <div>
        <h2>
          {editingId ? "Редактировать медсестру" : "Добавить медсестру"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ФИО медсестры"
          />
          <button
            type="submit"
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
            >
              Отмена
            </button>
          )}
        </form>

        <div>
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Показать скрытых
          </label>
        </div>

        <ul>
          {filteredNurses.map((nurse) => (
            <li
              key={nurse.id}
            >
              <span>{nurse.full_name}</span>
              <div>
                <button
                  onClick={() => handleEdit(nurse)}
                >
                  ✏️ Редактировать
                </button>
                <button
                  onClick={() => handleToggleActive(nurse.id)}
                >
                  {nurse.is_active ? "🙈 Скрыть" : "👁 Показать"}
                </button>
                <button
                  onClick={() => handleDelete(nurse.id)}
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
