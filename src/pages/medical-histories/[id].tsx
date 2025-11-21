import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

const historySchema = z.object({
  diagnosis: z.string().min(1),
  icd10_code: z.string().min(1),
  discharge_date: z.string().nullable(),
});

type HistoryForm = z.infer<typeof historySchema>;

export default function MedicalHistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ['medical-history', id],
    queryFn: async () => {
      const res = await fetch(`/medical_history/${id}`);
      return res.json();
    },
  });

  const { data: operations = [] } = useQuery({
    queryKey: ['operations', id],
    queryFn: async () => {
      const res = await fetch(`/api/operations/history/${id}`);
      return res.json();
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: HistoryForm) =>
      fetch(`/api/medical_history/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medical-history', id] }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => fetch(`/api/medical_history/${id}/-cancel`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-history', id] });
      queryClient.invalidateQueries({ queryKey: ['medical-histories'] });
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<HistoryForm>({
    resolver: zodResolver(historySchema),
    values: history ? {
      diagnosis: history.diagnosis,
      icd10_code: history.icd10_code,
      discharge_date: history.discharge_date || '',
    } : undefined,
  });

  if (isLoading) return <div>Загрузка...</div>;

  const onSubmit = (data: HistoryForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          История болезни № {history.history_number}/{new Date(history.admission_date).getFullYear()}
          {history.cancelled && <span className="ml-4 text-red-600">ОТМЕНЕНА</span>}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Основные данные */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Пациент и персонал</h2>
          <p><strong>Пациент:</strong> {history.patient.full_name}</p>
          <p><strong>Дата рождения:</strong> {format(new Date(history.patient.birth_date), 'dd.MM.yyyy')}</p>
          <p><strong>Врач:</strong> {history.doctor.full_name}</p>
          <p><strong>Медсестра:</strong> {history.nurse.full_name}</p>
          <p><strong>САХ код:</strong> {history.cax_code.cax_name} ({history.cax_code.cax_code})</p>
        </div>

        {/* Редактируемые поля */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Редактирование</h2>
          
          <div className="space-y-4">
            <div>
              <label>Диагноз</label>
              <textarea {...register('diagnosis')} className="w-full border rounded p-2" rows={3} />
            </div>
            
            <div>
              <label>Код МКБ-10</label>
              <input {...register('icd10_code')} className="w-full border rounded p-2" />
            </div>
            
            <div>
              <label>Дата выписки</label>
              <input type="date" {...register('discharge_date')} className="w-full border rounded p-2" />
            </div>

            <div className="flex gap-4">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Сохранить изменения
              </button>
              
              {!history.cancelled && (
                <button
                  type="button"
                  onClick={() => cancelMutation.mutate()}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Отменить историю
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Операции */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Протоколы операций</h2>
        
        {/* Здесь можно добавить форму добавления новой операции */}
        <AddOperationForm historyId={Number(id)} />

        <div className="mt-6 space-y-4">
          {operations.map((op: any) => (
            <div key={op.id} className="border rounded p-4">
              <h4 className="font-semibold">{op.oper_name}</h4>
              <pre className="mt-2 text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                {op.oper_protocol}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
