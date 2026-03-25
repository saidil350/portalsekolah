import React from 'react';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Filter,
} from 'lucide-react';

// Data jadwal mengajar mingguan
const scheduleData = {
  monday: [
    { time: '07:00 - 08:30', subject: 'Mathematics', class: 'Class 10A', room: 'Room 201', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { time: '08:30 - 10:00', subject: 'Mathematics', class: 'Class 10B', room: 'Room 201', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { time: '10:15 - 11:45', subject: 'Physics', class: 'Class 11A', room: 'Room 305', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    null,
    null,
    null,
    null,
  ],
  tuesday: [
    null,
    { time: '08:30 - 10:00', subject: 'Physics', class: 'Class 11B', room: 'Room 305', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { time: '10:15 - 11:45', subject: 'Mathematics', class: 'Class 10C', room: 'Room 102', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { time: '12:00 - 13:30', subject: 'Mathematics', class: 'Class 10A', room: 'Room 201', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    null,
    null,
    null,
  ],
  wednesday: [
    { time: '07:00 - 08:30', subject: 'Physics', class: 'Class 11A', room: 'Room 305', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { time: '08:30 - 10:00', subject: 'Physics', class: 'Class 11B', room: 'Room 305', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    null,
    { time: '12:00 - 13:30', subject: 'Mathematics', class: 'Class 10B', room: 'Room 201', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    null,
    null,
    null,
  ],
  thursday: [
    { time: '07:00 - 08:30', subject: 'Mathematics', class: 'Class 10C', room: 'Room 102', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    null,
    { time: '10:15 - 11:45', subject: 'Calculus', class: 'Class 12A', room: 'Room 401', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { time: '12:00 - 13:30', subject: 'Calculus', class: 'Class 12B', room: 'Room 401', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    null,
    null,
    null,
  ],
  friday: [
    { time: '07:00 - 08:30', subject: 'Mathematics', class: 'Class 10A', room: 'Room 201', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { time: '08:30 - 10:00', subject: 'Physics', class: 'Class 11A', room: 'Room 305', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    null,
    null,
    null,
    null,
    null,
  ],
};

const timeSlots = ['07:00', '08:30', '10:15', '12:00', '13:00', '14:00', '15:00'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

export default function JadwalMengajarPage() {
  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light">
      {/* Header */}
      <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center">
          <h2 className="text-slate-900 text-[20px] font-bold">Teaching Schedule</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm shadow-primary/30 transition-all cursor-pointer">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Schedule
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Week/Month Toggle */}
            <div className="bg-white border border-slate-200 rounded-lg p-[5px] shadow-sm flex">
              <button className="px-4 py-1.5 bg-primary text-white rounded-md text-sm font-medium transition-all cursor-pointer">
                Week
              </button>
              <button className="px-4 py-1.5 text-slate-500 rounded-md text-sm font-medium hover:text-slate-900 transition-all cursor-pointer">
                Month
              </button>
            </div>
            {/* Download PDF */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-all cursor-pointer">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
              Previous Week
            </button>
            <h3 className="text-text-main text-lg font-semibold">Jan 20 - Jan 24, 2025</h3>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">
              Next Week
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Schedule Grid */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="w-[100px] px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Time
                    </th>
                    {days.map((day) => (
                      <th key={day} className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIdx) => (
                    <tr key={time} className="border-b border-slate-50 last:border-b-0">
                      <td className="px-4 py-3 text-sm font-medium text-slate-500 align-top whitespace-nowrap">
                        {time}
                      </td>
                      {dayKeys.map((dayKey) => {
                        const slot = scheduleData[dayKey][timeIdx];
                        return (
                          <td key={dayKey} className="px-2 py-2 align-top">
                            {slot ? (
                              <div className={`${slot.color} border rounded-lg p-3 min-h-[80px] transition-all hover:shadow-md cursor-pointer`}>
                                <p className="text-sm font-semibold">{slot.subject}</p>
                                <p className="text-xs mt-1 opacity-80">{slot.class}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="flex items-center gap-1 text-xs opacity-70">
                                    <Clock className="w-3 h-3" />
                                    {slot.time}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs opacity-70">
                                    <MapPin className="w-3 h-3" />
                                    {slot.room}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="min-h-[80px] rounded-lg border border-dashed border-slate-100 bg-slate-50/30" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
