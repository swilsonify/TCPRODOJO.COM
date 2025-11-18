import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Classes = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Adjust to get Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [classes, setClasses] = useState([]);
  const [cancelledClasses, setCancelledClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedClassForCancel, setSelectedClassForCancel] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Check if user is admin
  const isAdmin = () => {
    const token = localStorage.getItem('adminToken');
    return token !== null && token !== '';
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const [classesRes, cancelledRes] = await Promise.all([
        axios.get(`${API}/classes`),
        axios.get(`${API}/classes/cancelled`)
      ]);
      setClasses(classesRes.data);
      setCancelledClasses(cancelledRes.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const defaultClasses = [];

  const currentClasses = classes;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Get dates for current week
  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  
  // Time slots from 8 AM to 10 PM (14 hours)
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
  ];

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };

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

  const handleClassClick = (classItem, date) => {
    if (!isAdmin()) {
      return; // Only admins can edit
    }
    setEditingClass(classItem);
    setSelectedDate(date);
    setShowEditModal(true);
  };

  const handleUpdateClass = async (updatedClass) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${API}/admin/classes/${updatedClass.id}`,
        updatedClass,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh classes
      await fetchClasses();
      setShowEditModal(false);
      setEditingClass(null);
    } catch (error) {
      console.error('Error updating class:', error);
      alert('Failed to update class. Please make sure you are logged in as admin.');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${API}/admin/classes/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh classes
      await fetchClasses();
      setShowEditModal(false);
      setEditingClass(null);
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class. Please make sure you are logged in as admin.');
    }
  };

  const isClassCancelled = (classId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    return cancelledClasses.some(c => c.class_id === classId && c.cancelled_date === dateStr);
  };

  const handleCancelClass = async (classItem, date) => {
    if (!isAdmin()) {
      alert('Only administrators can cancel classes. Please log in to the admin panel.');
      return;
    }
    
    const reason = prompt('Reason for cancellation (optional):');
    if (reason === null) return; // User clicked cancel
    
    try {
      const token = localStorage.getItem('adminToken');
      const dateStr = date.toISOString().split('T')[0];
      
      await axios.post(
        `${API}/admin/classes/cancel`,
        {
          class_id: classItem.id,
          cancelled_date: dateStr,
          reason: reason || 'No reason provided'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchClasses();
      alert('Class cancelled successfully');
    } catch (error) {
      console.error('Error cancelling class:', error);
      alert('Failed to cancel class. Please make sure you are logged in as admin.');
    }
  };

  const handleUncancelClass = async (classId, date) => {
    if (!isAdmin()) {
      alert('Only administrators can restore classes. Please log in to the admin panel.');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      const dateStr = date.toISOString().split('T')[0];
      
      // Find the cancellation
      const cancellation = cancelledClasses.find(c => c.class_id === classId && c.cancelled_date === dateStr);
      if (!cancellation) return;
      
      await axios.delete(
        `${API}/admin/classes/cancel/${cancellation.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchClasses();
      alert('Class restored successfully');
    } catch (error) {
      console.error('Error restoring class:', error);
      alert('Failed to restore class. Please make sure you are logged in as admin.');
    }
  };

  const handleCancelInstance = async () => {
    if (!editingClass || !selectedDate) return;
    
    const reason = prompt('Reason for cancellation (optional):');
    if (reason === null) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      await axios.post(
        `${API}/admin/classes/cancel`,
        {
          class_id: editingClass.id,
          cancelled_date: dateStr,
          status: 'cancelled',
          reason: reason || 'No reason provided'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchClasses();
      setShowEditModal(false);
      setEditingClass(null);
      alert('Class instance cancelled successfully');
    } catch (error) {
      console.error('Error cancelling class:', error);
      alert('Failed to cancel class instance');
    }
  };

  const handleRescheduleInstance = async () => {
    if (!editingClass || !selectedDate) return;
    
    const newTime = prompt('Enter new time (e.g., "8:00 PM - 10:00 PM"):');
    if (!newTime) return;
    
    const reason = prompt('Reason for rescheduling (optional):');
    if (reason === null) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      await axios.post(
        `${API}/admin/classes/cancel`,
        {
          class_id: editingClass.id,
          cancelled_date: dateStr,
          status: 'rescheduled',
          rescheduled_time: newTime,
          reason: reason || 'Rescheduled'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchClasses();
      setShowEditModal(false);
      setEditingClass(null);
      alert('Class instance rescheduled successfully');
    } catch (error) {
      console.error('Error rescheduling class:', error);
      alert('Failed to reschedule class instance');
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

        {/* Weekly Timetable View */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="bg-black border border-blue-500/20 rounded-lg p-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousWeek}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                <ChevronLeft size={20} />
                Previous Week
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Weekly Schedule</h2>
                <p className="text-blue-400 font-semibold">{formatWeekRange()}</p>
                <button
                  onClick={goToCurrentWeek}
                  className="mt-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Go to Current Week
                </button>
              </div>

              <button
                onClick={nextWeek}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Next Week
                <ChevronRight size={20} />
              </button>
            </div>
            
            {loading ? (
              <div className="text-center text-gray-400 py-12">Loading schedule...</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header Row - Days of Week with Dates */}
                  <div className="grid grid-cols-8 gap-1 mb-2">
                    <div className="text-gray-500 text-sm font-semibold p-2"></div>
                    {daysOfWeek.map((day, index) => {
                      const date = weekDates[index];
                      const isToday = new Date().toDateString() === date.toDateString();
                      return (
                        <div key={day} className={`text-center font-bold text-sm p-2 border-b ${isToday ? 'bg-blue-500/20 border-blue-500' : 'border-blue-500/20'}`}>
                          <div className="text-blue-400">{day}</div>
                          <div className={`text-xs mt-1 ${isToday ? 'text-blue-300 font-bold' : 'text-gray-400'}`}>
                            {date.getMonth() + 1}/{date.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Time Slots */}
                  {timeSlots.map((timeSlot, slotIndex) => (
                    <div key={timeSlot} className="grid grid-cols-8 gap-1 border-t border-gray-800">
                      {/* Time Label */}
                      <div className="text-gray-500 text-xs font-semibold p-2 flex items-start">
                        {timeSlot}
                      </div>

                      {/* Day Columns */}
                      {daysOfWeek.map((day, dayIndex) => {
                        // Find classes for this day and time slot
                        const dayClasses = currentClasses.filter(c => {
                          if (c.day !== day) return false;
                          const classSlot = getTimePosition(c.time);
                          // Match if class starts in this hour (floor to nearest hour)
                          return Math.floor(classSlot) === slotIndex;
                        });

                        return (
                          <div key={`${day}-${slotIndex}`} className="min-h-[60px] p-1 relative">
                            {dayClasses.map((classItem, idx) => {
                              const duration = getDuration(classItem.time);
                              const heightMultiplier = duration;
                              const date = weekDates[dayIndex];
                              const isCancelled = isClassCancelled(classItem.id, date);
                              
                              const adminLoggedIn = isAdmin();
                              const cancellation = cancelledClasses.find(c => c.class_id === classItem.id && c.cancelled_date === date.toISOString().split('T')[0]);
                              const isRescheduled = cancellation?.status === 'rescheduled';
                              const tooltip = adminLoggedIn 
                                ? (isCancelled ? "Admin: Right-click to restore" : "Admin: Click to edit")
                                : (isCancelled ? (isRescheduled ? "Class rescheduled" : "Class cancelled") : classItem.instructor);
                              
                              return (
                                <div
                                  key={idx}
                                  onClick={() => handleClassClick(classItem, date)}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    if (isCancelled && adminLoggedIn) {
                                      handleUncancelClass(classItem.id, date);
                                    }
                                  }}
                                  className={`absolute left-1 right-1 rounded p-2 border ${
                                    isCancelled 
                                      ? (isRescheduled ? 'bg-orange-900/50 border-orange-500' : 'bg-red-900/50 border-red-500')
                                      : getLevelColor(classItem.level)
                                  } ${adminLoggedIn ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : 'cursor-default'} transition-all z-10`}
                                  style={{ 
                                    height: `${heightMultiplier * 60 - 8}px`,
                                    top: '4px'
                                  }}
                                  title={tooltip}
                                >
                                  <div className={`text-xs font-bold mb-1 leading-tight ${isCancelled ? 'text-red-300' : 'text-white'}`}>
                                    {isCancelled && (
                                      <div className="text-xs font-bold mb-1">
                                        {isRescheduled ? '🔄 RESCHEDULED' : '❌ CANCELLED'}
                                      </div>
                                    )}
                                    {classItem.title}
                                  </div>
                                  <div className={`text-xs leading-tight ${isCancelled && !isRescheduled ? 'line-through text-red-400' : 'text-gray-300'}`}>
                                    {classItem.time}
                                  </div>
                                  {isRescheduled && cancellation?.rescheduled_time && (
                                    <div className="text-xs leading-tight text-orange-300 font-semibold">
                                      → {cancellation.rescheduled_time}
                                    </div>
                                  )}
                                  <div className={`text-xs leading-tight mt-1 ${isCancelled ? (isRescheduled ? 'text-orange-400' : 'text-red-500') : 'text-gray-400'}`}>
                                    {classItem.instructor}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Class List */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Weekly Classes</h2>
          
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading classes...</div>
          ) : currentClasses.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No classes scheduled at this time.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {daysOfWeek.map((dayName) => {
                const dayClasses = currentClasses.filter(c => c.day === dayName);
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

        {/* Edit Class Modal */}
        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Edit Class</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingClass(null);
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateClass(editingClass);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Class Title</label>
                    <input
                      type="text"
                      value={editingClass.title}
                      onChange={(e) => setEditingClass({ ...editingClass, title: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Day</label>
                    <select
                      value={editingClass.day}
                      onChange={(e) => setEditingClass({ ...editingClass, day: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Time</label>
                    <input
                      type="text"
                      value={editingClass.time}
                      onChange={(e) => setEditingClass({ ...editingClass, time: e.target.value })}
                      placeholder="6:00 PM - 8:00 PM"
                      className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Instructor</label>
                    <input
                      type="text"
                      value={editingClass.instructor}
                      onChange={(e) => setEditingClass({ ...editingClass, instructor: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Level</label>
                    <select
                      value={editingClass.level}
                      onChange={(e) => setEditingClass({ ...editingClass, level: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Available Spots</label>
                    <input
                      type="number"
                      value={editingClass.spots}
                      onChange={(e) => setEditingClass({ ...editingClass, spots: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="border-t border-blue-500/20 pt-4 mt-6">
                  <p className="text-gray-400 text-sm mb-4">
                    Individual Instance Actions (for {selectedDate?.toLocaleDateString()}):
                  </p>
                  <div className="flex gap-3 mb-4">
                    <button
                      type="button"
                      onClick={handleCancelInstance}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
                    >
                      Cancel This Instance
                    </button>
                    <button
                      type="button"
                      onClick={handleRescheduleInstance}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded transition-colors"
                    >
                      Reschedule This Instance
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(editingClass.id)}
                    className="px-6 py-3 bg-red-800 hover:bg-red-900 text-white font-semibold rounded transition-colors"
                  >
                    Delete Recurring Class
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingClass(null);
                    }}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
                  >
                    Save Recurring Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Classes;