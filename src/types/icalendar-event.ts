import { IEvent, EEventType, EFreq, ITimelineEntry, EWeekday } from "./icalendar.types";

const EXPAND_YEAR = 100;

function findIntersection(a: Date[], b: Date[]): Date[] {
    const t = new Set<number>();
    a.forEach(r => t.add(r.getTime()));
    return b.filter(r => t.has(r.getTime()));
}

export interface IActionResult {
    success: boolean;
    message?: string;
}

export class Event {
    constructor(private event: IEvent) {
    }

    public validate(): IActionResult {
        try {
            const event = this.event;
            if (!event.dtend && !event.duration) {
                throw new Error("Invalid data: Either dtend or duration must be specified");
            }
            if (event.type === EEventType.RECURRINGMASTER) {
                if (!event.rrule) {
                    throw new Error("Missing rule");
                }
                const { rrule } = event;
                if (rrule.INTERVAL && rrule.INTERVAL < 1) {
                    throw new Error("Invalid rule: INTERVAL must be positive number");
                }
                if (rrule.BYDAY && rrule.BYDAY.some(r => r.ordwk)) {
                    if (rrule.FREQ !== EFreq.MONTHLY && rrule.FREQ !== EFreq.YEARLY) {
                        throw new Error("Invalid rule: The BYDAY.ordwk can be used only with MONTHLY or YEARLY freq");
                    }
                    if (rrule.BYWEEKNO) {
                        throw new Error("Invalid rule: The BYDAY.ordwk cannot be used with BYWEEKNO");
                    }
                }
                if (rrule.BYWEEKNO && rrule.FREQ !== EFreq.YEARLY) {
                    throw new Error("Invalid rule: BYWEEKNO requires YEARLY freq");
                }
                if (rrule.BYYEARDAY &&
                    (rrule.FREQ === EFreq.DAILY || rrule.FREQ === EFreq.WEEKLY || rrule.FREQ === EFreq.MONTHLY)) {
                    throw new Error("Invalid rule: BYYEARDAY cannot be used with DAILY, WEEKLY, and MONTHLY freqs");
                }
                if (rrule.BYMONTHDAY && rrule.FREQ === EFreq.WEEKLY) {
                    throw new Error("Invalid rule: BYMONTHDAY cannot be used with WEEKLY freq");
                }
                if (rrule.BYMONTH && rrule.FREQ !== EFreq.YEARLY) {
                    throw new Error("Invalid rule: BYMONTH requires YEARLY freq");
                }
                if (rrule.BYSETPOS && rrule.FREQ !== EFreq.MONTHLY && rrule.FREQ !== EFreq.YEARLY) {
                    throw new Error("Invalid rule: BYSETPOS requires MONTHLY or YEARLY freq");
                }
            }
        } catch (ex) {
            const err: Error = ex;
            return {
                success: false,
                message: err.message,
            };
        }
        return { success: true };
    }

