import argparse
import ctypes
import os
import platform
import subprocess
import sys
import time

import pyautogui

# Directorio de scripts y assets
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(SCRIPT_DIR, "assets")

# parser mínimo (tal como pediste)
parser = argparse.ArgumentParser(
    description="Script de automatización para generar código con IA"
)
parser.add_argument(
    "--backend", action="store_true", help="Usar prompts de backend (NestJS)"
)
parser.add_argument(
    "--frontend", action="store_true", help="Usar prompts de frontend (Preact)"
)
parser.add_argument(
    "--class", dest="class_prompt", action="store_true", help="Usar prompts de class"
)
parser.add_argument(
    "--dry-run",
    action="store_true",
    help="Simula copiar/pegar sin interactuar con el portapapeles o la UI",
)
args = parser.parse_args()
PROMPT_BASE = ""
PROMPT_CONTEXT = ""
PROMPT_CONTEXT_VERIFIED = ""

# Modo simple (no se ejecuta lógica adicional de prompts)
if args.backend:
    print("🔧 Modo: BACKEND (NestJS)")
    from helpers.prompt_backend import PROMPT_BASE, PROMPT_CONTEXT, PROMPT_CONTEXT_VERIFIED
elif args.frontend:
    print("🎨 Modo: FRONTEND (Preact)")
    from helpers.prompt_frontend import PROMPT_BASE, PROMPT_CONTEXT, PROMPT_CONTEXT_VERIFIED
elif args.class_prompt:
    print("📚 Modo: CLASS")
    from helpers.prompt_class import PROMPT_BASE, PROMPT_CONTEXT, PROMPT_CONTEXT_VERIFIED
else:
    print("⚠️  No se especificó modo. Usa --backend, --frontend o --class")
    print("\nEjemplos:")
    print("  python index.py --backend")
    print("  python index.py --frontend")
    print("  python index.py --class")
    sys.exit(1)


# helper: copiar al portapapeles con múltiples métodos
def copy_to_clipboard(texto):
    # Dry-run mode: simulate
    dry_run = getattr(args, "dry_run", False) or os.environ.get("ZED_DRY_RUN", "0") in (
        "1",
        "true",
        "yes",
    )
    if dry_run:
        print("   [DRY-RUN] Copiado al portapapeles (simulado).")
        return True
    
    copia_exitosa = False

    # Método 1: ctypes (Windows nativo) - Prioritario y corregido
    if platform.system() == "Windows":
        try:
            # Configurar tipos de retorno y argumentos para ctypes en 64-bit
            ctypes.windll.user32.OpenClipboard.argtypes = [ctypes.c_void_p]
            ctypes.windll.user32.OpenClipboard.restype = ctypes.c_int
            ctypes.windll.user32.EmptyClipboard.restype = ctypes.c_int
            ctypes.windll.kernel32.GlobalAlloc.argtypes = [ctypes.c_uint, ctypes.c_size_t]
            ctypes.windll.kernel32.GlobalAlloc.restype = ctypes.c_void_p
            ctypes.windll.kernel32.GlobalLock.argtypes = [ctypes.c_void_p]
            ctypes.windll.kernel32.GlobalLock.restype = ctypes.c_void_p
            ctypes.windll.kernel32.GlobalUnlock.argtypes = [ctypes.c_void_p]
            ctypes.windll.kernel32.GlobalUnlock.restype = ctypes.c_int
            ctypes.windll.kernel32.RtlMoveMemory.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t]
            ctypes.windll.kernel32.GlobalFree.argtypes = [ctypes.c_void_p]
            ctypes.windll.user32.SetClipboardData.argtypes = [ctypes.c_uint, ctypes.c_void_p]
            ctypes.windll.user32.SetClipboardData.restype = ctypes.c_void_p
            ctypes.windll.user32.CloseClipboard.restype = ctypes.c_int

            # 1. Open Clipboard
            if not ctypes.windll.user32.OpenClipboard(0):
                raise Exception("No se pudo abrir el clipboard")
            
            # 2. Empty Clipboard
            ctypes.windll.user32.EmptyClipboard()
            
            # 3. Prepare Data (UTF-16LE + Null Terminator)
            text_bytes = texto.encode("utf-16le") + b'\x00\x00'
            
            # 4. Allocate Global Memory
            GMEM_MOVEABLE = 0x0002
            hMem = ctypes.windll.kernel32.GlobalAlloc(GMEM_MOVEABLE, len(text_bytes))
            if not hMem:
                ctypes.windll.user32.CloseClipboard()
                raise Exception("GlobalAlloc falló")
            
            # 5. Lock Memory to get Pointer
            ptr = ctypes.windll.kernel32.GlobalLock(hMem)
            if not ptr:
                ctypes.windll.kernel32.GlobalFree(hMem)
                ctypes.windll.user32.CloseClipboard()
                raise Exception("GlobalLock falló")
            
            # 6. Copy Data
            ctypes.windll.kernel32.RtlMoveMemory(ptr, text_bytes, len(text_bytes))
            
            # 7. Unlock Memory
            ctypes.windll.kernel32.GlobalUnlock(hMem)
            
            # 8. Set Clipboard Data
            CF_UNICODETEXT = 13
            if not ctypes.windll.user32.SetClipboardData(CF_UNICODETEXT, hMem):
                # If SetClipboardData fails, we must free the memory
                ctypes.windll.kernel32.GlobalFree(hMem)
                ctypes.windll.user32.CloseClipboard()
                raise Exception("SetClipboardData falló")
                
            # 9. Close Clipboard (Success! System owns hMem now)
            ctypes.windll.user32.CloseClipboard()
            copia_exitosa = True
            print("   [OK] Copiado con ctypes")
            
        except Exception as e:
            print(f"   [ERROR] Método ctypes falló: {e}")
            # Asegurar cierre del clipboard si algo falla
            try:
                ctypes.windll.user32.CloseClipboard()
            except:
                pass

    # Método 2: PowerShell (Fallback)
    if not copia_exitosa:
        try:
            ps = subprocess.Popen(
                ["powershell", "-Command", "Set-Clipboard"], stdin=subprocess.PIPE
            )
            ps.communicate(input=texto.encode("utf-16le"))
            if ps.returncode == 0:
                copia_exitosa = True
                print("   [OK] Copiado con PowerShell")
            else:
                print(f"   [ERROR] PowerShell retornó código {ps.returncode}")
        except Exception as e:
            print(f"   [ERROR] Método PowerShell falló: {e}")

    # Método 3: pyperclip (si está disponible)
    if not copia_exitosa:
        try:
            import pyperclip
            pyperclip.copy(texto)
            copia_exitosa = True
            print("   [OK] Copiado con pyperclip")
        except ImportError:
            pass
        except Exception as e:
            print(f"   [ERROR] Método pyperclip falló: {e}")

    # Si todo falló, mostrar error y continuar
    if not copia_exitosa:
        print("   [ERROR CRÍTICO] No se pudo copiar al portapapeles")
        return False

    return True


