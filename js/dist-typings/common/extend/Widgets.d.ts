export type Placement = 'start_top' | 'start_bottom' | 'end' | 'top' | 'bottom';
export type Widget = {
    id?: string;
    key: string;
    component: any;
    placement: Placement;
    isDisabled: boolean | (() => boolean);
    isUnique: boolean;
    position?: number;
    extension?: string;
    state?: any;
};
export default class Widgets {
    private widgets;
    add(widget: Widget): this;
    extend(app: any, extension: string): void;
}
