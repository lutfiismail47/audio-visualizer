import React from "react";
import { Button } from "../../ui/Button";
import { useOverlayStore } from "../../../store/overlayStore";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
export const OverlayPanel: React.FC = () => {
  const {
    overlays,
    activeOverlayId,
    addOverlay,
    removeOverlay,
    setActiveOverlayId,
    updateActiveLayer,
  } = useOverlayStore();
  const activeOverlay = overlays.find((o) => o.id === activeOverlayId);
  const handleLoadFile = async () => {
    if (!activeOverlayId) return;
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Media",
            extensions: ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm"],
          },
        ],
      });
      if (typeof selected === "string") {
        const uint8Array = await readFile(selected);
        const ext = selected.split(".").pop()?.toLowerCase();
        let mimeType = "image/jpeg";
        let type: "image" | "video" = "image";
        if (ext === "png") mimeType = "image/png";
        else if (ext === "webp") mimeType = "image/webp";
        else if (ext === "gif") mimeType = "image/gif";
        else if (ext === "mp4") {
          mimeType = "video/mp4";
          type = "video";
        } else if (ext === "webm") {
          mimeType = "video/webm";
          type = "video";
        }
        const blob = new Blob([uint8Array], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        updateActiveLayer({ src: blobUrl, type });
      }
    } catch (err) {
      console.error("Gagal load overlay:", err);
    }
  };
  const layersOpt = ["Depan Viz", "Belakang Viz"];
  const animsOpt = [
    "Tanpa anim",
    "Pan",
    "Denyut",
    "Blitz",
    "Flash",
    "Float",
    "Shake",
    "Zoom",
    "Putar searah jarum jam",
    "Putar kebalikan arah jarum jam",
  ];
  return (
    <div className="p-4 flex flex-col gap-6 text-sm">
      <section className="bg-panel p-4 rounded-xl border border-gray-800">
        <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">
          OVERLAY
        </h3>
        <div className="flex justify-between mb-4">
          <div className="flex flex-wrap gap-2 flex-1 mr-2">
            <Button onClick={addOverlay}>+Overlay</Button>
            {overlays.map((o, i) => (
              <Button
                key={o.id}
                active={activeOverlayId === o.id}
                onClick={() => setActiveOverlayId(o.id)}
              >
                {o.src ? `O${i + 1}` : "Kosong"}
              </Button>
            ))}
          </div>
          <Button
            disabled={!activeOverlayId}
            onClick={() => activeOverlayId && removeOverlay(activeOverlayId)}
            className="text-red-400 hover:text-red-300 border-red-900"
          >
            Hapus
          </Button>
        </div>
        <div
          className={
            !activeOverlay
              ? "opacity-30 pointer-events-none flex flex-col gap-4"
              : "flex flex-col gap-4"
          }
        >
          <div className="flex items-center gap-4">
            <Button onClick={handleLoadFile} className="flex-1">
              Pilih File(Gambar/Video)
            </Button>
            <span className="text-xs text-gray-400 truncate w-24">
              {activeOverlay?.src ? "Terisi" : "Belum ada"}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-2">LAPISAN</span>
            <div className="flex flex-wrap gap-2">
              {layersOpt.map((l) => (
                <Button
                  key={l}
                  active={activeOverlay?.layer === l}
                  onClick={() => updateActiveLayer({ layer: l as any })}
                >
                  {l}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-xs text-gray-400">Ukuran</span>
            <input
              type="range"
              min="10"
              max="200"
              value={activeOverlay?.size || 100}
              onChange={(e) =>
                updateActiveLayer({ size: Number(e.target.value) })
              }
              className="flex-1 accent-accent cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-xs text-gray-400">Opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={activeOverlay?.opacity ?? 50}
              onChange={(e) =>
                updateActiveLayer({ opacity: Number(e.target.value) })
              }
              className="flex-1 accent-accent cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-xs text-gray-400">Speed</span>
            <input
              type="range"
              min="1"
              max="100"
              value={activeOverlay?.speed || 50}
              onChange={(e) =>
                updateActiveLayer({ speed: Number(e.target.value) })
              }
              className="flex-1 accent-accent cursor-pointer"
            />
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-2">ANIMASI</span>
            <div className="flex flex-wrap gap-2">
              {animsOpt.map((a) => (
                <Button
                  key={a}
                  active={activeOverlay?.animation === a}
                  onClick={() => updateActiveLayer({ animation: a })}
                >
                  {a}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
