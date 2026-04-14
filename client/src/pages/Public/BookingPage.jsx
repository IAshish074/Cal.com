import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { format, addDays, getDaysInMonth, startOfMonth, getDay, isBefore, startOfToday, isSameDay } from 'date-fns';
import { Clock, ArrowLeft, Calendar as CalendarIcon, Video } from 'lucide-react';

export default function BookingPage() {
  const { username, slug } = useParams();
  const [eventType, setEventType] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [form, setForm] = useState({ name: '', email: '' });
  const [bookingStatus, setBookingStatus] = useState('calendar'); 

  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));

  async function fetchEventType() {
    try {
      const res = await axios.get(`/api/event-types/${username}/${slug}`);
      setEventType(res.data);
    } catch (err) {
      console.error('Event not found');
    }
  }

  useEffect(() => {
    fetchEventType();
  }, [slug]);

  async function fetchSlots(date) {
    setLoadingSlots(true);
    setAvailableSlots([]);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await axios.get(`/api/public/slots?username=${username}&slug=${slug}&date=${dateStr}`);
      setAvailableSlots(res.data.slots);
    } catch (err) {
      console.error(err);
    }
    setLoadingSlots(false);
  }

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate]);

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      const startObj = new Date(selectedSlot);
      const endObj = new Date(startObj.getTime() + eventType.duration_minutes * 60000);
      
      const payload = {
        event_type_id: eventType.id,
        booker_name: form.name,
        booker_email: form.email,
        start_time: format(startObj, "yyyy-MM-dd HH:mm:ss"),
        end_time: format(endObj, "yyyy-MM-dd HH:mm:ss"),
      };

      await axios.post('/api/bookings', payload);
      setBookingStatus('success');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to book slot. It might be taken.');
      setBookingStatus('calendar');
      fetchSlots(selectedDate);
    }
  };

  
  const daysInMonth = getDaysInMonth(currentMonth);
  const startingDayOfWeek = getDay(currentMonth);
  const calendarDays = [];
  
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    calendarDays.push(d);
  }

  if (!eventType) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (bookingStatus === 'success') {
    return (
      <div className="flex min-h-screen bg-gray-50 flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Booking Confirmed</h2>
          <p className="text-gray-600 mb-6">You are scheduled with {username}. A calendar invitation has been sent to your email.</p>
          
          <div className="border border-gray-200 rounded-lg p-4 text-left mb-6">
            <h3 className="font-semibold text-lg">{eventType.title}</h3>
            <div className="text-gray-500 mt-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {format(new Date(selectedSlot), 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="text-gray-500 mt-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {format(new Date(selectedSlot), 'h:mm a')}
            </div>
          </div>
          
          <Link to={`/${username}`} className="text-blue-600 hover:text-blue-800 font-medium">Return to profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center py-10 px-4">
      <div className="bg-white max-w-5xl w-full rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
        
      
        <div className="w-full md:w-1/3 bg-white p-6 md:p-8 md:border-r border-b md:border-b-0 border-gray-200 shrink-0">
          <Link to={`/${username}`} className="text-gray-500 hover:text-gray-900 inline-block mb-6 pt-1">
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center border font-bold">
              {username?.charAt(0) || 'A'}
            </div>
          </Link>
          <div className="text-gray-500 font-medium mb-1 capitalize">{username}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{eventType.title}</h1>
          
          <div className="flex flex-col space-y-3 text-gray-600">
            <div className="flex items-center text-sm font-medium">
              <Clock className="w-5 h-5 mr-3 text-gray-400" />
              {eventType.duration_minutes} min
            </div>
            <div className="flex items-center text-sm font-medium">
              <Video className="w-5 h-5 mr-3 text-gray-400" />
              Web conferencing details provided upon confirmation.
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600 break-words leading-relaxed">
            {eventType.description}
          </div>
        </div>

       
        <div className="flex-1 bg-white p-6 md:p-8">
          {bookingStatus === 'form' ? (
            <div className="max-w-md animate-fade-in">
              <button 
                onClick={() => setBookingStatus('calendar')} 
                className="flex items-center text-gray-500 hover:text-black mb-6 transition"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              
              <h2 className="text-xl font-bold mb-1">Enter Details</h2>
              <div className="text-gray-600 mb-6 font-medium">
                {format(new Date(selectedSlot), 'EEEE, MMMM d, yyyy')} <br/>
                {format(new Date(selectedSlot), 'h:mm a')} - {format(new Date(new Date(selectedSlot).getTime() + eventType.duration_minutes * 60000), 'h:mm a')}
              </div>

              <form onSubmit={submitBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none transition" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full border border-gray-300 rounded-md p-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none transition" 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-black text-white font-medium py-3 rounded-md hover:bg-gray-800 transition">
                    Schedule Event
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-6">Select a Date & Time</h2>
              <div className="flex flex-col lg:flex-row gap-8">
                
               
                <div className="lg:w-1/2 xs:w-full">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-gray-900">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                        className="p-1 rounded hover:bg-gray-100"
                        disabled={isBefore(currentMonth, startOfMonth(today))}
                      >
                        &lt;
                      </button>
                      <button 
                        onClick={() => setCurrentMonth(addDays(currentMonth, 32))}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['SU','MO','TU','WE','TH','FR','SA'].map(day => (
                      <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {calendarDays.map((date, i) => {
                      if (!date) return <div key={i} className="p-2"></div>;
                      const isPast = isBefore(date, today);
                      const isSelected = selectedDate && isSameDay(date, selectedDate);
                      
                      return (
                        <button
                          key={i}
                          disabled={isPast}
                          onClick={() => setSelectedDate(date)}
                          className={`
                            p-2 rounded-full font-medium text-sm aspect-square flex items-center justify-center transition
                            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 text-gray-700'}
                            ${isSelected ? 'bg-black text-white hover:bg-black font-semibold' : ''}
                          `}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

               
                {selectedDate && (
                  <div className="lg:w-1/2 flex flex-col h-72 lg:h-80 overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="font-semibold mb-4 text-gray-900">
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </h3>
                    
                    {loadingSlots ? (
                      <div className="text-gray-500 text-sm">Loading slots...</div>
                    ) : availableSlots.length > 0 ? (
                      <div className="flex flex-col gap-2 relative">
                        {availableSlots.map(slot => (
                          <div key={slot} className="flex gap-2">
                            <button
                              onClick={() => setSelectedSlot(slot)}
                              className={`
                                py-3 w-full border border-blue-500 text-blue-600 font-bold rounded-md hover:border-blue-700 hover:text-blue-800 transition
                                ${selectedSlot === slot ? 'w-1/2 bg-gray-600 text-white border-gray-600 hover:text-white pointer-events-none' : ''}
                              `}
                            >
                              {format(new Date(slot), 'h:mm a')}
                            </button>
                            
                            {selectedSlot === slot && (
                              <button
                                onClick={() => setBookingStatus('form')}
                                className="w-1/2 py-3 bg-black text-white font-bold rounded-md hover:bg-gray-800 transition shadow-lg animate-fade-in-left"
                              >
                                Next
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">No available slots for this date.</div>
                    )}
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
