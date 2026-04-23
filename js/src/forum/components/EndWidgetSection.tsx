import app from 'flarum/forum/app';
import * as Mithril from 'mithril';
import Component from 'flarum/common/Component';

import sortWidgets from '../../common/utils/sortWidgets';

export default class EndWidgetSection extends Component {
  view(): Mithril.Children {
    if ((app.current.data as any).routeName !== 'index') return null;
    if (!app.widgets.get('end').length) return null;

    return (
      <div className="FofWidgets-sideNavAlt FofWidgets-WidgetSection">
        {sortWidgets(app.widgets.get('end')).map((widget) => widget.component.component({ state: widget.state }))}
      </div>
    );
  }
}
