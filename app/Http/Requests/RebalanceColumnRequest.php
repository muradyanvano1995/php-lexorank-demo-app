<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RebalanceColumnRequest extends FormRequest
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
            'confirm' => ['required', 'string', 'in:REBALANCE'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'confirm.in' => 'Type REBALANCE to confirm this operation.',
        ];
    }
}