    public expandTimelines(): ITimelineEntry[] {
        if (this.event.type !== EEventType.RECURRINGMASTER) {
            return [{
                event: this.event,
                startTime: this.event.dtstart,
                endTime: this.event.dtend,
            }];
        }
        const { rrule, dtstart, dtend, rdate, exdate } = this.event;
        const { FREQ, BYMONTH, BYWEEKNO, BYYEARDAY, BYMONTHDAY, BYSETPOS, COUNT, UNTIL } = rrule;
        const duration = this.event.duration ? this.event.duration : dtend - dtstart;
        const serieStart = new Date(dtstart);
        const serieEnd = new Date(UNTIL ? UNTIL : dtstart + EXPAND_YEAR * 366 * 24 * 60 * 60 * 1000);
        const interval = rrule.INTERVAL || 1;
        const weekStart = rrule.WKST ?? EWeekday.MONDAY;
        const byday = rrule.BYDAY ?
            [...rrule.BYDAY].sort((a, b) => (a.weekday + 7 - weekStart) % 7 - (b.weekday + 7 - weekStart) % 7) : [];
        const bymonthday = rrule.BYMONTHDAY ? [...rrule.BYMONTHDAY] : [];
        const bymonth = rrule.BYMONTH ? [...rrule.BYMONTH] : [];
        const dates: ITimelineEntry[] = [];
        const pushResult = (startTime: Date): void => {
            dates.push({
                event: this.event,
                startTime: startTime.getTime(),
                endTime: startTime.getTime() + duration,
            });
        };
        const isInbound = (date: Date): boolean => {
            return date >= serieStart && date <= serieEnd;
        };
        const isCountNotReached = (): boolean => {
            return !COUNT || dates.length < COUNT;
        };
        switch (FREQ) {
            case EFreq.YEARLY: {
                break;
            }
            case EFreq.MONTHLY: {
                if (!byday.length && !bymonthday.length) {
                    bymonthday.push(serieStart.getDate());
                }
                const monthDates: Date[] = [];
                if (bymonthday.length) {
                    let currentDate = new Date(serieStart.getTime());
                    // move back to first day of the month
                    currentDate.setDate(1);
                    while (isInbound(currentDate) || currentDate < serieStart) {
                        bymonthday.map(r => {
                            const d = new Date(currentDate.getTime());
                            if (r > 0) {
                                d.setDate(d.getDate() + r - 1);
                            } else {
                                d.setMonth(d.getMonth() + 1);
                                d.setDate(d.getDate() + r);
                            }
                            return d;
                        }).forEach(r => {
                            if (isInbound(r)) {
                                monthDates.push(r);
                            }
                        });
                        currentDate = new Date(currentDate.getTime());
                        currentDate.setMonth(currentDate.getMonth() + interval);
                    }
                }
                const dayDates: Date[] = [];
                if (byday.length) {
                    let currentDate = new Date(serieStart.getTime());
                    // move back to first day of the month
                    currentDate.setDate(1);
                    while (isInbound(currentDate) || currentDate < serieStart) {
                        byday.forEach(r => {
                            let d = new Date(currentDate.getTime());
                            d.setDate(d.getDate() + (r.weekday + 7 - d.getDay()) % 7);
                            const ds: Date[] = [];
                            while (d.getMonth() === currentDate.getMonth()) {
                                ds.push(d);
                                d = new Date(d.getTime());
                                d.setDate(d.getDate() + 7);
                            }
                            if (!r.ordwk) {
                                dayDates.push(...ds);
                            } else if (r.ordwk > 0 && r.ordwk <= ds.length) {
                                dayDates.push(ds[r.ordwk - 1]);
                            } else if (r.ordwk < 0 && r.ordwk + ds.length >= 0) {
                                dayDates.push(ds[r.ordwk + ds.length]);
                            }
                        });
                        currentDate = new Date(currentDate.getTime());
                        currentDate.setMonth(currentDate.getMonth() + interval);
                    }
                }
                if (bymonthday.length && byday.length) {
                    findIntersection(monthDates, dayDates).forEach(r => pushResult(r));
                } else if (bymonthday.length) {
                    monthDates.forEach(r => pushResult(r));
                } else if (byday.length) {
                    dayDates.forEach(r => pushResult(r));
                }
                break;
            }
            case EFreq.WEEKLY: {
                if (!byday.length) {
                    byday.push({ ordwk: 0, weekday: serieStart.getDay() });
                }
                let currentDate = new Date(serieStart.getTime());
                currentDate.setDate(currentDate.getDate() - (currentDate.getDay() + 7 - weekStart) % 7);
                while ((isInbound(currentDate) || currentDate < serieStart) && isCountNotReached()) {
                    byday.map(r => {
                        const d = new Date(currentDate.getTime());
                        d.setDate(d.getDate() + (r.weekday + 7 - weekStart) % 7);
                        return d;
                    }).forEach(r => {
                        if (isInbound(r) && isCountNotReached()) {
                            pushResult(r);
                        }
                    });
                    currentDate = new Date(currentDate.getTime());
                    currentDate.setDate(currentDate.getDate() + 7 * interval);
                }
                break;
            }
            case EFreq.DAILY: {
                let currentDate = new Date(serieStart.getTime());
                while (isInbound(currentDate) && isCountNotReached()) {
                    if (!bymonth.length || bymonth.some(r => currentDate.getMonth() + 1 === r)) {
                        pushResult(currentDate);
                    }
                    currentDate = new Date(currentDate.getTime());
                    currentDate.setDate(currentDate.getDate() + interval);
                }
                break;
            }
            default:
                break;
        }
        const sorted = dates.sort((a, b) => a.startTime - b.startTime);
        return rrule.COUNT && rrule.COUNT < dates.length ? sorted.slice(0, rrule.COUNT) : sorted;
    }
}
