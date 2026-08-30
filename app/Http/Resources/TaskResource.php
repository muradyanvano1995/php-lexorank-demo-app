<?php

namespace App\Http\Resources;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use MuradyanVano\LexoRank\LexoRank;

/**
 * @mixin Task
 */
class TaskResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var LexoRank|null $rank */
        $rank = $this->getLexoRank();

        return [
            'id' => $this->id,
            'column_id' => $this->column_id,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority->value,
            'assignee_name' => $this->assignee_name,
            'due_date' => $this->due_date?->toDateString(),
            'rank' => $rank?->toString(),
            'rank_length' => $rank?->length(),
            'bucket' => $rank?->bucket()->toString(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
