import { IRecurrenceRule, EFreq, IWeekdayNum, EWeekday } from "./types/icalendar.types";

interface IDate {
    day: number;
    month: number;
    year: number;
}

interface ITime {
    hour: number;
    minute: number;
    second: number;
    z: boolean;
}

export class Helper {
    public parseWeekday(s: string): EWeekday {
        const key = Object.keys(EWeekday).find(r => r.startsWith(s));
        return key ? EWeekday[key] : EWeekday.MONDAY;
    }

    public parseDateTime(s: string): number {
        const [datepart, timepart] = s.split("T");
        const d = this.parseDate(datepart);
        const t = this.parseTime(timepart);
        return t.z ? Date.UTC(d.year, d.month - 1, d.day, t.hour, t.minute, t.second) :
            new Date(d.year, d.month - 1, d.day, t.hour, t.minute, t.second).getTime();
    }

    public parseDateOrDateTime(s: string): number {
        const [datepart, timepart] = s.split("T");
        const d = this.parseDate(datepart);
        const t: ITime = timepart ? this.parseTime(timepart) : { hour: 0, minute: 0, second: 0, z: false };
        return t.z ? Date.UTC(d.year, d.month - 1, d.day, t.hour, t.minute, t.second) :
            new Date(d.year, d.month - 1, d.day, t.hour, t.minute, t.second).getTime();
    }

    public parseRrule(s: string): IRecurrenceRule {
        const result: IRecurrenceRule = { FREQ: EFreq.DAILY };
        s.substr("RRULE:".length).split(";").forEach(token => {
            const [key, val] = token.split("=");
            switch (key) {
                case "FREQ": {
                    result.FREQ = EFreq[val];
                    break;
                }
                case "UNTIL": {
                    result.UNTIL = this.parseDateOrDateTime(val);
                    break;
                }
                case "COUNT": {
                    result.COUNT = Number(val);
                    break;
                }
                case "INTERVAL": {
                    result.INTERVAL = Number(val);
                    break;
                }
                case "BYDAY": {
                    result.BYDAY = this.parseBywdaylist(val);
                    break;
                }
                case "BYMONTHDAY": {
                    result.BYMONTHDAY = this.parseNumberList(val);
                    break;
                }
                case "BYYEARDAY": {
                    result.BYYEARDAY = this.parseNumberList(val);
                    break;
                }
                case "BYWEEKNO": {
                    result.BYWEEKNO = this.parseNumberList(val);
                    break;
                }
                case "BYMONTH": {
                    result.BYMONTH = this.parseNumberList(val);
                    break;
                }
                case "BYSETPOS": {
                    result.BYSETPOS = this.parseNumberList(val);
                    break;
                }
                case "WKST": {
                    result.WKST = this.parseWeekday(val);
                    break;
                }
                default: {
                    // Don't support for now
                    break;
                }
            }
        });
        return result;
    }

    private parseDate(s: string): IDate {
        return {
            year: Number(s.substr(0, 4)),
            month: Number(s.substr(4, 2)),
            day: Number(s.substr(6)),
        };
    }

    private parseTime(s: string): ITime {
        return {
            hour: Number(s.substr(0, 2)),
            minute: Number(s.substr(2, 2)),
            second: Number(s.substr(4, 2)),
            z: s.endsWith("Z"),
        };
    }

    private parseBywdaylist(s: string): IWeekdayNum[] {
        return s.split(",").map(weekdaynum => ({
            ordwk: weekdaynum.length === 2 ? 0 : Number(weekdaynum.substr(0, weekdaynum.length - 2)),
            weekday: this.parseWeekday(weekdaynum.substr(weekdaynum.length - 2)),
        }));
    }

    private parseNumberList(s: string): number[] {
        return s.split(",").map(r => Number(r));
    }
}
