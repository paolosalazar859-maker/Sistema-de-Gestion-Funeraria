use tauri::Runtime;

#[tauri::command]
fn get_machine_id() -> String {
    // Obtenemos el ID único de la máquina (HWID)
    machine_id::get().unwrap_or_else(|_| "unknown-hwid".to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_machine_id])
        .setup(|_app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
