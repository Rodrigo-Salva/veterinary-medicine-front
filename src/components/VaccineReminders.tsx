import React, { useEffect, useState } from 'react';
import { vaccineService } from '../services/api';
import { VaccineReminder } from '../types';
import { Syringe, Calendar, AlertCircle } from 'lucide-react';

const VaccineReminders: React.FC = () => {
  const [reminders, setReminders] = useState<VaccineReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const data = await vaccineService.getUpcoming(30);
        setReminders(data);
      } catch (error) {
        console.error('Error fetching vaccine reminders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, []);

  if (loading) return <div className="p-4 animate-pulse">Cargando recordatorios...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <AlertCircle className="text-amber-500" size={20} />
          Próximas Vacunas y Refuerzos
        </h3>
        <span className="text-xs text-gray-500">Próximos 30 días</span>
      </div>

      {reminders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No hay vacunas programadas pronto.</p>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{reminder.pet_name}</p>
                  <p className="text-xs text-gray-600">{reminder.record_type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-700">
                  {new Date(reminder.next_date).toLocaleDateString()}
                </p>
                <p className="text-[10px] text-amber-600 uppercase font-semibold">Pendiente</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VaccineReminders;
