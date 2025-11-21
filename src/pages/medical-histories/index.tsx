import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const fetchHistories = async () => {
  const res = await fetch('/medical_history?cancelled=null');
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
};

export default function MedicalHistoriesList() {
  const { data: histories, isLoading } = useQuery({
    queryKey: ['medical-histories'],
    queryFn: fetchHistories,
  });

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Истории болезни (активные)</h1>
      
      <div className="grid gap-4">
        {histories?.map((h: any) => (
          <Link
            key={h.id}
            to={`/medical-histories/${h.id}`}
            className="block p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <div>
                <strong>№ {h.history_number}/{h.admission_date.slice(0,4)}</strong>
                <span className="ml-4 text-blue-600">{h.patient.full_name}</span>
              </div>
              <div className="text-sm text-gray-600">
                Поступление: {format(new Date(h.admission_date), 'dd.MM.yyyy')}
                {h.discharge_date && ` → ${format(new Date(h.discharge_date), 'dd.MM.yyyy')}`}
              </div>
            </div>
            <div className="mt-2 text-sm">
              Диагноз: {h.diagnosis} ({h.icd10_code})
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
