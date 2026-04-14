import { useState, useEffect } from 'react';
import axios from 'axios';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 0, name: 'Sunday' },
];

export default function Availability() {
  const [schedule, setSchedule] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    fetchAvailability();
  }, []);

  async function fetchAvailability() {
    try {
      const res = await axios.get('/api/availability');
      setSchedule(res.data.schedule);
      if (res.data.schedule?.timezone) {
        setTimezone(res.data.schedule.timezone);
      }
      
      // Map slots to a more manageable state based on day_of_week
      const hydratedSlots = DAYS_OF_WEEK.map(day => {
        const daySlots = res.data.slots.filter(s => s.day_of_week === day.id);
        return {
          day_of_week: day.id,
          enabled: daySlots.length > 0,
          start_time: daySlots.length > 0 ? daySlots[0].start_time.substring(0, 5) : '09:00',
          end_time: daySlots.length > 0 ? daySlots[0].end_time.substring(0, 5) : '17:00',
        };
      });
      
      setSlots(hydratedSlots);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  const handleSave = async () => {
    try {
      // Filter only enabled days and format
      const payloadSlots = slots
        .filter(s => s.enabled)
        .map(s => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time + ':00',
          end_time: s.end_time + ':00'
        }));

      await axios.post('/api/availability', {
        timezone,
        slots: payloadSlots
      });
      alert('Availability saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save availability');
    }
  };

  const toggleDay = (day_of_week) => {
    setSlots(slots.map(s => s.day_of_week === day_of_week ? { ...s, enabled: !s.enabled } : s));
  };

  const updateTime = (day_of_week, field, value) => {
    setSlots(slots.map(s => s.day_of_week === day_of_week ? { ...s, [field]: value } : s));
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <p className="text-sm text-gray-500 mt-1">Configure times when you are available for bookings</p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="font-semibold text-gray-900">Weekly hours</h2>
            <p className="text-sm text-gray-500">Define your standard working hours</p>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="border border-gray-300 rounded-md p-1.5 text-sm focus:ring-1 focus:ring-black outline-none bg-white"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris / Berlin</option>
              <option value="Asia/Kolkata">India Standard Time</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
        </div>
        
        <div className="p-6 border-b">
          
          <div className="space-y-4">
            {slots.map(slot => {
              const dayName = DAYS_OF_WEEK.find(d => d.id === slot.day_of_week).name;
              return (
                <div key={slot.day_of_week} className="flex flex-col sm:flex-row sm:items-center py-2 sm:py-0 space-y-2 sm:space-y-0">
                  <div className="w-40 flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                        checked={slot.enabled}
                        onChange={() => toggleDay(slot.day_of_week)}
                      />
                      <span className={`ml-3 text-sm font-medium ${slot.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                        {dayName}
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex-1 flex items-center space-x-2">
                    {slot.enabled ? (
                      <>
                        <input 
                          type="time" 
                          className="border rounded-md px-3 py-1.5 text-sm focus:ring-black focus:border-black"
                          value={slot.start_time}
                          onChange={(e) => updateTime(slot.day_of_week, 'start_time', e.target.value)}
                        />
                        <span className="text-gray-500">-</span>
                        <input 
                          type="time" 
                          className="border rounded-md px-3 py-1.5 text-sm focus:ring-black focus:border-black"
                          value={slot.end_time}
                          onChange={(e) => updateTime(slot.day_of_week, 'end_time', e.target.value)}
                        />
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Unavailable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 flex justify-end">
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
