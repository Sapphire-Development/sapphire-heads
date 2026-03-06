import type { Head } from "../types";

export interface PaginationState {
    currentPage: number;
    pageSize: number;
    filteredHeads: Head[];
}

export function updatePaginationUI(
    state: PaginationState,
    els: {
        pagCurrent: Element | null | undefined;
        pagTotal: Element | null | undefined;
        btnFirst: HTMLButtonElement | null | undefined;
        btnPrev: HTMLButtonElement | null | undefined;
        btnNext: HTMLButtonElement | null | undefined;
        btnLast: HTMLButtonElement | null | undefined;
    }
) {
    const totalPages = Math.ceil(state.filteredHeads.length / state.pageSize);

    if (els.pagCurrent) els.pagCurrent.textContent = state.currentPage.toString();
    if (els.pagTotal) els.pagTotal.textContent = totalPages.toString();

    if (els.btnFirst) els.btnFirst.disabled = state.currentPage === 1;
    if (els.btnPrev) els.btnPrev.disabled = state.currentPage === 1;
    if (els.btnNext) els.btnNext.disabled = state.currentPage === totalPages;
    if (els.btnLast) els.btnLast.disabled = state.currentPage === totalPages;
}
