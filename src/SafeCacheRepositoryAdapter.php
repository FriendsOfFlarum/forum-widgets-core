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
use Monolog\Logger;
use Psr\Log\LoggerInterface;

use function FoF\ForumWidgets\Helper\fof_cache_is_writable;

class SafeCacheRepositoryAdapter
{
    /**
     * @var Repository
     */
    protected $cache;

    /**
     * @var LoggerInterface
     */
    protected $logger;

    public function __construct(Repository $cache, LoggerInterface $logger)
    {
        $this->cache = $cache;
        $this->logger = $logger;
    }

    public function remember($key, $ttl, Closure $callback)
    {
        if (!fof_cache_is_writable()) {
            $this->logger->log(Logger::WARNING, 'Cannot use file cache because storage/cache is not writable, this will affect the software.');

            return null;
        }

        return $this->cache->remember($key, $ttl, $callback);
    }
}
