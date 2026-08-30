<?php

namespace Database\Seeders;

use App\Enums\TaskPriority;
use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Database\Seeder;
use MuradyanVano\LexoRank\LexoRankService;

class BoardSeeder extends Seeder
{
    public function __construct(private LexoRankService $lexoRank) {}

    public function run(): void
    {
        $board = Board::query()->create([
            'name' => 'Product Delivery',
            'description' => 'Deterministic demo board for muradyanvano/php-lexorank .',
        ]);

        $columnNames = ['Backlog', 'In Progress', 'Review', 'Done'];
        $columns = [];

        foreach ($columnNames as $index => $name) {
            $columns[] = Column::query()->create([
                'board_id' => $board->id,
                'name' => $name,
                'position' => $index,
            ]);
        }

        $catalog = [
            ['Refine onboarding checklist', 'Backlog', TaskPriority::Medium, 'Ava Chen', 7],
            ['Audit LexoRank collision retries', 'Backlog', TaskPriority::High, 'Noah Patel', 3],
            ['Document move neighbor semantics', 'Backlog', TaskPriority::Low, null, 14],
            ['Design diagnostics histogram', 'Backlog', TaskPriority::Medium, 'Mia Brooks', 10],
            ['Spike keyboard DnD paths', 'Backlog', TaskPriority::Low, 'Leo Park', null],
            ['Seed playground fixtures', 'Backlog', TaskPriority::Medium, 'Ava Chen', 5],
            ['Tighten Form Request rules', 'In Progress', TaskPriority::High, 'Noah Patel', 2],
            ['Wire use-form server errors', 'In Progress', TaskPriority::Urgent, 'Mia Brooks', 1],
            ['Optimistic board cache patches', 'In Progress', TaskPriority::High, 'Leo Park', 4],
            ['Column empty-state polish', 'In Progress', TaskPriority::Medium, null, 8],
            ['Copy-rank tooltip a11y', 'In Progress', TaskPriority::Low, 'Ava Chen', 6],
            ['Review rebalance mapping UI', 'Review', TaskPriority::High, 'Noah Patel', 3],
            ['Validate unique rank index', 'Review', TaskPriority::Urgent, 'Mia Brooks', 2],
            ['Check SQLite/MySQL parity notes', 'Review', TaskPriority::Medium, 'Leo Park', 9],
            ['Approve dark-theme tokens', 'Review', TaskPriority::Low, null, 11],
            ['Ship health endpoint', 'Done', TaskPriority::Medium, 'Ava Chen', -2],
            ['Publish package version badge', 'Done', TaskPriority::Low, 'Noah Patel', -5],
            ['Land initialRanks seeder', 'Done', TaskPriority::High, 'Mia Brooks', -1],
            ['Confirm Pest factory ranks', 'Done', TaskPriority::Medium, 'Leo Park', -3],
            ['Stabilize Vite SPA shell', 'Done', TaskPriority::Medium, null, -4],
            ['Add reduced-motion styles', 'Done', TaskPriority::Low, 'Ava Chen', -7],
            ['Verify no Inertia dependency', 'Done', TaskPriority::High, 'Noah Patel', -6],
            ['Cross-column move regression', 'Backlog', TaskPriority::Urgent, 'Mia Brooks', 12],
            ['Playground generate form', 'In Progress', TaskPriority::Medium, 'Leo Park', 7],
            ['Diagnostics soft-length control', 'Review', TaskPriority::Low, 'Ava Chen', 15],
        ];

        $byColumn = [];

        foreach ($catalog as $item) {
            [$title, $columnName, $priority, $assignee, $dueOffset] = $item;
            $byColumn[$columnName][] = [
                'title' => $title,
                'priority' => $priority,
                'assignee_name' => $assignee,
                'due_date' => $dueOffset === null ? null : now()->addDays($dueOffset)->toDateString(),
                'description' => "Demo task: {$title}",
            ];
        }

        $columnByName = collect($columns)->keyBy('name');

        foreach ($byColumn as $columnName => $tasks) {
            /** @var Column $column */
            $column = $columnByName[$columnName];
            $ranks = $this->lexoRank->initialRanks(count($tasks));

            foreach ($tasks as $index => $task) {
                Task::query()->create([
                    'column_id' => $column->id,
                    'title' => $task['title'],
                    'description' => $task['description'],
                    'priority' => $task['priority']->value,
                    'assignee_name' => $task['assignee_name'],
                    'due_date' => $task['due_date'],
                    'rank' => $ranks[$index]->toString(),
                ]);
            }
        }
    }
}
