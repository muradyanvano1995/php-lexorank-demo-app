<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('column_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->string('priority', 20)->default('medium');
            $table->string('assignee_name')->nullable();
            $table->date('due_date')->nullable();
            $table->string('rank', 255);
            $table->timestamps();

            $table->unique(['column_id', 'rank']);
            $table->index(['column_id', 'rank']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
