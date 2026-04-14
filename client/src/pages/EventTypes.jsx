import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Clock, Plus, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EventTypes() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', duration_minutes: 30, slug: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await axios.get('/api/event-types');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event type?')) return;
    try {
      await axios.delete(`/api/event-types/${id}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/event-types/${editingId}`, formData);
      } else {
        await axios.post('/api/event-types', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', description: '', duration_minutes: 30, slug: '' });
      fetchEvents();
    } catch (err) {
      alert('Error saving event. Make sure slug is unique.');
    }
  };

  const openEditModal = (event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      duration_minutes: event.duration_minutes,
      slug: event.slug
    });
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your event types</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', description: '', duration_minutes: 30, slug: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Event Type
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 relative group">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{event.title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">{event.description}</p>
            
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Clock className="w-4 h-4 mr-2" />
              {event.duration_minutes}m
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <Link 
                to={`/${user?.username}/${event.slug}`} 
                target="_blank"
                className="text-sm font-medium text-gray-600 hover:text-black flex items-center"
              >
                <LinkIcon className="w-4 h-4 mr-1" />
                /{user?.username}/{event.slug}
              </Link>
              
              <button 
                onClick={() => openEditModal(event)}
                className="text-gray-400 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(event.id)}
                className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200">
          <p className="text-gray-500">No event types yet.</p>
        </div>
      )}

      {/* Tailwind basic modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit event type' : 'Add new event type'}</h2>
            <form onSubmit={handleCreateOrEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  required
                  className="w-full border rounded-md p-2 text-sm focus:ring-black focus:border-black"
                  placeholder="e.g. 15 Min Discovery Call"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                <input 
                  required
                  className="w-full border rounded-md p-2 text-sm focus:ring-black focus:border-black"
                  placeholder="discovery-call"
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <select 
                  className="w-full border rounded-md p-2 text-sm"
                  value={formData.duration_minutes}
                  onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full border rounded-md p-2 text-sm focus:ring-black focus:border-black h-24"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
