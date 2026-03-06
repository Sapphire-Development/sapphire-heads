import { getTextureUrl } from "./image";
import { getHeadBase64 } from "./base64";
import { getMinecraftGiveCommand } from "./minecraft-give";
import { SkinViewer, IdleAnimation } from "skinview3d";

export interface Head {
  name: string;
  category: string;
  tags: string[];
  texture: string;
}

export function setupBackdropClose(modal: HTMLDialogElement) {
  modal?.addEventListener("click", e => {
    const rect = modal.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      modal.close();
    }
  });
}

export function setupModalLogic(
  modal: HTMLDialogElement,
  closeBtn: HTMLElement | null,
  copyBtn: HTMLElement | null,
  downloadBtn: HTMLElement | null,
  copyGiveCommandBtn: HTMLElement | null,
  els: {
    canvas: HTMLCanvasElement;
    title: HTMLElement | null;
    category: HTMLElement | null;
    tags: HTMLElement | null;
    base64Input: HTMLInputElement;
    giveCommandInput: HTMLInputElement;
    versionSelect: HTMLSelectElement;
  }
) {
  let currentHead: Head | null = null;
  let viewer: SkinViewer | null = null;

  const updateGiveCommand = () => {
    if (els.giveCommandInput && els.versionSelect && currentHead) {
      const selectedVersion = els.versionSelect.value;

      if (!selectedVersion || selectedVersion === "") {
        console.warn("No version selected, cannot generate command");
        return;
      }

      try {
        const command = getMinecraftGiveCommand(
          selectedVersion,
          currentHead.name,
          getHeadBase64(currentHead.texture)
        );

        els.giveCommandInput.value = command;
      } catch (error) {
        console.error("Error generating command:", error);
        els.giveCommandInput.value = "";
      }
    } else {
      console.warn(
        "Cannot update command - missing required elements or head data"
      );
    }
  };

  els.giveCommandInput?.addEventListener("click", async () => {
    if (!els.giveCommandInput?.value) return;
    await navigator.clipboard.writeText(els.giveCommandInput.value);

    const copyIcon = copyGiveCommandBtn.querySelector(".copy-icon");
    const checkIcon = copyGiveCommandBtn.querySelector(".check-icon");

    if (copyIcon && checkIcon) {
      copyIcon.classList.add("hidden");
      checkIcon.classList.remove("hidden");

      setTimeout(() => {
        copyIcon.classList.remove("hidden");
        checkIcon.classList.add("hidden");
      }, 2000);
    }
  });

  copyGiveCommandBtn?.addEventListener("click", async () => {
    if (!els.giveCommandInput?.value) return;
    await navigator.clipboard.writeText(els.giveCommandInput.value);

    const copyIcon = copyGiveCommandBtn.querySelector(".copy-icon");
    const checkIcon = copyGiveCommandBtn.querySelector(".check-icon");

    if (copyIcon && checkIcon) {
      copyIcon.classList.add("hidden");
      checkIcon.classList.remove("hidden");

      setTimeout(() => {
        copyIcon.classList.remove("hidden");
        checkIcon.classList.add("hidden");
      }, 2000);
    }
  });

  closeBtn?.addEventListener("click", () => modal.close());

  setupBackdropClose(modal);

  if (els.versionSelect) {
    els.versionSelect.addEventListener("change", updateGiveCommand);
  }

  document.addEventListener("open-head-modal", (e: any) => {
    const head = e.detail;
    currentHead = head;

    if (els.title) els.title.textContent = "Loading...";
    if (els.category) els.category.textContent = "";
    if (els.tags) els.tags.innerHTML = "";
    if (els.canvas) {
      if (!viewer) {
        viewer = new SkinViewer({
          canvas: els.canvas,
          width: els.canvas.parentElement?.clientWidth || 300,
          height: els.canvas.parentElement?.clientHeight || 300,
          skin: getTextureUrl(head.texture)
        });

        viewer.controls.enableZoom = true;
        viewer.controls.enablePan = false;

        viewer.playerObject.skin.body.visible = false;
        viewer.playerObject.skin.rightArm.visible = false;
        viewer.playerObject.skin.leftArm.visible = false;
        viewer.playerObject.skin.rightLeg.visible = false;
        viewer.playerObject.skin.leftLeg.visible = false;
        viewer.playerObject.cape.visible = false;

        viewer.camera.position.set(-15, 20, 20);
        viewer.camera.lookAt(0, 10, 0);
        viewer.controls.target.set(0, 10, 0);

        viewer.animation = new IdleAnimation();
      } else {
        viewer.loadSkin(getTextureUrl(head.texture));

        viewer.camera.position.set(-15, 20, 20);
        viewer.camera.lookAt(0, 10, 0);
        viewer.controls.target.set(0, 10, 0);
        viewer.playerObject.rotation.y = 0;
      }
    }

    if (els.title) els.title.textContent = head.name;
    if (els.category) els.category.textContent = head.category;

    if (els.base64Input) els.base64Input.value = getHeadBase64(head.texture);

    if (els.tags) {
      els.tags.innerHTML = head.tags
        .map(
          (tag: string) =>
            `<div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">${tag}</div>`
        )
        .join("");
    }

    modal.showModal();

    requestAnimationFrame(() => {
      console.log("Updating give command after modal opened");
      updateGiveCommand();
    });
  });

  copyBtn?.addEventListener("click", async () => {
    if (!els.base64Input?.value) return;

    await navigator.clipboard.writeText(els.base64Input.value);

    const copyIcon = copyBtn.querySelector(".copy-icon");
    const checkIcon = copyBtn.querySelector(".check-icon");

    if (copyIcon && checkIcon) {
      copyIcon.classList.add("hidden");
      checkIcon.classList.remove("hidden");

      setTimeout(() => {
        copyIcon.classList.remove("hidden");
        checkIcon.classList.add("hidden");
      }, 2000);
    }
  });

  downloadBtn?.addEventListener("click", () => {
    if (!currentHead) return;
    const url = getTextureUrl(currentHead.texture);
    window.open(url, "_blank");
  });
}
