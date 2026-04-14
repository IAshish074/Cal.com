import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'

  async function fetchBookings() {
    try {
      const res = await axios.get('/api/bookings');
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.delete(`/api/bookings/${id}`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="w-full">
      <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between sm:items-end space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">See upcoming and past events booked with you</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
          {['upcoming', 'past', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-none capitalize text-sm font-medium px-4 py-1.5 rounded-md transition-all ${filter === f ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Event & Booker</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.filter(b => {
                if (filter === 'cancelled') return b.status === 'cancelled';
                if (b.status === 'cancelled') return false;
                
                const isPast = new Date(b.start_time) < new Date();
                return filter === 'past' ? isPast : !isPast;
              }).length > 0 ? bookings.filter(b => {
                if (filter === 'cancelled') return b.status === 'cancelled';
                if (b.status === 'cancelled') return false;
                
                const isPast = new Date(b.start_time) < new Date();
                return filter === 'past' ? isPast : !isPast;
              }).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.event_title}</div>
                    <div className="text-sm text-gray-500">{booking.booker_name} &middot; {booking.booker_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{format(new Date(booking.start_time), 'MMM d, yyyy')}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(booking.start_time), 'h:mm a')} - {format(new Date(booking.end_time), 'h:mm a')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                    `}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    {booking.status !== 'cancelled' && new Date(booking.start_time) > new Date() && (
                      <button 
                        onClick={() => cancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-900 px-3 py-1 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}