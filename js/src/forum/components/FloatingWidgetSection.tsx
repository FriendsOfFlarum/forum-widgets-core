import app from 'flarum/forum/app';
import * as Mithril from 'mithril';
import Component from 'flarum/common/Component';
import Icon from 'flarum/common/components/Icon';
import classList from 'flarum/common/utils/classList';

import sortWidgets from '../../common/utils/sortWidgets';

// While the dock is open this class locks the background scroll (see forum.less).
const LOCK_CLASS = 'FofWidgets-floatingLock';

/**
 * A dock, fixed to the bottom-right of every page, holding the widgets an admin
 * assigned to the `floating` placement. It starts collapsed as a launcher
 * button; clicking it expands a panel with the widget(s) above the button.
 *
 * Unlike the other sections this is not tied to a route or the index sidebar:
 * `forum/index` mounts it on its own root on the document body so it is present
 * everywhere and its open/closed state (and each widget's loaded content)
 * survives SPA navigation instead of remounting on every page change.
 *
 * The widgets are rendered the first time the dock opens, not before, so
 * visitors who never open it load none of them. After that the panel stays in
 * the page, hidden while closed, so reopening it shows the same widgets with
 * their content intact instead of mounting them again.
 */
export default class FloatingWidgetSection extends Component {
  open: boolean = false;

  // Whether the dock has been opened at least once (see the class comment).
  opened: boolean = false;

  // The launcher button. Held directly rather than found through this.element:
  // the dock usually mounts before any widget registers, so its first render is
  // empty and this.element is never set.
  toggleButton?: HTMLElement;

  // Escape closes the dock and hands focus back to the launcher button.
  onkeydown = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape' || !this.open) return;

    this.setOpen(false);
    m.redraw();
    this.toggleButton?.focus();
  };

  oncreate(vnode: Mithril.VnodeDOM<{}, this>): void {
    super.oncreate(vnode);
    document.addEventListener('keydown', this.onkeydown);
  }

  onremove(vnode: Mithril.VnodeDOM<{}, this>): void {
    super.onremove(vnode);
    document.removeEventListener('keydown', this.onkeydown);
    // Never leave the scroll lock behind if the dock is torn down while open.
    document.documentElement.classList.remove(LOCK_CLASS);
  }

  setOpen(open: boolean): void {
    this.open = open;
    if (open) this.opened = true;
    // On phones the panel is a full-screen takeover, so lock the background
    // scroll while it is open. The class goes on the scrolling element (<html>)
    // and the rule is scoped to the phone breakpoint, so this is a no-op on
    // desktop where the dock is only a small corner overlay.
    document.documentElement.classList.toggle(LOCK_CLASS, open);
  }

  view(): Mithril.Children {
    const widgets = app.widgets.get('floating');

    // Nothing assigned to the placement: render nothing at all (no empty
    // button hanging in the corner).
    if (!widgets.length) return null;

    return (
      <div
        className={classList('FofWidgets-floatingWidgetSection', {
          'FofWidgets-floatingWidgetSection--open': this.open,
        })}
      >
        {this.opened ? (
          <div
            className="FofWidgets-floatingWidgetSection-panel"
            role="dialog"
            // Full screen on phones, where it covers the page; a corner overlay elsewhere.
            aria-modal={app.screen() === 'phone' ? 'true' : 'false'}
            // Closed: kept in the page but hidden, which also takes it out of the
            // tab order and away from screen readers.
            hidden={!this.open}
          >
            <div className="FofWidgets-floatingWidgetSection-panelBody">
              {sortWidgets(widgets).map((widget) => widget.component.component({ state: widget.state }))}
            </div>
          </div>
        ) : null}
        <button
          type="button"
          className="Button FofWidgets-floatingWidgetSection-toggle"
          aria-expanded={this.open ? 'true' : 'false'}
          aria-label={app.translator.trans(`fof-forum-widgets-core.forum.floating.${this.open ? 'close' : 'open'}`)}
          oncreate={(vnode: Mithril.VnodeDOM) => (this.toggleButton = vnode.dom as HTMLElement)}
          onclick={() => this.setOpen(!this.open)}
        >
          <Icon name={this.open ? 'fas fa-chevron-down' : 'fas fa-layer-group'} />
        </button>
      </div>
    );
  }
}
