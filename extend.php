<?php

/*
 * This file is part of fof/forum-widgets-core.
 *
 * Copyright (c) 2026 Friends of Flarum.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace FoF\ForumWidgets;

use Flarum\Extend;
use Flarum\Frontend\Document;
use function FoF\ForumWidgets\Helper\fof_cache_is_writable;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less')
        ->content(function (Document $document) {
            $document->payload['fof-forum-widgets-core.cache_store_writable'] = fof_cache_is_writable();
        }),

    new Extend\Locales(__DIR__.'/locale'),

    (new Extend\Settings)
        ->serializeToForum('fof-forum-widgets-core.config', 'fof-forum-widgets-core.config', function (?string $value): array {
            return $value ? json_decode($value, true) : [];
        })
        ->serializeToForum('fof-forum-widgets-core.preferDataWithInitialLoad', 'fof-forum-widgets-core.prefer_data_with_initial_load', 'boolval'),
];
