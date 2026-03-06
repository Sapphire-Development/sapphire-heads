import type { Head } from "../types";

export function renderHeadCard(
    template: HTMLTemplateElement,
    head: Head,
    index: number
): DocumentFragment {
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const card = clone.querySelector(".head-card") as HTMLElement;
    const img = clone.querySelector("img") as HTMLImageElement;
    const title = clone.querySelector("h3") as HTMLElement;
    const badge = clone.querySelector("div.inline-flex") as HTMLElement;

    if (card) {
        card.style.opacity = "0";
        card.style.animation = `fadeInUp 0.3s ease-out forwards ${index * 0.03}s`;
    }

    if (img) {
        img.src = `https://nmsr.nickac.dev/headiso/${head.texture}`;
        img.alt = head.name;
    }
    if (title) {
        title.textContent = head.name;
        title.title = head.name;
    }
    if (badge) {
        badge.textContent = head.category;
    }

    const tagsContainer = clone.querySelector(".flex-wrap");
    if (tagsContainer && head.tags) {
        tagsContainer.innerHTML = head.tags
            .slice(0, 3)
            .map(
                (tag) =>
                    `<span class="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground bg-muted/50 border-input/50">${tag}</span>`,
            )
            .join("");

        if (head.tags.length > 3) {
            tagsContainer.innerHTML += `<span class="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground bg-muted/50 border-input/50">+${head.tags.length - 3}</span>`;
        }
    }

    if (card) {
        card.addEventListener("click", () => {
            document.dispatchEvent(
                new CustomEvent("open-head-modal", { detail: head }),
            );
        });
    }

    return clone;
}
