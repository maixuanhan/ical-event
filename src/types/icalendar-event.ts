import { IEvent, EEventType, EFreq, ITimelineEntry, EWeekday } from "./icalendar.types";
import { AggregateHelper } from "../aggregate-helper";

const EXPAND_YEAR = 100;

// function findIntersection(a: Date[], b: Date[]): Date[] {
//     const t = new Set<number>();
//     a.forEach(r => t.add(r.getTime()));
//     return b.filter(r => t.has(r.getTime()));
// }

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
                if (rrule.BYMONTH && rrule.BYMONTH.some(r => r < 1 || r > 12)) {
                    throw new Error("Invalid rule: Invalid BYMONTH value");
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

    public expandRrule(): ITimelineEntry[] {
        if (this.event.type !== EEventType.RECURRINGMASTER) {
            return [];
        }

        const aggregater = new AggregateHelper<Date>(
            (x) => x.getTime().toString(),
            (a, b) => a.getTime() - b.getTime(),
        );

        const { rrule, dtstart, dtend, rdate, exdate } = this.event;
        const { FREQ, COUNT, UNTIL } = rrule;
        const duration = this.event.duration ? this.event.duration : dtend - dtstart;
        const serieStart = new Date(dtstart);
        const serieEnd = new Date(UNTIL ? UNTIL : dtstart + EXPAND_YEAR * 366 * 24 * 60 * 60 * 1000);
        const interval = rrule.INTERVAL || 1;
        const weekStart = rrule.WKST ?? EWeekday.MONDAY;
        const byday = rrule.BYDAY ?
            [...rrule.BYDAY].sort((a, b) => (a.weekday + 7 - weekStart) % 7 - (b.weekday + 7 - weekStart) % 7) : [];
        const bymonthday = rrule.BYMONTHDAY ? [...rrule.BYMONTHDAY] : [];
        const bymonth = rrule.BYMONTH ? [...rrule.BYMONTH] : [];
        const bysetpos = rrule.BYSETPOS ? [...rrule.BYSETPOS] : [];
        const byyearday = rrule.BYYEARDAY ? [...rrule.BYYEARDAY] : [];
        const byweekno = rrule.BYWEEKNO ? [...rrule.BYWEEKNO] : [];
        const dates: ITimelineEntry[] = [];
        const pushResult = (startTime: Date): void => {
            dates.push({
                event: this.event,
                startTime: startTime.getTime(),
                endTime: startTime.getTime() + duration,
            });
        };
        const isInbound = (date: Date): boolean => {
            return serieStart <= date && date <= serieEnd;
        };
        const isCountNotReached = (): boolean => {
            return !COUNT || dates.length < COUNT;
        };
        switch (FREQ) {
            case EFreq.YEARLY: {
                if (!byday.length && !bymonthday.length && !byyearday.length) {
                    if (bymonth.length || !byweekno.length) {
                        bymonthday.push(serieStart.getDate());
                        if (!bymonth.length) {
                            bymonth.push(serieStart.getMonth() + 1);
                        }
                    } else if (byweekno.length) {
                        byday.push({ ordwk: 0, weekday: serieStart.getDay() });
                    }
                }

                let currentDate = new Date(serieStart.getTime());
                // move back to first day of the year
                currentDate.setDate(1);
                currentDate.setMonth(0);
                while (currentDate <= serieEnd && isCountNotReached()) {
                    const fromByMonth: Date[] = [];
                    const fromByWeekno: Date[] = [];
                    const fromByyearday: Date[] = [];
                    let fromByday: Date[] = [];

                    bymonth.forEach(m => {
                        const monthDates: Date[] = [];
                        const dayDates: Date[] = [];
                        const localCurrentDate = new Date(currentDate.getTime());
                        localCurrentDate.setMonth(m - 1);
                        bymonthday.map(r => {
                            const d = new Date(localCurrentDate.getTime());
                            if (r > 0) {
                                d.setDate(d.getDate() + r - 1);
                            } else {
                                d.setMonth(d.getMonth() + 1);
                                d.setDate(d.getDate() + r);
                            }
                            return d;
                        }).forEach(r => {
                            if (isInbound(r) && r.getMonth() === localCurrentDate.getMonth()) {
                                monthDates.push(r);
                            }
                        });

                        byday.forEach(r => {
                            let d = new Date(localCurrentDate.getTime());
                            d.setDate(d.getDate() + (r.weekday + 7 - d.getDay()) % 7);
                            const ds: Date[] = [];
                            while (d.getMonth() === localCurrentDate.getMonth()) {
                                ds.push(d);
                                d = new Date(d.getTime());
                                d.setDate(d.getDate() + 7);
                            }
                            if (!r.ordwk) {
                                dayDates.push(...ds.filter(dd => isInbound(dd)));
                            } else if (r.ordwk > 0 && r.ordwk <= ds.length) {
                                if (isInbound(ds[r.ordwk - 1])) {
                                    dayDates.push(ds[r.ordwk - 1]);
                                }
                            } else if (r.ordwk < 0 && r.ordwk + ds.length >= 0) {
                                if (isInbound(ds[r.ordwk + ds.length])) {
                                    dayDates.push(ds[r.ordwk + ds.length]);
                                }
                            }
                        });

                        let intermediateResult: Date[] = [];
                        if (bymonthday.length && byday.length) {
                            intermediateResult = aggregater.join(monthDates, dayDates);
                        } else if (bymonthday.length) {
                            intermediateResult = monthDates;
                        } else if (byday.length) {
                            intermediateResult = dayDates;
                        }
                        fromByMonth.push(...intermediateResult);
                    });

                    byweekno.forEach(w => {
                        const localCurrentDate = new Date(currentDate.getTime());
                        localCurrentDate.setDate(4);
                        localCurrentDate.setDate(4 - (localCurrentDate.getDay() + 7 - weekStart) % 7);
                        localCurrentDate.setDate(localCurrentDate.getDate() + (w - 1) * 7);
                        fromByWeekno.push(...byday.map(r => {
                            const d = new Date(localCurrentDate.getTime());
                            d.setDate(d.getDate() + (r.weekday + 7 - weekStart) % 7);
                            return d;
                        }));
                    });

                    byyearday.forEach(r => {
                        if (!r) { return; }
                        const d = new Date(currentDate.getTime());
                        if (r > 0) {
                            d.setDate(d.getDate() + r - 1);
                        } else {
                            d.setFullYear(d.getFullYear() + 1);
                            d.setDate(d.getDate() + r);
                        }
                        if (isInbound(d) && d.getFullYear() === currentDate.getFullYear()) {
                            fromByyearday.push(d);
                        }
                    });

                    byday.forEach(r => {
                        if (!r.ordwk) { return; }
                        const d = new Date(currentDate.getTime());
                        if (r.ordwk > 0) {
                            d.setDate(d.getDate() + (r.weekday + 7 - d.getDay()) % 7 + (r.ordwk - 1) * 7);
                        } else if (r.ordwk < 0) {
                            d.setFullYear(d.getFullYear() + 1);
                            d.setDate(d.getDate() + (r.weekday + 7 - d.getDay()) % 7 + r.ordwk * 7);
                        }
                        if (d.getFullYear() === currentDate.getFullYear()) {
                            fromByday.push(d);
                        }
                    });
                    if (bysetpos.length && fromByday.length) {
                        const newFromByday: Date[] = [];
                        fromByday.sort((a, b) => a.getTime() - b.getTime());
                        bysetpos.forEach(r => {
                            const idx = r > 0 ? r - 1 : r + fromByday.length;
                            if (0 <= idx && idx < fromByday.length && isInbound(fromByday[idx])) {
                                newFromByday.push(fromByday[idx]);
                            }
                        });
                        fromByday = newFromByday;
                    }

                    const list: Date[][] = [];
                    if (fromByMonth.length) { list.push(fromByMonth); }
                    if (fromByWeekno.length) { list.push(fromByWeekno); }
                    if (fromByyearday.length) { list.push(fromByyearday); }
                    if (fromByday.length) { list.push(fromByday); }

                    let intermediateResult: Date[] = [];
                    if (list.length === 1) {
                        intermediateResult = list[0];
                    } else if (list.length > 1) {
                        intermediateResult = list.reduce((acc, cur) => aggregater.join(acc, cur));
                    }
                    intermediateResult.sort((a, b) => a.getTime() - b.getTime());
                    intermediateResult.forEach(r => {
                        if (isCountNotReached()) {
                            pushResult(r);
                        }
                    });

                    currentDate = new Date(currentDate.getTime());
                    currentDate.setFullYear(currentDate.getFullYear() + interval);
                }
                break;
            }
            case EFreq.MONTHLY: {
                if (!byday.length && !bymonthday.length) {
                    bymonthday.push(serieStart.getDate());
                }

                let currentDate = new Date(serieStart.getTime());
                // move back to first day of the month
                currentDate.setDate(1);
                while (currentDate <= serieEnd && isCountNotReached()) {
                    const fromBymonthday: Date[] = [];
                    let fromByday: Date[] = [];
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
                        if (isInbound(r) && r.getMonth() === currentDate.getMonth()) {
                            fromBymonthday.push(r);
                        }
                    });

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
                            fromByday.push(...ds);
                        } else if (r.ordwk > 0 && r.ordwk <= ds.length) {
                            fromByday.push(ds[r.ordwk - 1]);
                        } else if (r.ordwk < 0 && r.ordwk + ds.length >= 0) {
                            fromByday.push(ds[r.ordwk + ds.length]);
                        }
                    });
                    if (bysetpos.length && fromByday.length) {
                        const newFromByday: Date[] = [];
                        fromByday.sort((a, b) => a.getTime() - b.getTime());
                        bysetpos.forEach(r => {
                            const idx = r > 0 ? r - 1 : r + fromByday.length;
                            if (0 <= idx && idx < fromByday.length && isInbound(fromByday[idx])) {
                                newFromByday.push(fromByday[idx]);
                            }
                        });
                        fromByday = newFromByday;
                    }

                    let intermediateResult: Date[] = [];
                    if (bymonthday.length && byday.length) {
                        intermediateResult = aggregater.join(fromBymonthday, fromByday);
                    } else if (bymonthday.length) {
                        intermediateResult = fromBymonthday;
                    } else if (byday.length) {
                        intermediateResult = fromByday;
                    }
                    intermediateResult.sort((a, b) => a.getTime() - b.getTime());
                    intermediateResult.forEach(r => {
                        if (isCountNotReached()) {
                            pushResult(r);
                        }
                    });

                    currentDate = new Date(currentDate.getTime());
                    currentDate.setMonth(currentDate.getMonth() + interval);
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
        return rrule.COUNT && rrule.COUNT < sorted.length ? sorted.slice(0, rrule.COUNT) : sorted;
    }

    public expand(): ITimelineEntry[] {
        if (this.event.type !== EEventType.RECURRINGMASTER) {
            return [{
                event: this.event,
                startTime: this.event.dtstart,
                endTime: this.event.dtend,
            }];
        }

        const aggregater = new AggregateHelper<ITimelineEntry>(
            (x) => x.startTime.toString(),
            (a, b) => a.startTime - b.startTime,
        );
        const fromRrule = this.expandRrule();
        const fromRdate = this.event.rdate || [];
        const fromExdate = this.event.exdate || [];
        return aggregater.exclude(aggregater.union(fromRrule, fromRdate), fromExdate);
    }
}
