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

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Time slots from 8 AM to 10 PM (14 hours)
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
  ];

  // Helper function to parse time and get position
  const getTimePosition = (timeString) => {
    // Parse times like "6:00 PM - 8:00 PM"
    const startTime = timeString.split(' - ')[0].trim();
    const hour = parseInt(startTime.split(':')[0]);
    const isPM = startTime.includes('PM');
    const isAM = startTime.includes('AM');
    
    let hour24 = hour;
    if (isPM && hour !== 12) hour24 = hour + 12;
    if (isAM && hour === 12) hour24 = 0;
    
    // Calculate position (8 AM = slot 0)
    return hour24 - 8;
  };

  // Helper to calculate duration in hours
  const getDuration = (timeString) => {
    const times = timeString.split(' - ');
    if (times.length !== 2) return 2; // default 2 hours
    
    const parseTime = (time) => {
      const [hourMin, period] = time.trim().split(' ');
      let [hour, min] = hourMin.split(':').map(Number);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      return hour + (min || 0) / 60;
    };
    
    const start = parseTime(times[0]);
    const end = parseTime(times[1]);
    return end - start;
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

        {/* Class List */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Weekly Classes</h2>
          
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading classes...</div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No classes scheduled at this time.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {daysOfWeek.map((dayName) => {
                const dayClasses = filteredClasses.filter(c => c.day === dayName);
                if (dayClasses.length === 0) return null;
                
                return (
                  <div key={dayName} className="bg-black border border-blue-500/20 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-blue-400 mb-4">{dayName}</h3>
                    <div className="space-y-4">
                      {dayClasses.map((classItem, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-gray-900 to-black border border-blue-500/20 rounded-lg p-4 hover-lift"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-white mb-2">{classItem.title}</h4>
                              <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Clock size={16} />
                                  <span>{classItem.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Users size={16} />
                                  <span>{classItem.instructor}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-4 py-2 rounded border text-sm font-semibold ${getLevelColor(classItem.level)}`}>
                                {classItem.level}
                              </span>
                              <div className="text-right">
                                <div className="text-blue-400 font-bold text-lg">{classItem.spots}</div>
                                <div className="text-gray-500 text-xs">spots left</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Classes;