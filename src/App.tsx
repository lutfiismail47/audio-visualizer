import { useEffect } from "react";
import { Navbar } from "./components/navbar/Navbar";
import { LeftPanel } from "./components/panels/LeftPanel";
import { PreviewArea } from "./components/preview/PreviewArea";
import { useExportStore } from "./store/exportStore";
import { cancelExportVideo } from "./engine/export/exportEngine";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const {
    isExporting,
    isComplete,
    errorText,
    progress,
    statusText,
    resetExportState,
  } = useExportStore();

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let isMounted = true;
    let isAsking = false;

    const setupCloseHandler = async () => {
      const appWindow = getCurrentWindow();
      const fn = await appWindow.onCloseRequested(async (event) => {
        event.preventDefault();

        if (isAsking) return;
        isAsking = true;

        const shouldClose = await ask(
          "Apakah Anda yakin ingin keluar dari aplikasi? Perubahan yang belum disimpan mungkin akan hilang.",
          {
            title: "Konfirmasi Keluar",
            kind: "warning",
            okLabel: "Keluar",
            cancelLabel: "Batal",
          },
        );

        isAsking = false;

        if (shouldClose) {
          await invoke("exit_app");
        }
      });

      if (isMounted) {
        unlisten = fn;
      } else {
        fn();
      }
    };

    setupCloseHandler();

    return () => {
      isMounted = false;
      if (unlisten) unlisten();
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background relative">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <PreviewArea />
      </div>

      {isExporting && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md bg-panel border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl">
            {errorText ? (
              <>
                <div className="w-12 h-12 rounded-full bg-red-900/40 text-red-400 flex items-center justify-center text-2xl mb-3 border border-red-800">
                  ✕
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">
                  Ekspor Gagal
                </h2>
                <p className="text-red-400 text-sm mb-6">{errorText}</p>
                <button
                  onClick={resetExportState}
                  className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
                >
                  Tutup
                </button>
              </>
            ) : isComplete ? (
              <>
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center text-2xl mb-3 border border-accent/40">
                  ✓
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">
                  Ekspor Selesai!
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Video berhasil dirender dan disimpan.
                </p>
                <button
                  onClick={resetExportState}
                  className="px-6 py-2 bg-accent text-black rounded-lg hover:opacity-90 transition-opacity text-sm font-bold"
                >
                  Selesai
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2 text-white">
                  Mengekspor Video
                </h2>
                <p className="text-gray-400 text-sm mb-6">{statusText}</p>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-accent font-bold">{progress}%</span>
                <button
                  onClick={cancelExportVideo}
                  className="mt-6 px-6 py-1.5 bg-red-900/30 text-red-400 border border-red-900 rounded-lg hover:bg-red-900/50 text-sm"
                >
                  Batal
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
