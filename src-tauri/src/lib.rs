use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct ExportProcess(Mutex<Option<CommandChild>>);

#[tauri::command]
async fn start_export(
    app: AppHandle,
    width: u32,
    height: u32,
    fps: u32,
    total_frames: u32,
    audio_path: String,
    output_path: String,
) -> Result<(), String> {
    let shell = app.shell();
    let cmd = shell.sidecar("ffmpeg").map_err(|e| e.to_string())?.args([
        "-y",
        "-f",
        "rawvideo",
        "-vcodec",
        "rawvideo",
        "-s",
        &format!("{}x{}", width, height),
        "-pix_fmt",
        "rgba",
        "-r",
        &fps.to_string(),
        "-i",
        "-",
        "-i",
        &audio_path,
        "-vframes",
        &total_frames.to_string(),
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        &output_path,
    ]);

    let (_rx, child) = cmd.spawn().map_err(|e| e.to_string())?;
    *app.state::<ExportProcess>().0.lock().unwrap() = Some(child);
    Ok(())
}

#[tauri::command]
async fn push_frame(app: AppHandle, frame: Vec<u8>) -> Result<(), String> {
    let export_process = app.state::<ExportProcess>();
    let mut state = export_process.0.lock().unwrap();
    if let Some(child) = state.as_mut() {
        child.write(&frame).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn finish_export(app: AppHandle) -> Result<(), String> {
    let export_process = app.state::<ExportProcess>();
    let mut state = export_process.0.lock().unwrap();
    let _ = state.take();
    Ok(())
}

#[tauri::command]
async fn cancel_export(app: AppHandle) -> Result<(), String> {
    let export_process = app.state::<ExportProcess>();
    let mut state = export_process.0.lock().unwrap();
    if let Some(child) = state.take() {
        let _ = child.kill(); 
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(ExportProcess(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            read_local_file,
            start_export,
            push_frame,
            finish_export,
            cancel_export
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn read_local_file(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(path).map_err(|e| e.to_string())
}
