import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // toggle
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useAuth(); // make sure register exists
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard/event-types');
      } else {
        await register(name, email, password);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 bg-black text-white flex items-center justify-center rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>

        <p className="text-center text-gray-500 mb-8 font-medium">
          {isLogin ? "Log in to manage your schedule" : "Start scheduling meetings"}
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm border text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name (only for register) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                required
                type="text"
                className="w-full border border-gray-300 rounded-md p-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              required
              type="email"
              className="w-full border border-gray-300 rounded-md p-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none"
              placeholder="admin@calclone.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              required
              type="password"
              className="w-full border border-gray-300 rounded-md p-2.5 focus:border-black focus:ring-1 focus:ring-black outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-black text-white font-medium py-3 rounded-md hover:bg-gray-800 transition"
          >
            {isLogin ? "Log In" : "Register"}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <p>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-black font-semibold"
              >
                Register
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-black font-semibold"
              >
                Login
              </button>
            </p>
          )}
        </div>

       
      </div>
    </div>
  );
}