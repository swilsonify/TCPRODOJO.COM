import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Classes = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('All'); // New filter state

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API}/classes`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Use default classes if API fails
      setClasses(defaultClasses);
    } finally {
      setLoading(false);
    }
  };

  const defaultClasses = [];

  const currentClasses = classes;
  
  // Filter classes based on selected type
  const filteredClasses = classFilter === 'All' 
    ? currentClasses 
    : currentClasses.filter(c => c.type === classFilter);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(selectedDate);

  const previousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  return (
    <div className="pt-28 pb-20 px-4" data-testid="classes-page">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white torture-text mb-4">CLASS SCHEDULE</h1>
          <div className="gradient-border mx-auto w-24 mb-6"></div>
        </div>

        {/* Calendar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-black border border-blue-500/20 rounded-lg p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-blue-500/10 rounded transition-colors"
                data-testid="prev-month-button"
              >
                <ChevronLeft className="text-blue-500" size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white">
                {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-blue-500/10 rounded transition-colors"
                data-testid="next-month-button"
              >
                <ChevronRight className="text-blue-500" size={24} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-blue-400 font-semibold text-sm py-2">
                  {day.slice(0, 3)}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {[...Array(firstDay)].map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square"></div>
              ))}

              {/* Calendar Days */}
              {[...Array(daysInMonth)].map((_, index) => {
                const day = index + 1;
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                const dayName = daysOfWeek[date.getDay()];
                const hasClasses = currentClasses.some(c => c.day === dayName);
                const isToday = new Date().toDateString() === date.toDateString();

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg flex items-center justify-center cursor-pointer calendar-day ${
                      hasClasses ? 'border-blue-500/50 bg-blue-500/10' : 'border-gray-700'
                    } ${
                      isToday ? 'ring-2 ring-blue-500' : ''
                    }`}
                    data-testid={`calendar-day-${day}`}
                  >
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${
                        hasClasses ? 'text-white' : 'text-gray-500'
                      }`}>
                        {day}
                      </div>
                      {hasClasses && (
                        <div className="w-1 h-1 bg-blue-500 rounded-full mx-auto mt-1"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Classes;