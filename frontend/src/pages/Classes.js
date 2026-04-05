import { useState, useEffect, useMemo } from 'react';
import { Clock, Users, ChevronLeft, ChevronRight, X, AlertTriangle, RefreshCw, ZoomIn } from 'lucide-react';
import axios from 'axios';
import ImageLightbox from '../components/ImageLightbox';
import { useTranslation } from 'react-i18next';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Classes = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayName, setSelectedDayName] = useState(null);
  const [siteSettings, setSiteSettings] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { t } = useTranslation();

  const isAdmin = () => {
    const token = localStorage.getItem('adminToken');
    return token !== null && token !== '';
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchClasses();
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get(`${API}/site-settings`);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

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

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
    }
    return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
  };

  const parseTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const startTime = timeString.split(' - ')[0].trim();
    const match = startTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let hour = parseInt(match[1]);
    const min = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + min;
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'border-l-green-500 bg-green-500/10';
      case 'Intermediate': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'Advanced': return 'border-l-red-500 bg-red-500/10';
      default: return 'border-l-blue-500 bg-blue-500/10';
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500/20 text-green-400';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getTranslatedLevel = (level) => {
    switch (level) {
      case 'Beginner': return t('classes.level_beginner');
      case 'Intermediate': return t('classes.level_intermediate');
      case 'Advanced': return t('classes.level_advanced');
      case 'All Levels': return t('classes.level_all');
      default: return level;
    }
  };

  const isClassCancelled = (classId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    return cancelledClasses.some(c => c.class_id === classId && c.cancelled_date === dateStr);
  };

  const getCancellation = (classId, date) => {
    const dateStr = date.toISOString().split('T')[0];
    return cancelledClasses.find(c => c.class_id === classId && c.cancelled_date === dateStr);
  };

  const daySchedule = useMemo(() => {
    const result = {};

    classes.forEach(c => {
      if (c.is_one_time) {
        const classDate = new Date(c.one_time_date + 'T12:00:00');
        const dayIdx = daysOfWeek.indexOf(
          classDate.toLocaleDateString('en-US', { weekday: 'long' })
        );
        if (dayIdx === -1) return;
        const weekDate = weekDates[dayIdx];
        if (weekDate.toISOString().split('T')[0] !== c.one_time_date) return;

        const dayName = daysOfWeek[dayIdx];
        if (!result[dayName]) result[dayName] = [];
        result[dayName].push({
          classItem: c,
          dayName,
          time: c.time,
          date: weekDate,
          isOneTime: true
        });
      } else {
        let scheduleEntries = [];
        if (c.schedule && c.schedule.length > 0) {
          scheduleEntries = c.schedule;
        } else if (c.days && c.days.length > 0) {
          scheduleEntries = c.days.map(d => ({ day: d, time: c.time || '' }));
        } else if (c.day) {
          scheduleEntries = [{ day: c.day, time: c.time || '' }];
        }

        scheduleEntries.forEach(entry => {
          const dayName = entry.day;
          const dayIdx = daysOfWeek.indexOf(dayName);
          if (dayIdx === -1) return;
          if (!result[dayName]) result[dayName] = [];
          result[dayName].push({
            classItem: c,
            dayName,
            time: entry.time,
            date: weekDates[dayIdx],
            isOneTime: false
          });
        });
      }
    });

    Object.keys(result).forEach(day => {
      result[day].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
    });

    return result;
  }, [classes, currentWeekStart]);

  const activeDays = daysOfWeek.filter(day => daySchedule[day] && daySchedule[day].length > 0);

  const handleClassClick = (classItem, date, dayName) => {
    if (!isAdmin()) return;
    setEditingClass(classItem);
    setSelectedDate(date);
    setSelectedDayName(dayName);
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
      await fetchClasses();
      setShowEditModal(false);
      setEditingClass(null);
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class. Please make sure you are logged in as admin.');
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
      alert('Class instance cancelled. Enrolled students will be notified via email.');
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
      alert('Class instance rescheduled. Enrolled students will be notified via email.');
    } catch (error) {
      console.error('Error rescheduling class:', error);
      alert('Failed to reschedule class instance');
    }
  };

  const handleUncancelClass = async (classId, date) => {
    if (!isAdmin()) return;
    try {
      const token = localStorage.getItem('adminToken');
      const dateStr = date.toISOString().split('T')[0];
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
      alert('Failed to restore class.');
    }
  };

  const groupByTime = (entries) => {
    const groups = [];
    let currentGroup = null;
    entries.forEach(entry => {
      const timeKey = entry.time;
      if (!currentGroup || currentGroup.time !== timeKey) {
        currentGroup = { time: timeKey, entries: [] };
        groups.push(currentGroup);
      }
      currentGroup.entries.push(entry);
    });
    return groups;
  };

  return (
    <div className="pt-28 pb-20 px-4" data-testid="classes-page">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white torture-text mb-4" data-testid="classes-title">{t('classes.title')}</h1>
          <div className="gradient-border mx-auto w-24 mb-4"></div>
        </div>

        {/* Classes Header Photo */}
        {siteSettings.classes_header_photo && (
          <div
            className="max-w-4xl mx-auto mb-10 relative cursor-pointer group"
            data-testid="classes-header-photo"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={siteSettings.classes_header_photo}
              alt="TC Pro Dojo Classes"
              className="w-full rounded-lg shadow-2xl transition-all duration-300 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
              <ZoomIn className="text-white" size={48} />
            </div>
          </div>
        )}

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-8 bg-black/50 border border-blue-500/20 rounded-lg px-4 py-3" data-testid="week-navigation">
          <button
            onClick={previousWeek}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            data-testid="prev-week-btn"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">{t('classes.prev_week')}</span>
          </button>

          <div className="text-center">
            <p className="text-blue-400 font-semibold text-base" data-testid="week-range">{formatWeekRange()}</p>
            <button
              onClick={goToCurrentWeek}
              className="text-xs text-gray-400 hover:text-blue-400 transition-colors mt-1"
              data-testid="current-week-btn"
            >
              {t('classes.current_week')}
            </button>
          </div>

          <button
            onClick={nextWeek}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            data-testid="next-week-btn"
          >
            <span className="hidden sm:inline">{t('classes.next_week')}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Schedule Content */}
        {loading ? (
          <div className="text-center text-gray-400 py-16" data-testid="loading-indicator">{t('classes.loading')}</div>
        ) : activeDays.length === 0 ? (
          <div className="text-center py-16" data-testid="no-classes-message">
            <p className="text-gray-400 text-lg mb-2">{t('classes.no_classes')}</p>
            <p className="text-gray-500 text-sm">{t('classes.no_classes_sub')}</p>
          </div>
        ) : (
          <div className="space-y-6" data-testid="schedule-container">
            {activeDays.map((dayName) => {
              const dayIdx = daysOfWeek.indexOf(dayName);
              const date = weekDates[dayIdx];
              const isToday = new Date().toDateString() === date.toDateString();
              const entries = daySchedule[dayName];
              const timeGroups = groupByTime(entries);

              return (
                <div
                  key={dayName}
                  className={`bg-black border rounded-lg overflow-hidden ${isToday ? 'border-blue-500' : 'border-blue-500/20'}`}
                  data-testid={`day-card-${dayName.toLowerCase()}`}
                >
                  <div className={`px-5 py-3 flex items-center justify-between ${isToday ? 'bg-blue-600/20' : 'bg-gray-900/50'}`}>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">{dayName}</h3>
                      <span className={`text-sm ${isToday ? 'text-blue-300 font-semibold' : 'text-gray-400'}`}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {isToday && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          {t('classes.today')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {entries.length} {entries.length !== 1 ? t('classes.classes_count') : t('classes.class_count')}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {timeGroups.map((group, gIdx) => (
                      <div
                        key={gIdx}
                        className="flex flex-wrap gap-3"
                        data-testid={`time-group-${dayName.toLowerCase()}-${gIdx}`}
                      >
                        {group.entries.map((entry, eIdx) => {
                          const { classItem, time: entryTime } = entry;
                          const cancelled = isClassCancelled(classItem.id, date);
                          const cancellation = getCancellation(classItem.id, date);
                          const isRescheduled = cancellation?.status === 'rescheduled';
                          const adminLoggedIn = isAdmin();

                          return (
                            <div
                              key={`${classItem.id}-${eIdx}`}
                              onClick={() => handleClassClick(classItem, date, dayName)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (cancelled && adminLoggedIn) {
                                  handleUncancelClass(classItem.id, date);
                                }
                              }}
                              className={`flex-1 min-w-[240px] border-l-4 rounded-r-lg px-4 py-3 transition-all ${
                                cancelled
                                  ? isRescheduled
                                    ? 'border-l-orange-500 bg-orange-900/20 opacity-70'
                                    : 'border-l-red-500 bg-red-900/20 opacity-60'
                                  : entry.isOneTime
                                    ? 'border-l-purple-500 bg-purple-500/10'
                                    : getLevelColor(classItem.level)
                              } ${adminLoggedIn ? 'cursor-pointer hover:brightness-125' : ''}`}
                              data-testid={`class-card-${classItem.id}`}
                            >
                              {cancelled && (
                                <div className="flex items-center gap-1 mb-1">
                                  {isRescheduled ? (
                                    <RefreshCw size={12} className="text-orange-400" />
                                  ) : (
                                    <AlertTriangle size={12} className="text-red-400" />
                                  )}
                                  <span className={`text-xs font-bold uppercase ${isRescheduled ? 'text-orange-400' : 'text-red-400'}`}>
                                    {isRescheduled ? t('classes.rescheduled') : t('classes.cancelled')}
                                  </span>
                                </div>
                              )}

                              {entry.isOneTime && !cancelled && (
                                <div className="text-xs font-bold text-purple-300 mb-1">{t('classes.special_event')}</div>
                              )}

                              <h4 className={`font-bold text-sm mb-1 ${cancelled ? 'line-through text-gray-500' : 'text-white'}`}>
                                {classItem.title}
                              </h4>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                <span className={`flex items-center gap-1 ${cancelled && !isRescheduled ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                                  <Clock size={12} />
                                  {entryTime}
                                </span>
                                {isRescheduled && cancellation?.rescheduled_time && (
                                  <span className="flex items-center gap-1 text-orange-300 font-semibold">
                                    <RefreshCw size={12} />
                                    {cancellation.rescheduled_time}
                                  </span>
                                )}
                                <span className={`flex items-center gap-1 ${cancelled ? 'text-gray-600' : 'text-gray-400'}`}>
                                  <Users size={12} />
                                  {classItem.instructor}
                                </span>
                              </div>

                              {!cancelled && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getLevelBadge(classItem.level)}`}>
                                    {getTranslatedLevel(classItem.level)}
                                  </span>
                                </div>
                              )}

                              {cancelled && cancellation?.reason && cancellation.reason !== 'No reason provided' && (
                                <p className="text-xs text-gray-500 mt-1 italic">{t('classes.reason')} {cancellation.reason}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Schedule Photo Section */}
        {siteSettings.classes_photo && (
          <div className="max-w-4xl mx-auto mt-12" data-testid="classes-photo-section">
            <div
              className="bg-gradient-to-br from-black to-gray-900 border border-blue-500/20 rounded-lg overflow-hidden relative cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={siteSettings.classes_photo}
                alt="Training at TC Pro Dojo"
                className="w-full h-auto object-contain transition-all duration-300 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="text-white" size={48} />
              </div>
              {siteSettings.classes_photo_caption && (
                <div className="p-4 text-center">
                  <p className="text-gray-400 text-sm">{siteSettings.classes_photo_caption}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <ImageLightbox
          images={[
            ...(siteSettings.classes_header_photo ? [{ url: siteSettings.classes_header_photo, alt: 'TC Pro Dojo Classes', title: 'TC Pro Dojo Classes' }] : []),
            ...(siteSettings.classes_photo ? [{ url: siteSettings.classes_photo, alt: 'Training at TC Pro Dojo', title: siteSettings.classes_photo_caption || 'Training at TC Pro Dojo' }] : [])
          ]}
          currentIndex={0}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />

        {/* Edit Class Modal (Admin only) */}
        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" data-testid="edit-class-modal">
            <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">{t('classes.manage_class')}</h3>
                <button
                  onClick={() => { setShowEditModal(false); setEditingClass(null); }}
                  className="text-gray-400 hover:text-white"
                  data-testid="close-modal-btn"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-black/50 border border-blue-500/10 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-bold text-white mb-1">{editingClass.title}</h4>
                <p className="text-sm text-gray-400">
                  {selectedDayName}, {selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-sm text-gray-400">{t('classes.instructor_label')}: {editingClass.instructor}</p>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); handleUpdateClass(editingClass); }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">{t('classes.class_title_label')}</label>
                    <input
                      type="text"
                      value={editingClass.title}
                      onChange={(e) => setEditingClass({ ...editingClass, title: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                      data-testid="edit-class-title"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">{t('classes.instructor_label')}</label>
                    <input
                      type="text"
                      value={editingClass.instructor}
                      onChange={(e) => setEditingClass({ ...editingClass, instructor: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                      data-testid="edit-class-instructor"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">{t('classes.level_label')}</label>
                    <select
                      value={editingClass.level}
                      onChange={(e) => setEditingClass({ ...editingClass, level: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-blue-500/20 rounded text-white focus:outline-none focus:border-blue-500"
                      required
                      data-testid="edit-class-level"
                    >
                      <option value="Beginner">{t('classes.level_beginner')}</option>
                      <option value="Intermediate">{t('classes.level_intermediate')}</option>
                      <option value="Advanced">{t('classes.level_advanced')}</option>
                      <option value="All Levels">{t('classes.level_all')}</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-blue-500/20 pt-4 mt-4">
                  <p className="text-gray-400 text-sm mb-3">
                    {t('classes.actions_for')} {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}:
                  </p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      type="button"
                      onClick={handleCancelInstance}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
                      data-testid="cancel-instance-btn"
                    >
                      {t('classes.cancel_instance')}
                    </button>
                    <button
                      type="button"
                      onClick={handleRescheduleInstance}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded transition-colors"
                      data-testid="reschedule-instance-btn"
                    >
                      {t('classes.reschedule_instance')}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-end mt-6 border-t border-blue-500/20 pt-4">
                  <button
                    type="button"
                    onClick={() => handleDeleteClass(editingClass.id)}
                    className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white text-sm font-semibold rounded transition-colors"
                    data-testid="delete-class-btn"
                  >
                    {t('classes.delete_class')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingClass(null); }}
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded transition-colors"
                  >
                    {t('classes.close')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
                    data-testid="save-class-btn"
                  >
                    {t('classes.save_changes')}
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
