<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlaygroundBetweenRequest extends FormRequest
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
            'lower' => ['nullable', 'string', 'max:255'],
            'upper' => ['nullable', 'string', 'max:255'],
        ];
    }
}
