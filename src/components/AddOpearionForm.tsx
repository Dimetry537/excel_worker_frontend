import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function AddOperationForm({ historyId }: { historyId: number }) {
  const [name, setName] = useState('');
  const [protocol, setProtocol] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => fetch('/api/operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oper_name: name,
        oper_protocol: protocol,
        medical_history_id: historyId,
      }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', historyId] });
      setName('');
      setProtocol('');
    },
  });

  return (
    <div className="border-2 border-dashed rounded-lg p-6 mb-6">
      <h3 className="font-semibold mb-4">Добавить протокол операции</h3>
      <input
        placeholder="Название операции"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      />
      <textarea
        placeholder="Протокол операции..."
        value={protocol}
        onChange={e => setProtocol(e.target.value)}
        rows={6}
        className="w-full border rounded p-2 mb-3"
      />
      <button
        onClick={() => mutation.mutate()}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Добавить операцию
      </button>
    </div>
  );
}
