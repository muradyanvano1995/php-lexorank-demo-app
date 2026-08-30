<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlaygroundParseRequest extends FormRequest
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
            'rank' => ['required', 'string', 'max:255'],
        ];
    }
}