def image_on_screen(rel_path):
    path = os.path.join(ASSETS_DIR, rel_path)
    if not os.path.exists(path):
        return False
    try:
        return pyautogui.locateOnScreen(path, confidence=0.7, grayscale=True)
    except Exception as e:
        # Habilitar si se sospecha de error en cv2 o similar
        # print(f"   [DEBUG] Error buscando imagen: {e}")
        return False


def final_ai_on_screen():
    return image_on_screen(os.path.join("zed", "final-ai.jpg"))


# Bloques completos (clases_raw pasa completo)
clases_raw = [
    # 1. Tenants
    "| 1.1 |  [ ]   |  `GET`   | `/tenants`     | `limit`, `offset`, `search?`                                                                 | Listar tenants paginados | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 1.2 |  [ ]   |  `GET`   | `/tenants/:id` | -                                                                                            | Obtener tenant por ID    | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 1.3 |  [ ]   |  `POST`  | `/tenants`     | body: `{name, email, plan, domain?, logo?, phone?, address?, is_active?, trial_ends_at?}`    | Crear nuevo tenant       | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 1.4 |  [ ]   |  `PUT`   | `/tenants/:id` | body: `{name?, email?, plan?, domain?, logo?, phone?, address?, is_active?, trial_ends_at?}` | Actualizar tenant        | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 1.5 |  [ ]   | `DELETE` | `/tenants/:id` | -                                                                                            | Eliminar tenant          | [ ] unit, [ ] e2e, [ ] coverage |",
    # 2. Tenant Settings
    "| 2.1 |  [ ]   | `GET`  | `/tenants/:tenant_id/settings` | -                                                                                      | Obtener configuración de tenant | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 2.2 |  [ ]   | `PUT`  | `/tenants/:tenant_id/settings` | body: `{is_verified?, color_primary?, color_secondary?, default_language?, timezone?}` | Actualizar configuración        | [ ] unit, [ ] e2e, [ ] coverage |",
    # 3. Categories
    "| 3.1 |  [ ]   |  `GET`   | `/tenants/:tenant_id/categories`     | `limit`, `offset`, `search?`, `parent_id?`                                                | Listar categorías paginadas | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 3.2 |  [ ]   | `GET`   | `/tenants/:tenant_id/categories/:id` | -                                                                                         | Obtener categoría por ID    | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 3.3 |  [ ]   |  `POST`  | `/tenants/:tenant_id/categories`     | body: `{name, description?, icon?, is_active?, sort_order?, parent_id?}`                  | Crear nueva categoría       | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 3.4 |  [ ]   |  `PUT`   | `/tenants/:tenant_id/categories/:id` | body: `{name?, description?, icon?, is_active?, sort_order?, parent_id?}`                 | Actualizar categoría        | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 3.5 |  [ ]   | `DELETE` | `/tenants/:tenant_id/categories/:id` | -                                                                                         | Eliminar categoría          | [ ] unit, [ ] e2e, [ ] coverage |",
    # 4. Products
    "| 4.1 |  [ ]   |  `GET`   | `/tenants/:tenant_id/products`           | `limit`, `offset`, `search?`, `category_id?`, `is_active?`, `is_featured?`                                                                        | Listar productos paginados | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 4.2 |  [ ]   |  `GET`   | `/tenants/:tenant_id/products/:id`       | -                                                                                                                                                 | Obtener producto por ID    | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 4.3 |  [ ]   |  `POST`  | `/tenants/:tenant_id/products`           | body: `{name, sku, price, category_id, description?, barcode?, compare_price?, cost?, stock?, min_stock?, images?, is_active?, is_featured?}`     | Crear nuevo producto       | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 4.4 |  [ ]   |  `PUT`   | `/tenants/:tenant_id/products/:id`       | body: `{name?, sku?, price?, category_id?, description?, barcode?, compare_price?, cost?, stock?, min_stock?, images?, is_active?, is_featured?}` | Actualizar producto        | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 4.5 |  [ ]   | `DELETE` | `/tenants/:tenant_id/products/:id`       | -                                                                                                                                                 | Eliminar producto          | [ ] unit, [ ] e2e, [ ] coverage |",
    "| 4.6 |  [ ]   | `PATCH`  | `/tenants/:tenant_id/products/:id/stock` | body: `{quantity, operation: 'ADD' | 'SUBTRACT' | 'SET'}`                                                                                         | Ajustar stock de producto  | [ ] unit, [ ] e2e, [ ] coverage |",
]
CHUNK_SIZE = 5
comandos = []
for i in range(0, len(clases_raw), CHUNK_SIZE):
    bloque = "\n\n".join(clases_raw[i : i + CHUNK_SIZE])
    comandos.append(bloque)

