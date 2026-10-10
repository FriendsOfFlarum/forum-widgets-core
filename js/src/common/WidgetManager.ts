import app from 'flarum/common/app';
import { Widget } from '../common/extend/Widgets';

export default class WidgetManager {
  public widgets: Widget[] = [];

  /**
   * We only have this because the way we're injecting the widget sections
   * ends up with the widgets rerendering on navigation.
   */
  public states: any = {};

  private config: any = {};

  /**
   * The pages widgets show on, as page components or module paths. Pages
   * that extend one of them show widgets too.
   */
  private pages: (Function | string)[] = [];

  /**
   * Show widgets on a page, given its component or its module path, such as
   * `'ext:acme/example/forum/components/ExamplePage'`.
   */
  addPage(page: Function | string): this {
    this.pages.push(page);

    return this;
  }

  /**
   * Whether the current page shows widgets.
   */
  onWidgetPage(): boolean {
    return this.pages.some((page) => app.current.matches(page));
  }

  add(widget: Widget, extension: any): void {
    widget.extension = extension;
    widget.id = `${extension}:${widget.key}`;
    this.widgets.push(widget);
    this.states[widget.id] = {};
  }

  getbyId(id: string): Widget | null {
    return this.getWidgetInstances().find((w: Widget) => w.id === id) || null;
  }

  getWidgetInstances(): Widget[] {
    const disabled = this.config.disabled || [];
    // A saved widget its extension no longer registers (renamed or removed) has no component to render.
    const widgets = (this.config.instances || [])
      .filter((widget: any) => this.widgets.some((w: Widget) => w.id === widget.id))
      .map(
        (widget: any): Widget => ({
          ...this.widgets.find((w: Widget) => w.id === widget.id)!,
          ...widget,
        })
      );

    this.widgets.forEach((widget: Widget) => {
      const lookupWidget = widgets.find((w: any) => w.id === widget.id);

      if (!lookupWidget) {
        widgets.push(widget);
      }
    });

    return widgets.filter((widget: Widget) => !disabled.includes(widget.id));
  }

  get(placement: string, withHidden: boolean = false): Widget[] {
    const widgets: Widget[] = this.getWidgetInstances()
      .filter((widget: Widget) => widget.placement === placement)
      .filter((widget: Widget) => withHidden || (typeof widget.isDisabled === 'function' ? !widget.isDisabled() : !widget.isDisabled))
      .filter((widget: Widget) => {
        // @TODO forgetting to add the extension name on the saved data forces us to split the ID
        // remove this in a future version and use extension value directly.
        const extension = widget.extension || widget.id!.split(':')[0];

        return extension in flarum.extensions;
      })
      .map((widget: Widget) => ({ ...widget, extension: widget.extension || widget.id!.split(':')[0], state: this.states[widget.id!] }));

    return widgets;
  }

  setConfig(config: any): void {
    this.config = config;
  }
}
