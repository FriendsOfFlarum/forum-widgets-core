import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
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

  extend(IndexPage.prototype, 'contentItems', function (items: ItemList<any>) {
    items.add('topWidgetSection', <TopWidgetSection />, 110);
    items.add('bottomWidgetSection', <BottomWidgetSection />, -10);
    items.add('endWidgetSection', <EndWidgetSection />, -20);
  });

  extend(IndexSidebar.prototype, 'items', (items: ItemList<any>) => {
    items.add('startTopWidgetSection', <StartTopWidgetSection />, 100);
    items.add('startBottomWidgetSection', <StartBottomWidgetSection />, -100);
  });
});

// Allow flarum to discover modules
import './forum';
// @ts-ignore
