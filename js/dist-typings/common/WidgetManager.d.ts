import { Widget } from '../common/extend/Widgets';
export default class WidgetManager {
    widgets: Widget[];
    /**
     * We only have this because the way we're injecting the widget sections
     * ends up with the widgets rerendering on navigation.
     */
    states: any;
    private config;
    /**
     * The pages widgets show on, as page components or module paths. Pages
     * that extend one of them show widgets too.
     */
    private pages;
    /**
     * Show widgets on a page, given its component or its module path, such as
     * `'ext:acme/example/forum/components/ExamplePage'`.
     */
    addPage(page: Function | string): this;
    /**
     * Whether the current page shows widgets.
     */
    onWidgetPage(): boolean;
    add(widget: Widget, extension: any): void;
    getbyId(id: string): Widget | null;
    getWidgetInstances(): Widget[];
    get(placement: string, withHidden?: boolean): Widget[];
    setConfig(config: any): void;
}
