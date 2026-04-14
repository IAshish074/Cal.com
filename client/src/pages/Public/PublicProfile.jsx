import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';

export default function PublicProfile() {
  const { username } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd fetch by username. For this clone we fetch all events since they belong to user 1
    fetchEvents();
  }, [username]);

  async function fetchEvents() {
    try {
      const res = await axios.get('/api/event-types');
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col py-10 px-4 items-center justify-center">
      
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400">
            <span className="text-2xl font-bold uppercase">{username?.charAt(0) || 'A'}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 capitalize">{username || 'Admin'}</h1>
          <p className="text-gray-500 mt-2">Welcome to my scheduling page. Please follow the instructions to add an event to my calendar.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {events.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {events.map(event => (
                <Link 
                  key={event.id}
                  to={`/${username}/${event.slug}`}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
                >
                  <div className="pr-4">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-black">{event.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{event.description}</p>
                  </div>
                  <div className="flex items-center text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full shrink-0">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {event.duration_minutes}m
                  </div>
                  <div className="hidden sm:flex shrink-0 ml-4 rounded-full bg-black text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Calendar className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              This user hasn't set up any event types yet.
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-400">
          Powered by Cal Clone
        </div>
      </div>
      
    </div>
  );
}
