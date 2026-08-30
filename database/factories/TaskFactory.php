<?php

namespace Database\Factories;

use App\Enums\TaskPriority;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;
use MuradyanVano\LexoRank\LexoRank;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    private static int $rankSequence = 0;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        self::$rankSequence++;

        $rank = LexoRank::initial();

        for ($i = 0; $i < self::$rankSequence; $i++) {
            $rank = $rank->after();
        }

        return [
            'column_id' => Column::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'priority' => fake()->randomElement(TaskPriority::cases())->value,
            'assignee_name' => fake()->optional()->name(),
            'due_date' => fake()->optional()->date(),
            'rank' => $rank->toString(),
        ];
    }
}
