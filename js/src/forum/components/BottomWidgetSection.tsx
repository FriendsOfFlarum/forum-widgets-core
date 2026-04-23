import app from 'flarum/forum/app';
import * as Mithril from 'mithril';
import Component from 'flarum/common/Component';

import sortWidgets from '../../common/utils/sortWidgets';

export default class BottomWidgetSection extends Component {
  view(): Mithril.Children {
    if ((app.current.data as any).routeName !== 'index') return null;
    if (!app.widgets.get('bottom').length) return null;

    return (
      <div className="container">
        <div className="FofWidgets-bottomWidgetSection FofWidgets-WidgetSection">
          {sortWidgets(app.widgets.get('bottom')).map((widget) => widget.component.component({ state: widget.state }))}
        </div>
      </div>
    );
  }
}
