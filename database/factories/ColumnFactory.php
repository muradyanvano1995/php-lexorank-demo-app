<?php

namespace Database\Factories;

use App\Models\Board;
use App\Models\Column;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Column>
 */
class ColumnFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'board_id' => Board::factory(),
            'name' => fake()->randomElement(['Backlog', 'In Progress', 'Review', 'Done']),
            'position' => fake()->numberBetween(0, 10_000),
        ];
    }
}
