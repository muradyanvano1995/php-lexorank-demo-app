<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MoveTaskRequest extends FormRequest
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
            'column_id' => ['required', 'integer', 'exists:columns,id'],
            'before_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'after_id' => ['nullable', 'integer', 'exists:tasks,id', 'different:before_id'],
        ];
    }
}
