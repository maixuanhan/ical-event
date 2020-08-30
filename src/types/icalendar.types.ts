
export type TimestampMs = number;

export enum EEventType {
    SINGLE,
    RECURRINGMASTER,
    OCCURRENCE,
    EXCEPTION,
}

export enum EFreq {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}

export enum EWeekday {
    SUNDAY,
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
}

export interface IWeekdayNum {
    ordwk: number;          // -53..-1, 1..53
    weekday: EWeekday;
}

export interface IRecurrenceRule {
    FREQ: EFreq;
    UNTIL?: TimestampMs;
    COUNT?: number;
    INTERVAL?: number;
    BYDAY?: IWeekdayNum[];
    BYMONTHDAY?: number[];   // -31..-1, 1..31
    BYYEARDAY?: number[];    // -366..-1, 1..366
    BYWEEKNO?: number[];     // -53..-1, 1..53
    BYMONTH?: number[];      // 1..12
    BYSETPOS?: number[];     // -366..-1, 1..366
    WKST?: EWeekday;
}

export interface ITimelineEntry {
    event: IEvent;
    startTime: TimestampMs;
    endTime: TimestampMs;
}

export interface IEvent {
    uid: string;
    oridtstart?: TimestampMs;
    dtstart: TimestampMs;
    dtend?: TimestampMs;
    duration?: TimestampMs;
    type: EEventType;
    organizer?: string;
    isCancelled?: boolean;
    recurid?: string;
    rrule?: IRecurrenceRule;
    attendee?: string[];
    exdate?: ITimelineEntry[];
    rdate?: ITimelineEntry[];
}
