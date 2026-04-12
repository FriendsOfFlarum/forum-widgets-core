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

use Closure;
use Illuminate\Contracts\Cache\Repository;
use Psr\Log\LoggerInterface;

use function FoF\ForumWidgets\Helper\fof_cache_is_writable;

class SafeCacheRepositoryAdapter
{
    public function __construct(protected Repository $cache, protected LoggerInterface $logger)
    {
    }

    public function remember($key, $ttl, Closure $callback)
    {
        if (!fof_cache_is_writable()) {
            $this->logger->warning('Cannot use file cache because storage/cache is not writable, this will affect the software.');

            return null;
        }

        return $this->cache->remember($key, $ttl, $callback);
    }
}
