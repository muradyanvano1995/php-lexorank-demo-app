export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type Task = {
    id: number;
    column_id: number;
    title: string;
    description: string | null;
    priority: TaskPriority;
    assignee_name: string | null;
    due_date: string | null;
    rank: string | null;
    rank_length: number | null;
    bucket: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type Column = {
    id: number;
    board_id: number;
    name: string;
    position: number;
    tasks: Task[];
    created_at: string | null;
    updated_at: string | null;
};

export type Board = {
    id: number;
    name: string;
    description: string | null;
    columns: Column[];
    created_at: string | null;
    updated_at: string | null;
};

export type LaravelValidationErrors = Record<string, string[]>;

export type LaravelErrorResponse = {
    message: string;
    errors?: LaravelValidationErrors;
};

export type MoveTaskPayload = {
    column_id: number;
    before_id?: number;
    after_id?: number;
};

export type CreateTaskPayload = {
    title: string;
    description?: string | null;
    priority?: TaskPriority;
    assignee_name?: string | null;
    due_date?: string | null;
    before_id?: number;
    after_id?: number;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export type CreateColumnPayload = {
    name: string;
};

export type UpdateColumnPayload = {
    name: string;
};

export type LexoRankHealth = {
    package: string;
    version: string;
    max_rank_length: number;
    middle: string;
    initial: string;
    min: string;
    max: string;
    buckets: string[];
};

export type LexoRankParseResult = {
    rank: string;
    bucket: string;
    length: number;
    is_min: boolean;
    is_max: boolean;
};

export type LexoRankBetweenResult = LexoRankParseResult & {
    lower: string | null;
    upper: string | null;
};

export type LexoRankGenerateResult = {
    count: number;
    bucket: string;
    ranks: Array<{ rank: string; bucket: string; length: number }>;
};

export type ColumnDiagnostics = {
    column_id: number;
    column_name: string;
    task_count: number;
    min_rank_length: number | null;
    max_rank_length: number | null;
    avg_rank_length: number | null;
    buckets: Record<string, number>;
    duplicates: string[];
    should_rebalance: boolean;
    soft_length: number;
    package_max_rank_length: number;
    sample_ranks: Array<{
        id: number;
        title: string;
        rank: string;
        length: number;
        bucket: string;
    }>;
};

export type RebalanceResult = {
    column_id: number;
    task_count: number;
    bucket: string;
    mapping: Record<string, string>;
    max_rank_length_before: number;
    max_rank_length_after: number;
    tasks: Task[];
};

export type TaskFormValues = {
    title: string;
    description: string;
    priority: TaskPriority;
    assigneeName: string;
    dueDate: string;
};

export type BoardFiltersState = {
    search: string;
    priorities: TaskPriority[];
};
