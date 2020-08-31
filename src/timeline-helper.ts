import { ITimelineEntry, EWeekday } from "./types/icalendar.types";

export interface ITimeUsed {
    startTime: number;
    duration: number;
}

export class TimelineHelper {
    private daily: Map<number, number>;
    private weekly: Map<number, number>;
    private monthly: Map<number, number>;

    constructor(
        private timelines: ITimelineEntry[],
        private firstDayOfWeek: EWeekday = EWeekday.MONDAY,
    ) {
        this.timelines.sort((a, b) => a.startTime - b.startTime);
        this.daily = new Map();
        this.weekly = new Map();
        this.monthly = new Map();
    }

    public getLength() {
        return this.getLastTime() - this.getFirstTime();
    }

    public countTimeUsed(): void {
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        this.timelines.forEach(r => {
            let key = this.hashDay(r.startTime);
            let currentDuration = this.daily.get(key) ?? 0;
            currentDuration -= r.startTime - key;
            while (key < r.endTime) {
                currentDuration += Math.min(r.endTime - key, ONE_DAY_MS);
                this.daily.set(key, currentDuration);
                key += ONE_DAY_MS;
                currentDuration = this.daily.get(key) ?? 0;
            }
        });
        this.daily.forEach((v, k) => {
            const weekKey = this.hashWeek(k);
            this.weekly.set(weekKey, (this.weekly.get(weekKey) ?? 0) + v);
            const monthKey = this.hashMonth(k);
            this.monthly.set(monthKey, (this.monthly.get(monthKey) ?? 0) + v);
        });
    }

    public getDailyUsed(): ITimeUsed[] {
        return this.mapToArray(this.daily);
    }

    public getWeeklyUsed(): ITimeUsed[] {
        return this.mapToArray(this.weekly);
    }

    public getMonthlyUsed(): ITimeUsed[] {
        return this.mapToArray(this.monthly);
    }

    private mapToArray(x: Map<number, number>): ITimeUsed[] {
        const result: ITimeUsed[] = [];
        x.forEach((v, k) => result.push({ startTime: k, duration: v }));
        return result;
    }

    private hashDay(x: number) {
        const d = new Date(x);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }

    private hashWeek(x: number) {
        const d = new Date(x);
        d.setDate(d.getDate() - (d.getDay() + 7 - this.firstDayOfWeek) % 7);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }

    private hashMonth(x: number) {
        const d = new Date(x);
        return new Date(d.getFullYear(), d.getMonth()).getTime();
    }

    private getFirstTime(): number {
        return this.timelines.length ? this.timelines[0].startTime : 0;
    }

    private getLastTime(): number {
        return this.timelines.length ? this.timelines[this.timelines.length - 1].endTime : 0;
    }
}
