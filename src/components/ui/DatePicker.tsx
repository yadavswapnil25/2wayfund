import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { isoToDisplay, todayIso } from "../../lib/dates";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

function toIso(year: number, month: number, day: number): string {
  return year + "-" + pad2(month + 1) + "-" + pad2(day);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** A calendar picker built from scratch (no external date-picker
 * dependency — this project has none, and one field doesn't warrant
 * adding one) so a date field looks and behaves consistently with the
 * rest of the app instead of falling back to the browser's own native
 * `<input type="date">` control, which renders differently per OS and
 * browser and can't be styled to match. */
export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  hasError,
  placeholder = "Select a date",
}: {
  id: string;
  /** ISO yyyy-mm-dd, or "" for no selection. */
  value: string;
  onChange: (iso: string) => void;
  /** ISO yyyy-mm-dd bounds, inclusive. */
  min?: string;
  max?: string;
  hasError?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const initial = value || max || todayIso();
  const [viewYear, setViewYear] = useState(() => Number(initial.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => Number(initial.slice(5, 7)) - 1);

  /** Re-centres the visible month on the current value (or the newest
   * selectable date) and opens the calendar — set directly from the
   * click that opens it, not reactively from an effect, so there's no
   * extra render in between. */
  function openPicker() {
    const base = value || max || todayIso();
    setViewYear(Number(base.slice(0, 4)));
    setViewMonth(Number(base.slice(5, 7)) - 1);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const minYear = min ? Number(min.slice(0, 4)) : 1900;
  const maxYear = max ? Number(max.slice(0, 4)) : Number(todayIso().slice(0, 4));

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y--) list.push(y);
    return list;
  }, [minYear, maxYear]);

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewYear(y);
    setViewMonth(m);
  }

  const leadingBlanks = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const today = todayIso();

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        id={id}
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 font-[inherit] text-[13px] px-2.5 py-2 border rounded-[5px] bg-white focus:outline-none focus:border-navy-lt focus:ring-2 focus:ring-navy-lt/20 ${
          hasError ? "border-neg bg-[#FEF8F7]" : "border-border"
        }`}
      >
        <span className={value ? "text-ink" : "text-ink-2"}>{value ? isoToDisplay(value) : placeholder}</span>
        <Calendar size={14} className="flex-none text-ink-2" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose a date"
          className="absolute z-20 mt-1.5 w-72 rounded-lg border border-border bg-white shadow-lg p-3"
        >
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex-none w-7 h-7 rounded-md border border-border text-ink-2 hover:bg-tint flex items-center justify-center"
              aria-label="Previous month"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center gap-1 min-w-0">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="text-[12px] font-semibold text-navy border border-border-lt rounded px-1 py-1 bg-white"
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="text-[12px] font-semibold text-navy border border-border-lt rounded px-1 py-1 bg-white"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex-none w-7 h-7 rounded-md border border-border text-ink-2 hover:bg-tint flex items-center justify-center"
              aria-label="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((d) => (
              <span key={d} className="text-center text-[10px] font-semibold text-ink-2">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <span key={"blank" + i} />;
              const iso = toIso(viewYear, viewMonth, day);
              const disabled = (!!min && iso < min) || (!!max && iso > max);
              const isSelected = iso === value;
              const isToday = iso === today;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`h-7 rounded-md text-[12px] font-num tabular-nums ${
                    isSelected
                      ? "bg-navy text-white font-bold"
                      : disabled
                        ? "text-border cursor-not-allowed"
                        : isToday
                          ? "border border-gold-dk text-navy font-semibold hover:bg-tint"
                          : "text-ink hover:bg-tint"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
