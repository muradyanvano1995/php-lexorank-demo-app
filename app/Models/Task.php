<?php

namespace App\Models;

use App\Enums\TaskPriority;
use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use MuradyanVano\LexoRank\Laravel\Casts\LexoRankCast;
use MuradyanVano\LexoRank\Laravel\Concerns\HasLexoRank;

class Task extends Model
{
    /** @use HasFactory<TaskFactory> */
    use HasFactory;

    use HasLexoRank;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'column_id',
        'title',
        'description',
        'priority',
        'assignee_name',
        'due_date',
        'rank',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'priority' => TaskPriority::class,
            'due_date' => 'date',
            'rank' => LexoRankCast::class,
        ];
    }

    /**
     * @return BelongsTo<Column, $this>
     */
    public function column(): BelongsTo
    {
        return $this->belongsTo(Column::class);
    }
}
