import { useQuery } from '@tanstack/react-query';
import { boardKeys, fetchBoard, fetchBoards } from '@/api/boards';
import type { Board } from '@/types';

export function useBoards() {
    return useQuery({
        queryKey: boardKeys.all,
        queryFn: fetchBoards,
    });
}

export function useBoard(boardId: number | null, initialBoard?: Board) {
    return useQuery({
        queryKey: boardId ? boardKeys.detail(boardId) : boardKeys.all,
        queryFn: () => fetchBoard(boardId as number),
        enabled: boardId !== null,
        initialData: initialBoard,
    });
}

export function findBoardInCache(boards: Board[] | undefined, boardId: number): Board | undefined {
    return boards?.find((board) => board.id === boardId);
}
