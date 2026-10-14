import type Mithril from 'mithril';
export type Placement = 'start_top' | 'start_bottom' | 'end' | 'top' | 'bottom';
export type Widget = {
    id?: string;
    key: string;
    component: any;
    placement: Placement;
    isDisabled: boolean | (() => boolean);
    isUnique: boolean;
    position?: number;
    /**
     * The widget's label in the admin layout editor only — the forum header
     * still comes from the component's own `title()`. Optional: without it the
     * tile shows the extension's title, which cannot tell apart several widgets
     * from one extension. A callback is only called by the editor, so it can
     * use an admin translation key although widgets are registered in both
     * frontends.
     */
    title?: Mithril.Children | (() => Mithril.Children);
    /** The widget's icon in the admin layout editor only, e.g. 'fas fa-chart-line'. Defaults to the extension's icon. */
    icon?: string;
    extension?: string;
    state?: any;
};
export default class Widgets {
    private widgets;
    add(widget: Widget): this;
    extend(app: any, extension: string): void;
}
