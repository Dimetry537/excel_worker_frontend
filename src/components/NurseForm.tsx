import { useState, useEffect } from "react";
import {
  getNurses,
  createNurse,
  updateNurse,
  deleteNurse,
  toggleNurse,
} from "@/api/nurses";
import type { Personal } from "@/types/entities/personal";
import { toast } from "sonner";

export default function NurseForm() {
  const [nurses, setNurses] = useState<Personal[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNurses = async () => {
    setIsLoading(true);
    try {
      const data = await getNurses();
      setNurses(data);
    } catch {
      toast.error("Не удалось загрузить список медсестёр");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Введите ФИО медсестры");
    }

    setIsLoading(true);
    try {
      if (editingId !== null) {
        await updateNurse(editingId, { full_name: name.trim() });
        toast.success("Медсестра успешно обновлена");
        setEditingId(null);
      } else {
        await createNurse({ full_name: name.trim() });
        toast.success("Медсестра успешно добавлена");
      }
      setName("");
      await fetchNurses();
    } catch {
      toast.error("Ошибка при сохранении медсестры");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (nurse: Personal) => {
    setEditingId(nurse.id);
    setName(nurse.full_name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    if (!confirm(currentActive ? "Деактивировать медсестру?" : "Активировать медсестру?")) {
      return;
    }

    try {
      const updated = await toggleNurse(id);
      toast.success(currentActive ? "Медсестра деактивирована" : "Медсестра активирована");
      setNurses(prev => prev.map(n => n.id === id ? updated : n));
    } catch {
      toast.error("Не удалось изменить статус");
    }
  };

  const handleDelete = async (id: number, fullName: string) => {
    if (!confirm(`Удалить медсестру "${fullName}"? Это действие необратимо.`)) {
      return;
    }

    try {
      const deleted = await deleteNurse(id);
      toast.success(`Медсестра "${deleted.full_name}" полностью удалена`);
      await fetchNurses();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "status" in err && (err as {status?: number}).status === 400) {
        const errorData = err as { data?: { detail?: string } };
        toast.info(
          errorData.data?.detail || "Медсестра деактивирована вместо удаления (есть связанные записи)"
        );
        await fetchNurses();
      } else {
        toast.error("Ошибка при удалении медсестры");
      }
    }
  };

  const filteredNurses = nurses.filter(nurse => showInactive || nurse.is_active);

  // Опционально: можно добавить индикатор загрузки
  if (isLoading && nurses.length === 0) {
    return <div>Загрузка медсестёр...</div>;
  }

  return (
      <div>
        <h2>{editingId ? "Редактировать медсестру" : "Добавить медсестру"}</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ФИО медсестры"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "..." : editingId ? "Сохранить" : "Добавить"}
            </button>

            {editingId !== null && (
              <button type="button" onClick={handleCancelEdit}>
                Отмена
              </button>
            )}
          </div>
        </form>

        <div>
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />{" "}
            Показать деактивированных
          </label>
        </div>

        <ul>
          {filteredNurses.map((nurse) => (
            <li key={nurse.id}>
              <span>
                {nurse.full_name}
                {!nurse.is_active && " (неактивна)"}
              </span>

              <div>
                <button onClick={() => handleEdit(nurse)}>✏️ Редактировать</button>

                <button onClick={() => handleToggleActive(nurse.id, nurse.is_active)}>
                  {nurse.is_active ? "🙈 Скрыть" : "👁 Показать"}
                </button>

                <button onClick={() => handleDelete(nurse.id, nurse.full_name)}>
                  🗑 Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>

        {filteredNurses.length === 0 && (
          <p>
            {showInactive
              ? "Нет медсестёр (включая деактивированных)"
              : "Нет активных медсестёр"}
          </p>
        )}
      </div>
    );
  }
