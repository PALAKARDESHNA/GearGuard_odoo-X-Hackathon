/// <reference types="react-scripts" />

declare module 'react-big-calendar' {
  export interface CalendarProps {
    localizer: any;
    events: any[];
    startAccessor: string;
    endAccessor: string;
    style?: React.CSSProperties;
    onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
    onSelectEvent?: (event: any) => void;
    selectable?: boolean;
    eventPropGetter?: (event: any) => { style?: React.CSSProperties };
    defaultView?: string;
    views?: string[];
    popup?: boolean;
  }
  export class Calendar extends React.Component<CalendarProps> {}
  export function momentLocalizer(moment: any): any;
}