import React, { useState } from 'react';
import { useLawyer } from '../context/LawyerContext';
import { Clock, Save, Plus, Trash2 } from 'lucide-react';
import type { AvailabilitySlot, DayOfWeek } from '../types';

function cx(...cls: (string | false | null | undefined)[]) { return cls.filter(Boolean).join(' '); }

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function LawyerAvailability() {
  const { availability, updateAvailability } = useLawyer();
  const [slots, setSlots] = useState<AvailabilitySlot[]>(availability);
  const [changed, setChanged] = useState(false);

  const toggleDay = (day: DayOfWeek) => {
    setSlots(prev => prev.map(s => s.day === day ? { ...s, isAvailable: !s.isAvailable } : s));
    setChanged(true);
  };

  const updateSlot = (slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setSlots(prev => prev.map(s => s.slotId === slotId ? { ...s, [field]: value } : s));
    setChanged(true);
  };

  const addSlot = (day: DayOfWeek) => {
    const newSlot: AvailabilitySlot = {
      slotId: `SLT-${Date.now()}`,
      day,
      startTime: '10:00',
      endTime: '13:00',
      isAvailable: true,
    };
    setSlots(prev => [...prev, newSlot]);
    setChanged(true);
  };

  const removeSlot = (slotId: string) => {
    setSlots(prev => prev.filter(s => s.slotId !== slotId));
    setChanged(true);
  };

  const handleSave = () => {
    updateAvailability(slots);
    setChanged(false);
  };

  const slotsByDay = (day: DayOfWeek) => slots.filter(s => s.day === day);

  return (
    <div className="lp-page">
      <div className="lp-page-header">
        <div>
          <span className="lp-eyebrow">NYAYA / SCHEDULE</span>
          <h1>Availability</h1>
          <p>Set your weekly availability for client appointments and consultations.</p>
        </div>
        <button
          className={cx('lp-btn', changed ? 'lp-btn-primary' : 'lp-btn-secondary')}
          onClick={handleSave}
          disabled={!changed}
        >
          <Save size={16} /> {changed ? 'Save Changes' : 'Saved'}
        </button>
      </div>

      <div className="lp-availability-grid">
        {DAYS.map(day => {
          const daySlots = slotsByDay(day);
          const hasSlots = daySlots.length > 0;
          const isAvailable = daySlots.some(s => s.isAvailable);

          return (
            <div key={day} className={cx('lp-card lp-avail-day', !isAvailable && 'lp-avail-day-off')}>
              <div className="lp-avail-day-header">
                <h4>{DAY_LABELS[day]}</h4>
                <label className="lp-toggle-switch">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={() => {
                      if (daySlots.length === 0) {
                        addSlot(day);
                      } else {
                        setSlots(prev => prev.map(s => s.day === day ? { ...s, isAvailable: !isAvailable } : s));
                        setChanged(true);
                      }
                    }}
                  />
                  <span className="lp-toggle-slider" />
                </label>
              </div>

              {isAvailable ? (
                <div className="lp-slot-list">
                  {daySlots.filter(s => s.isAvailable).map(slot => (
                    <div key={slot.slotId} className="lp-slot-row">
                      <select
                        value={slot.startTime}
                        onChange={e => updateSlot(slot.slotId, 'startTime', e.target.value)}
                        className="lp-select lp-select-sm"
                      >
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{formatTime(t)}</option>)}
                      </select>
                      <span className="lp-slot-dash">to</span>
                      <select
                        value={slot.endTime}
                        onChange={e => updateSlot(slot.slotId, 'endTime', e.target.value)}
                        className="lp-select lp-select-sm"
                      >
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{formatTime(t)}</option>)}
                      </select>
                      <button className="lp-icon-btn lp-icon-danger" onClick={() => removeSlot(slot.slotId)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="lp-add-slot-btn" onClick={() => addSlot(day)}>
                    <Plus size={13} /> Add slot
                  </button>
                </div>
              ) : (
                <p className="lp-avail-off-label"><Clock size={14} /> Not available</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
