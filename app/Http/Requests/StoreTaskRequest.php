<?php

namespace App\Http\Requests;

use App\Enums\TaskPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:160'],
            'description' => ['nullable', 'string', 'max:5000'],
            'priority' => ['sometimes', 'string', Rule::enum(TaskPriority::class)],
            'assignee_name' => ['nullable', 'string', 'max:120'],
            'due_date' => ['nullable', 'date'],
            'before_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'after_id' => ['nullable', 'integer', 'exists:tasks,id', 'different:before_id'],
        ];
    }
}