print("--- DIAGNÓSTICO MÍNIMO (CTRL+V + final-ai.jpg loop) ---")
print(f"Bloques generados: {len(comandos)}")
print(
    "Iniciando en 5 segundos... Asegúrate de haber copiado el contenido deseado en el portapapeles."
)
time.sleep(5)


# Helper para ejecutar el bucle de pegado y espera
def execute_prompt_loop(comandos, prompt_base, prompt_context, desc_prefix):
    for i, comando in enumerate(comandos):
        texto_a_pegar = (
            f"{prompt_base}\n\n\n{prompt_context}\n\n\n {desc_prefix} {comando}\n\n\n"
        )
        print(f"[{i + 1}/{len(comandos)}] {desc_prefix} bloque...")

        copia_exitosa = copy_to_clipboard(texto_a_pegar)

        if not copia_exitosa:
            print("   [ERROR CRÍTICO] No se pudo copiar al portapapeles")
            continue

        # Pega y presiona enter
        pyautogui.hotkey("ctrl", "v")
        time.sleep(0.2)
        pyautogui.press("enter")

        print("   Esperando final-ai.jpg para continuar...")
        # Bucle de espera con scroll cada 10 segundos hasta que aparezca final-ai.jpg
        last_scroll_time = time.time()
        start_wait_time = time.time()
        MAX_WAIT_TIME = 180 # 3 minutos máximo de espera

        while True:
            # Check timeout
            if time.time() - start_wait_time > MAX_WAIT_TIME:
                 print("   [WARN] Tiempo de espera agotado (no se detectó final-ai.jpg). Continuando con el siguiente bloque...")
                 break

            # Hacer scroll cada 10 segundos
            current_time = time.time()
            if current_time - last_scroll_time >= 10:
                pyautogui.scroll(-200)
                last_scroll_time = current_time
                print("   [SCROLL] Haciendo scroll cada 10 segundos...")

            # Verificar si final-ai.jpg está visible
            if final_ai_on_screen():
                print(
                    "   [!] final-ai.jpg detectado. Continuando con el siguiente bloque."
                )
                break

            time.sleep(0.5)

# Registro de bloques a procesar
try:
    print("\n--- PASO 1: GENERACIÓN ---")
    execute_prompt_loop(comandos, PROMPT_BASE, PROMPT_CONTEXT, "Empezamos con")

    print("\n--- PASO 2: VERIFICACIÓN ---")
    execute_prompt_loop(comandos, PROMPT_CONTEXT_VERIFIED, PROMPT_CONTEXT, "Verificamos")

    print("\n¡Listo! Todos los bloques procesados.")
except KeyboardInterrupt:
    print("\nScript detenido por el usuario.")
except Exception as e:
    print(f"\nERROR: {e}")
