// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
fn read_local_file(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        // 2. Daftarkan fungsi ke invoke_handler
        .invoke_handler(tauri::generate_handler![read_local_file]) 
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
