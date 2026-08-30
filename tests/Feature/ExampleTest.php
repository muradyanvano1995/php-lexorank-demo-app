<?php

it('serves the spa shell', function () {
    $this->get('/')->assertOk()->assertSee('id="root"', false);
});
