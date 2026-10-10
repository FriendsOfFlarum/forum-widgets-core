<?php

/*
 * This file is part of fof/forum-widgets-core.
 *
 * Copyright (c) 2026 Friends of Flarum.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace FoF\ForumWidgets\Tests\integration;

use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\Test;

class ForumConfigTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('fof-forum-widgets-core');
    }

    private function forumLayout(string $stored): mixed
    {
        $this->setting('fof-forum-widgets-core.config', $stored);

        $response = $this->send($this->request('GET', '/api'));

        $this->assertEquals(200, $response->getStatusCode());

        return json_decode($response->getBody()->getContents(), true)['data']['attributes']['fof-forum-widgets-core.config'];
    }

    #[Test]
    public function the_saved_layout_is_sent_to_the_forum(): void
    {
        $this->assertEquals(
            ['disabled' => ['acme-widgets:news']],
            $this->forumLayout('{"disabled":["acme-widgets:news"]}')
        );
    }

    #[Test]
    public function the_forum_still_loads_when_the_saved_layout_is_not_valid_json(): void
    {
        $this->assertEquals([], $this->forumLayout('{"instances": ['));
    }
}
