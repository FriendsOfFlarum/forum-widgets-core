import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import PageStructure from 'flarum/forum/components/PageStructure';
import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import type ItemList from 'flarum/common/utils/ItemList';

import WidgetManager from '../common/WidgetManager';
import EndWidgetSection from './components/EndWidgetSection';
import StartTopWidgetSection from './components/StartTopWidgetSection';
import StartBottomWidgetSection from './components/StartBottomWidgetSection';
import TopWidgetSection from './components/TopWidgetSection';
import BottomWidgetSection from './components/BottomWidgetSection';

app.widgets = new WidgetManager();

app.initializers.add('fof/forum-widgets-core', () => {
  app.widgets.setConfig((app.data.resources[0] as any)?.attributes['fof-forum-widgets-core.config']);

  extend(PageStructure.prototype, 'mainItems', function (items: ItemList<any>) {
    items.add('topWidgetSection', <TopWidgetSection />, 15);
    items.add('bottomWidgetSection', <BottomWidgetSection />, 5);
  });

  extend(PageStructure.prototype, 'containerItems', function (items: ItemList<any>) {
    items.add('endWidgetSection', <EndWidgetSection />, 1);
  });

  extend(IndexSidebar.prototype, 'items', (items: ItemList<any>) => {
    if (app.widgets.get('start_top').length) {
      items.add('startTopWidgetSection', <StartTopWidgetSection />, 100);
    }
    if (app.widgets.get('start_bottom').length) {
      items.add('startBottomWidgetSection', <StartBottomWidgetSection />, -100);
    }
  });
});

// Allow flarum to discover modules
import './forum';
// @ts-ignore
