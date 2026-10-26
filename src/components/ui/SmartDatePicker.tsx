import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

interface SmartDatePickerProps {
  value: string;           // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
  required?: boolean;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Panel = 'calendar' | 'month' | 'year';

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const DROPDOWN_WIDTH = 284;
const DROPDOWN_OFFSET = 6;

export function SmartDatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  id,
  minDate,
  maxDate,
  className = '',
  required,
}: SmartDatePickerProps) {
  const today = new Date();

  const parsedValue = value ? (() => {
    const [y, m, d] = value.split('-').map(Number);
    return { year: y, month: m - 1, day: d };
  })() : null;

  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>('calendar');
  const [viewYear, setViewYear] = useState(parsedValue?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedValue?.month ?? today.getMonth());
  const [animDir, setAnimDir] = useState<'left' | 'right'>('right');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = rect.bottom + DROPDOWN_OFFSET + window.scrollY;
    let left = rect.left + window.scrollX;
    if (left + DROPDOWN_WIDTH > vw - 8) left = rect.right + window.scrollX - DROPDOWN_WIDTH;
    const APPROX_H = 360;
    if (rect.bottom + APPROX_H + DROPDOWN_OFFSET > vh) {
      top = rect.top + window.scrollY - APPROX_H - DROPDOWN_OFFSET;
    }
    setDropdownPos({ top, left: Math.max(8, left) });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        setOpen(false);
        setPanel('calendar');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    calcPos();
    window.addEventListener('scroll', calcPos, true);
    window.addEventListener('resize', calcPos);
    return () => {
      window.removeEventListener('scroll', calcPos, true);
      window.removeEventListener('resize', calcPos);
    };
  }, [open, calcPos]);

  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        setViewYear(y);
        setViewMonth(m - 1);
      }
    }
  }, [value]);

  const isDisabled = useCallback((y: number, m: number, d: number) => {
    const ds = toDateStr(y, m + 1, d);
    if (minDate && ds < minDate) return true;
    if (maxDate && ds > maxDate) return true;
    return false;
  }, [minDate, maxDate]);

  const isToday = (y: number, m: number, d: number) =>
    y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
  const isSelected = (y: number, m: number, d: number) =>
    !!parsedValue && parsedValue.year === y && parsedValue.month === m && parsedValue.day === d;

  const prevMonth = () => {
    setAnimDir('left');
    setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
  };
  const nextMonth = () => {
    setAnimDir('right');
    setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });
  };

  const selectDay = (d: number) => {
    if (isDisabled(viewYear, viewMonth, d)) return;
    onChange(toDateStr(viewYear, viewMonth + 1, d));
    setOpen(false); setPanel('calendar');
  };
  const clearDate = (e: React.MouseEvent) => { e.stopPropagation(); onChange(''); };

  const handleOpen = () => {
    setPanel('calendar');
    setOpen(o => { if (!o) requestAnimationFrame(calcPos); return !o; });
  };

  // Calendar grid
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) cells.push({ day: daysInPrevMonth - firstDay + 1 + i, current: false });
    else if (i < firstDay + daysInMonth) cells.push({ day: i - firstDay + 1, current: true });
    else cells.push({ day: i - firstDay - daysInMonth + 1, current: false });
  }

  // Year grid: show 12 years centered on current view year
  const yearStart = Math.floor(viewYear / 12) * 12;
  const yearRange = Array.from({ length: 12 }, (_, i) => yearStart + i);

  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({ x: dir === 'right' ? 32 : -32, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'left' | 'right') => ({ x: dir === 'right' ? -32 : 32, opacity: 0 }),
  };

  const panelVariants = {
    enter: { opacity: 0, y: 8 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  const dropdown = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          role="dialog"
          aria-label="Date picker"
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
          className="sdp-dropdown"
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: DROPDOWN_WIDTH }}
        >
          {/* ── Header ── */}
          <div className="sdp-header">
            <button
              type="button"
              onClick={prevMonth}
              className="sdp-nav-btn"
              aria-label="Previous"
              style={{ visibility: panel === 'calendar' ? 'visible' : 'hidden' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="sdp-header-center">
              {/* Month button */}
              <button
                type="button"
                onClick={() => setPanel(p => p === 'month' ? 'calendar' : 'month')}
                className={`sdp-header-pill ${panel === 'month' ? 'sdp-header-pill--active' : ''}`}
              >
                {MONTHS_FULL[viewMonth]}
              </button>

              {/* Year button */}
              <button
                type="button"
                onClick={() => setPanel(p => p === 'year' ? 'calendar' : 'year')}
                className={`sdp-header-pill sdp-header-pill--year ${panel === 'year' ? 'sdp-header-pill--active' : ''}`}
              >
                {viewYear}
              </button>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="sdp-nav-btn"
              aria-label="Next"
              style={{ visibility: panel === 'calendar' ? 'visible' : 'hidden' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── Panels ── */}
          <AnimatePresence mode="wait">

            {/* Month Picker Panel */}
            {panel === 'month' && (
              <motion.div
                key="month-panel"
                variants={panelVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.15 }}
              >
                <div className="sdp-picker-grid sdp-picker-grid--month">
                  {MONTHS_SHORT.map((mo, i) => (
                    <button
                      key={mo}
                      type="button"
                      onClick={() => { setViewMonth(i); setPanel('calendar'); }}
                      className={`sdp-picker-item ${viewMonth === i ? 'sdp-picker-item--active' : ''}`}
                    >
                      {mo}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Year Picker Panel */}
            {panel === 'year' && (
              <motion.div
                key="year-panel"
                variants={panelVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.15 }}
              >
                {/* decade nav */}
                <div className="sdp-decade-nav">
                  <button
                    type="button"
                    className="sdp-nav-btn"
                    onClick={() => setViewYear(y => y - 12)}
                    aria-label="Previous years"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="sdp-decade-label">{yearStart} – {yearStart + 11}</span>
                  <button
                    type="button"
                    className="sdp-nav-btn"
                    onClick={() => setViewYear(y => y + 12)}
                    aria-label="Next years"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="sdp-picker-grid sdp-picker-grid--year">
                  {yearRange.map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => { setViewYear(yr); setPanel('calendar'); }}
                      className={`sdp-picker-item ${viewYear === yr ? 'sdp-picker-item--active' : ''} ${yr === today.getFullYear() ? 'sdp-picker-item--today' : ''}`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Calendar Panel */}
            {panel === 'calendar' && (
              <motion.div
                key="calendar-panel"
                variants={panelVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.15 }}
              >
                <div className="sdp-day-headers">
                  {DAYS.map(d => <span key={d} className="sdp-day-header">{d}</span>)}
                </div>
                <div className="sdp-grid-wrap">
                  <AnimatePresence mode="popLayout" custom={animDir}>
                    <motion.div
                      key={`${viewYear}-${viewMonth}`}
                      custom={animDir}
                      variants={slideVariants}
                      initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                      className="sdp-grid"
                    >
                      {cells.map((cell, i) => {
                        const disabled = cell.current && isDisabled(viewYear, viewMonth, cell.day);
                        const todayCell = cell.current && isToday(viewYear, viewMonth, cell.day);
                        const selectedCell = cell.current && isSelected(viewYear, viewMonth, cell.day);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => cell.current && selectDay(cell.day)}
                            disabled={!cell.current || disabled}
                            className={[
                              'sdp-day',
                              !cell.current ? 'sdp-day--other' : '',
                              todayCell && !selectedCell ? 'sdp-day--today' : '',
                              selectedCell ? 'sdp-day--selected' : '',
                              disabled ? 'sdp-day--disabled' : '',
                              cell.current && !selectedCell && !disabled ? 'sdp-day--active' : '',
                            ].filter(Boolean).join(' ')}
                          >
                            {cell.day}
                            {todayCell && <span className="sdp-today-dot" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="sdp-footer">
                  {value && (
                    <button type="button" onClick={clearDate} className="sdp-footer-clear">Clear</button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const t = new Date();
                      setViewYear(t.getFullYear()); setViewMonth(t.getMonth());
                      onChange(toDateStr(t.getFullYear(), t.getMonth() + 1, t.getDate()));
                      setOpen(false);
                    }}
                    className="sdp-footer-today"
                  >
                    Today
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={handleOpen}
        className="sdp-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Calendar className="sdp-trigger-icon" />
        <span className={value ? 'sdp-trigger-value' : 'sdp-trigger-placeholder'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        {value && (
          <span role="button" onClick={clearDate} className="sdp-clear" aria-label="Clear date">
            <X className="w-3 h-3" />
          </span>
        )}
        {required && !value && <span className="text-red-400 ml-auto text-xs">*</span>}
      </button>
      {createPortal(dropdown, document.body)}
    </div>
  );
}
