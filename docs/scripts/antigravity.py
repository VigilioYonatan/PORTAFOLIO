import pyautogui
import time
import subprocess
import os
import sys
import argparse
import numpy as np
from PIL import Image
import mss

# --- DIRECTORIO DEL SCRIPT ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(SCRIPT_DIR, 'assets')

# --- ARGUMENTOS CLI ---
parser = argparse.ArgumentParser(description='Script de automatización para generar código con IA')
parser.add_argument('--backend', action='store_true', help='Usar prompts de backend (NestJS)')
parser.add_argument('--frontend', action='store_true', help='Usar prompts de frontend (Preact)')
parser.add_argument('--rules-class',  action='store_true', help='Usar prompts de class')
parser.add_argument('--rules-business',  action='store_true', help='Usar prompts de business')
parser.add_argument('--rules-endpoints',  action='store_true', help='Usar prompts de endpoints')
parser.add_argument('--rules-page',  action='store_true', help='Usar prompts de page')
args = parser.parse_args()
from helpers.prompt_ai import PROMPT_AI

# --- CARGAR PROMPTS SEGÚN ARGUMENTO ---
PROMPT_BASE = ""
PROMPT_CONTEXT = ""
PROMPT_CONTEXT_VERIFIED = ""
PROMPT_AI = PROMPT_AI
if args.backend:
    print("🔧 Modo: BACKEND (NestJS)")
    from helpers.prompt_backend import PROMPT_BASE, PROMPT_CONTEXT, PROMPT_CONTEXT_VERIFIED
elif args.frontend:
    print("🎨 Modo: FRONTEND (Preact)")
    from helpers.prompt_frontend import PROMPT_BASE, PROMPT_CONTEXT, PROMPT_CONTEXT_VERIFIED
elif args.rules_class:
    print("📚 Modo: CLASS")
    from helpers.prompt_rules_class import PROMPT_BASE, PROMPT_CONTEXT, PROMPT_CONTEXT_VERIFIED
elif args.rules_business:
    print("📚 Modo: BUSINESS")
    from helpers.prompt_rules_business import PROMPT_BASE, PROMPT_CONTEXT, PROMPT_CONTEXT_VERIFIED
elif args.rules_endpoints:
    print("📚 Modo: ENDPOINTS")
    from helpers.prompt_rules_endpoints import PROMPT_BASE, PROMPT_CONTEXT, PROMPT_CONTEXT_VERIFIED
elif args.rules_page:
    print("📚 Modo: PAGE")
    from helpers.prompt_rules_page import PROMPT_BASE, PROMPT_CONTEXT, PROMPT_CONTEXT_VERIFIED
else:
    print("⚠️  No se especificó modo. Usa --backend, --frontend o --class")
    print("\nEjemplos:")
    print("  python index.py --backend")
    print("  python index.py --frontend")
    print("  python index.py --class")
    sys.exit(1)

print(f"\n📋 PROMPT_BASE: {PROMPT_BASE[:80]}...")
print(f"📄 PROMPT_CONTEXT length: {len(PROMPT_CONTEXT)} chars\n")

# Monkeypatch pyautogui to use mss for screenshots (fixes Linux dependency issues)
def locateOnScreen_mss(image, **kwargs):
    with mss.mss() as sct:
        # Get primary monitor
        monitor = sct.monitors[1]
        sct_img = sct.grab(monitor)
        # Convert to PIL Image
        screenshot = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
        # Use pyautogui logic on our screenshot
        return pyautogui.locate(image, screenshot, **kwargs)

# Reemplazamos la función original para que todas las llamadas usen mss
pyautogui.locateOnScreen = locateOnScreen_mss
clases_raw = [
    r"""## Concepto Visual (Senior Artistic-Futuristic)

- **Aesthetic:** Dark cyberpunk, neomorfismo sutil, animaciones de frecuencia (GLSL/Shaders).
- **Inspiration:** Neurofunk/DnB vibes (ritmos complejos, líneas agresivas pero limpias).
- **Core Feature:** `FloatingMusicPlayer` persistente en Sidebar/Aside con visualizador de espectro tipo **Monstercat**.
- **Reactive UI:** Todo el diseño de la landing page (bordes, luces de fondo, sombras) reaccionará dinámicamente al nivel de sonido y bajos de la música activa.
- **Tech identity:** Enfoque en Seniority (Architecture, Performance, Scalability).
""",
    r"""## Layouts

> **Translation Requirement**: All public pages must support 3 languages (English, Spanish, Portuguese). Dashboard pages are single-language (admin preference).

### #layout-public

**Header:**

- **Components:** `TerminalLogo` (Link Home con efecto glitch), `NavLinks` (Home, Projects, Blog, Experience, Contact), `ThemeSwitcher` (Dark/AMOLED focus).
- **Behavior:** Glassmorphism, animaciones de entrada tipo "matrix-loading" sutil.

**Aside (Left/Right):**

- **MusicPlayer:** Reproductor flotante persistente. Lista de tracks, sistema de **Favoritos** (reacción LIKE integrada), control de volumen, visualizador de audio **reactivo tipo Monstercat**.

**Footer:**

- **Components:** `StatusBadge` (Syncing with GitHub/CI-CD status), `SocialIcons`.
- **FloatingChat:** Botón flotante (Bottom-Right) que abre `ChatAIWindow`.

### #layout-dashboard

**Header (Navbar):**

- **Left:** `SidebarTrigger`, `ProjectBreadcrumbs`.
- **Right:** `SystemStatus` (CPU/Memory load mock), `NotificationBell`, `UserAdminDropdown`.

**Aside (Sidebar):**

- **Menu:** `MainSection` (Dashboard, Documents, AI Training), `ContentSection` (Projects, Blog, Experience, Music, Technologies, Testimonials), `SystemSection` (Settings).
""",
    r"""## Auth Management (/login, /forgot-password) (rules-business.md #3) (Imagenes: design/auth-login.png, design/auth-forgot-password.png)

**Layout:** Null (Minimalist Full Screen).

| Status | Tarea/Feature          | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                                                     | Testing           | Testeado |
| :----: | :--------------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------- | :------: |
|  [ ]   | Admin Login.           |                        [ ] 3.1                        |      public      | **LoginForm**: Input email, Input password (con toggle visibility), Submit button con efecto neón/glitch, Link recovery.                                                        | [ ] unit, [ ] e2e |   [ ]    |
|  [ ]   | Password Recovery.     |                        [ ] 3.3                        |      public      | **RecoveryForm**: Input email, Submit button, Success/Error specialized modals.                                                                                                 | [ ] unit          |   [ ]    |
|  [ ]   | Sections / Components. |                        [ ] 5.1                        |      public      | **WaveTimeline**: Vertical timeline with scroll-triggered animations. **NeuroPlayer**: Fixed bottom player with visualizer. **FloatingActionChat**: FAB with simulated AI chat. | [ ] unit          |   [ ]    |
""",
    r"""## Landing / Senior Identity (/) (Role:public) (rules-business.md #1, #4, #5, #6, #7, #10, #12, #22) (Imagenes: design/web-home.png, design/web-home-starting.png, design/web-aside.png, design/web-chat.png)

**Layout:** Inherits from #layout-public.

| Status | Tarea/Feature                                         | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                                 | Testing            | Testeado |
| :----: | :---------------------------------------------------- | :---------------------------------------------------: | :--------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------- | :------: |
|  [ ]   | Hero Section: Senior Pitch & Sound-Reactive Identity. |                   [ ] 1.1, [ ] 6.1                    |      public      | **HeroTerminal**: Efecto glitch reactivo al beat. **TechOrbit**: Partículas que orbitan con la frecuencia de la música.                                     | [ ] unit, [ ] seo  |   [ ]    |
|  [ ]   | Interactive Career Timeline (DnB Wave style).         |                   [ ] 7.1, [ ] 22.2                   |      public      | **WaveTimeline**: Hitos representados como picos de frecuencia. El gradiente de la línea cambia con el volumen.                                             | [ ] unit, [ ] a11y |   [ ]    |
|  [ ]   | Full-Featured Music System (Favorites & Visualizer).  |                  [ ] 12.1, [ ] 20.1                   |      public      | **NeuroPlayer**: Reproductor avanzado con sistema de **Favoritos**. **MonstercatVisualizer**: Barras de frecuencia clásicas que reaccionan al audio actual. | [ ] units          |   [ ]    |
|  [ ]   | Floating Chat (Senior AI Assistant).                  |                  [ ] 16.1, [ ] 18.1                   |      public      | **FloatingActionChat**: Botón en esquina inferior derecha. Modal animado con IA context-aware.                                                              | [ ] unit           |   [ ]    |
""",
    r"""## Tech Stack & Skills (/skills) (Role:public) (rules-business.md #10, #11) (Imagenes: design/web-skills.png)

**Layout:** Inherits from #layout-public.

| Status | Tarea/Feature               | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                         | Testing            | Testeado |
| :----: | :-------------------------- | :---------------------------------------------------: | :--------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------- | :------: |
|  [ ]   | Grid de Tecnologías Senior. |                       [ ] 10.1                        |      public      | **SkillBentoGrid**: Categorías (Frontend: React/Next, Backend: Node/Nest/Go, DevOps: Docker/K8s/CI-CD, Mobile: React Native, AI: Ollama/Langchain). | [ ] unit, [ ] perf |   [ ]    |
""",
    r"""## Legal Pages (/privacy, /terms) (Role:public) (rules-business.md #1) (Imagenes: N/A)

**Layout:** Inherits from #layout-public.

| Status | Tarea/Feature    | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                    | Testing  | Testeado |
| :----: | :--------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------- | :------- | :------: |
|  [ ]   | Privacy Policy   |                        [ ] 1.1                        |      public      | **LegalDoc**: Renderizado de políticas con tipografía legible. | [ ] unit |   [ ]    |
|  [ ]   | Terms of Service |                        [ ] 1.1                        |      public      | **LegalDoc**: Renderizado de términos con tipografía legible.  | [ ] unit |   [ ]    |
""",
    r"""## Blog & Project Details (/blog/:slug, /projects/:slug) (Role:public) (rules-business.md #6, #9, #19, #20) (Imagenes: design/web-blog-[slug].png)

**Layout:** Inherits from #layout-public.

| Status | Tarea/Feature                       | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                           | Testing           | Testeado |
| :----: | :---------------------------------- | :---------------------------------------------------: | :--------------: | :---------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [ ]   | Content Article with Neumorphic UI. |              [ ] 6.2, [ ] 9.2, [ ] 19.2               |      public      | **FuturisticMDX**: Renderer de Markdown con syntax highlighting tipo VSCode. **FloatingReactionBar**. | [ ] unit, [ ] seo |   [ ]    |
|  [ ]   | Community Interaction.              |                  [ ] 19.1, [ ] 20.1                   |      public      | **SocialHub**: Comentarios con hilos, reacciones animadas (Lottie).                                   | [ ] e2e           |   [ ]    |
""",
    r"""## Dashboard: Core Management (/dashboard) (Role:admin) (rules-business.md #1, #21, #23) (Imagenes: design/dashboard-layout.png, design/dashboard-header.png, design/dashboard-analitycs.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature         | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                  | Testing           | Testeado |
| :----: | :-------------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [ ]   | Admin Control Center. |    [ ] 2.1, [ ] 21.1, [ ] 21.2, [ ] 21.3, [ ] 23.1    |    role:ADMIN    | **AnalyticsGrid**: Gráficos de pulso (Recruiter trends) con RadarChart. **NotificationCenter**: Feed de acciones en tiempo real con polling. | [ ] unit, [ ] e2e |   [ ]    |
""",
    r"""## Admin: Content Manager (/dashboard/content) (Role:admin) (rules-business.md #6, #8, #9) (Imagenes: design/dashboard-content.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature                | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                                               | Testing           | Testeado |
| :----: | :--------------------------- | :---------------------------------------------------: | :--------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [ ]   | Gestión de Proyectos (CRUD). |               [ ] 6.3, [ ] 6.4, [ ] 6.5               |    role:ADMIN    | **ProjectTable**: Tabla con buscador, filtros por categoría y switch de visibilidad. **ProjectForm**: Modal con editor Markdown y dropzone para imágenes. | [ ] unit, [ ] e2e |   [ ]    |
|  [ ]   | Sincronización GitHub.       |                        [ ] 6.6                        |    role:ADMIN    | **SyncButton**: Botón con feedback de carga y websockets para updates en tiempo real de estrellas.                                                        | [ ] e2e           |   [ ]    |
|  [ ]   | Blog Engine (Posts & Cats).  |               [ ] 8.2, [ ] 9.3, [ ] 9.4               |    role:ADMIN    | **PostBentoGrid**: Vista previa de artículos. **CategoryManager**: Mini-CRUD de categorías en columna lateral.                                            | [ ] unit          |   [ ]    |
""",
    r"""## Admin: RAG Workspace (/dashboard/ai) (Role:admin) (rules-business.md #13, #15, #16, #23) (Imagenes: design/dashboard-ai.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature              | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                | Testing           | Testeado |
| :----: | :------------------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [ ]   | Document Training (RAG).   |                  [ ] 13.1, [ ] 13.3                   |    role:ADMIN    | **DocumentDropzone**: Subida de PDFs con barra de progreso circular. **IndexStatus**: Badge animado (PENDING -> READY).    | [ ] unit, [ ] e2e |   [ ]    |
|  [ ]   | UI AI Model Configuration. |                  [ ] 15.1, [ ] 15.2                   |    role:ADMIN    | **ModelConfigForm**: Sliders para Temp, ChunkSize, Overlap. Dropdown de modelos (GPT-4, Claude).                           | [ ] unit          |   [ ]    |
|  [ ]   | AI Insight Generator.      |                  [ ] 23.1, [ ] 23.2                   |    role:ADMIN    | **InsightsRadar**: Gráfico de araña con temas detectados por la IA en conversaciones.                                      | [ ] e2e           |   [ ]    |
|  [ ]   | Chat History & Sessions.   |                  [ ] 16.2, [ ] 18.2                   |    role:ADMIN    | **ConversationList**: Sidebar con lista de chats anónimos. **ChatViewer**: Visor de mensajes con visualización de fuentes. | [ ] unit, [ ] e2e |   [ ]    |
""",
    r"""## Admin: HR & Social Proof (/dashboard/hr) (Role:admin) (rules-business.md #5, #7, #22) (Imagenes: design/dashboard-hr.png, design/web-experience.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature                   | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                  | Testing           | Testeado |
| :----: | :------------------------------ | :---------------------------------------------------: | :--------------: | :--------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [ ]   | Testimonials Manager (CRUD).    |               [ ] 5.2, [ ] 5.3, [ ] 5.4               |    role:ADMIN    | **TestimonialTable**: Lista con avatar, autor y empresa. **TestimonialForm**: Modal con editor de contenido y upload avatar. | [ ] unit, [ ] e2e |   [ ]    |
|  [ ]   | Work Experience Manager (CRUD). |               [ ] 7.2, [ ] 7.3, [ ] 7.4               |    role:ADMIN    | **ExperienceTimeline**: Vista cronológica editable. **ExperienceForm**: Modal con fechas, descripción y toggle "is_current". | [ ] unit, [ ] e2e |   [ ]    |
|  [ ]   | Work Milestones Manager (CRUD). |             [ ] 22.1, [ ] 22.3, [ ] 22.4              |    role:ADMIN    | **MilestoneList**: Hitos agrupados por experiencia. **MilestoneForm**: Modal con icono picker y fecha.                       | [ ] unit          |   [ ]    |
""",
    r"""## Admin: Communication (/dashboard/inbox) (Role:admin) (rules-business.md #4) (Imagenes: design/dashboard-inbox.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature          | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                  | Testing           | Testeado |
| :----: | :--------------------- | :---------------------------------------------------: | :--------------: | :--------------------------------------------------------------------------------------------------------------------------- | :---------------- | :------: |
|  [ ]   | Contact Messages Inbox |                   [ ] 4.2, [ ] 4.3                    |    role:ADMIN    | **MessageList**: Inbox con indicador de no leídos. **MessageDetail**: Vista de mensaje con botón "Mark as Read" y respuesta. | [ ] unit, [ ] e2e |   [ ]    |
""",
    r"""## Admin: Media & Tech (/dashboard/shared) (Role:admin) (rules-business.md #10, #12) (Imagenes: design/dashboard-shared.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature             | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                                                   | Testing  | Testeado |
| :----: | :------------------------ | :---------------------------------------------------: | :--------------: | :---------------------------------------------------------------------------------------------------------------------------- | :------- | :------: |
|  [ ]   | Music Library Management. |             [ ] 12.2, [ ] 12.3, [ ] 12.4              |    role:ADMIN    | **AudioList**: Lista con drag-and-drop para reordenar pistas. **WaveEditor**: Visualización simple de forma de onda al subir. | [ ] unit |   [ ]    |
|  [ ]   | Tech Stack Catalog.       |             [ ] 10.2, [ ] 10.3, [ ] 10.4              |    role:ADMIN    | **TechIconGrid**: Selector de iconos con preview. Categorización por tipo (Frontend/Backend).                                 | [ ] unit |   [ ]    |
""",
    r"""## Admin: Settings (/dashboard/settings) (Role:admin) (rules-business.md #1, #2) (Imagenes: design/dashboard-settings.png)

**Layout:** Inherits from #layout-dashboard.

| Status | Tarea/Feature           | id o ids de enpoints de rules-endpoints que se usaron | Roles o Permisos | Componentes                                                                                       | Testing  | Testeado |
| :----: | :---------------------- | :---------------------------------------------------: | :--------------: | :------------------------------------------------------------------------------------------------ | :------- | :------: |
|  [ ]   | Interface & Appearance. |                        [ ] 1.2                        |    role:ADMIN    | **ThemeCustomizer**: Color pickers para primario/secundario. Preview en tiempo real del branding. | [ ] e2e  |   [ ]    |
|  [ ]   | Admin Profile.          |                        [ ] 2.2                        |    role:ADMIN    | **AdminCard**: Cambio de avatar, username y password con validación de fuerza.                    | [ ] unit |   [ ]    |
""",
    r"""## ✅ Verificación de Páginas (OBLIGATORIO)

### Landing & Identity

- [ ] rules-pages.md, [ ] encabezado, [ ] layout, [ ] endpoints, [ ] roles, [ ] componentes (Futuristic focus), [ ] testing checklist, [ ] fidelidad rules-business

### Admin Management

- [ ] rules-pages.md, [ ] encabezado, [ ] layout, [ ] endpoints, [ ] roles, [ ] componentes (Ultra detailed), [ ] testing checklist, [ ] fidelidad rules-business
""",
    r"""## ✅ Verificación FINAL (Senior Design 10/10)

- [ ] **Aesthetics**: Diseño futurista/artístico integrado con enfoque en música electrónica.
- [ ] **Tech Stack**: Incluye Figma, Socket.io, Mobile y DevOps en la visualización.
- [ ] **Music Player**: Reproductor flotante persistente documentado.
- [ ] **Floating Chat**: Botón de chat posicionado y funcional según requerimientos.
- [ ] **Identity**: El diseño proyecta una imagen de Senior Developer.
- [ ] **Admin Coverage**: Todas las entidades administrativas tienen su página de gestión documentada.
- [ ] **Fidelidad Total**: 100% alineado con `rules-class.md`, `rules-business.md` y `rules-endpoints.md`.
"""
]

comandos = []
CHUNK_SIZE = 1


for i in range(0, len(clases_raw), CHUNK_SIZE):
    chunk = clases_raw[i : i + CHUNK_SIZE]
    # Unimos las clases del grupo con saltos de línea
    bloque_combinado = "\n\n".join(chunk)
    comandos.append(bloque_combinado)

body_custom =""

# --- MODELOS PREFERIDOS (Sin símbolo de advertencia) ---
# El script buscará estas imágenes de modelos para hacer clic
MODELOS_PREFERIDOS = [
    'gemini_3_pro_high.png',    # Gemini 3 Pro High
    'gemini_3_flash.png',       # Gemini 3 Flash
    'claude_opus_4_5_thinking.png'  # Claude Opus 4.5 Thinking
]

# --- NUEVA LÓGICA DE BOTONES ---
BOTON_CAMBIO_MODELO = 'choose-model2.png'
ERROR_NO_TOKEN = 'no_token_ai.png'

# --- FUNCIONES AUXILIARES ---

def buscar_imagen_segura(imagen, confianza=0.7, region=None):
    """
    Busca una imagen usando OpenCV con un nivel de confianza.
    grayscale=True ayuda a que sea más rápido y robusto ante cambios leves de color.
    """
    try:
        # locateOnScreen soporta el parámetro region (left, top, width, height)
        imagen_path = os.path.join(ASSETS_DIR, imagen)
        res = None
        if region:
            res = pyautogui.locateOnScreen(imagen_path, confidence=confianza, region=region, grayscale=True)
        else:
            res = pyautogui.locateOnScreen(imagen_path, confidence=confianza, grayscale=True)

        if res:
             print(f"   [DETECCIÓN] Encontrada imagen: {imagen} (confianza: {confianza})")
        return res
    except pyautogui.ImageNotFoundException:
        return None
    except Exception as e:
        # Si falla por falta de librería, avisamos
        if "confidence" in str(e):
            print("\nError: Falta OpenCV. Ejecuta: pip install opencv-python")
            sys.exit()
        print(f"   [DEBUG] Error buscando {imagen}: {e}")
        return None

# --- VERIFICACIÓN INICIAL ---
print("--- DIAGNÓSTICO (MODO CON OPENCV 🧠 + AUTO SCROLL 📜) ---")
print(f"Total clases: {len(clases_raw)}")
print(f"Comandos generados (bloques de {CHUNK_SIZE}): {len(comandos)}")

# Verificación de imágenes
imagenes_necesarias = [
    'boton-acept-all.jpg',
    'ready.png',
    'implementation.jpg',
    'implementation2.jpg',
    'proceed.png',
    'advertencia.png',           # Imagen del símbolo de advertencia ⚠️
    'no_token_ai.png',          # Nueva imagen para detectar falta de tokens
    'choose-model2.png',        # Nueva imagen para menú de modelos
    'allow-this.png',           # Imagen para permitir acción
    'retry.png'                 # Imagen para reintentar
]

# Configuración global de PyAutoGUI
pyautogui.PAUSE = 0.5  # Pausa de medio segundo entre comandos

# Añadir las imágenes de modelos preferidos a la lista de verificación
for modelo_img in MODELOS_PREFERIDOS:
    imagenes_necesarias.append(modelo_img)

falta_imagen = False

for img in imagenes_necesarias:
    img_path = os.path.join(ASSETS_DIR, img)
    if not os.path.exists(img_path):
        print(f"ADVERTENCIA: No encuentro la imagen '{img}' en {ASSETS_DIR}")
        if img == 'ready.png':
            print("   -> ERROR CRÍTICO: Sin 'ready.png' el script no sabrá cuándo parar.")
            falta_imagen = True
        elif img == 'implementation.jpg':
             print("   -> (El script no escribirá 'listo' automáticamente sin esta imagen).")
        elif img == 'implementation2.jpg':
             print("   -> (El script no escribirá 'listo' automáticamente sin esta imagen).")
        elif img in MODELOS_PREFERIDOS:
            print(f"   -> (El modelo '{img}' no podrá ser seleccionado automáticamente).")

if falta_imagen:
    print("\nSOLUCIÓN: Asegúrate de tener las imágenes .jpg/.png en la carpeta.")
    sys.exit()

print("\n--- INICIANDO SCRIPT ---")
print("Posiciona el mouse sobre la caja de texto (asegúrate que el foco esté en el chat).")
print("Iniciamos en 5 segundos...")
time.sleep(5)

def run_automation_pass(comandos, prompt_base, prompt_context, desc_prefix):
    for i, comando in enumerate(comandos):
        texto_a_pegar = f"{prompt_base}\n\n\n{prompt_context}\n\n\n {desc_prefix} {comando}\n\n\n"

        print(f"[{i+1}/{len(comandos)}] {desc_prefix} bloque...")

        # 1. Copiar y Pegar (compatible con Windows y Linux)
        try:
            process = subprocess.Popen(['xclip', '-selection', 'clipboard'], stdin=subprocess.PIPE, close_fds=True)
            process.communicate(input=texto_a_pegar.encode('utf-8'))
            print("   [OK] Texto copiado al clipboard (xclip)")
            # import pyperclip
            # pyperclip.copy(texto_a_pegar)
            # print("   [OK] Texto copiado al clipboard (pyperclip)")
        except ImportError:
            print("   [ERROR] Falta librería pyperclip. Instálala con: pip install pyperclip")
            # Fallback a implementación manual simple si falla pyperclip?
            # Por ahora confiamos en pyperclip ya que el usuario demostró tenerla.
        except Exception as e:
            print(f"   [ERROR] No se pudo copiar al clipboard: {e}")

        pyautogui.hotkey('ctrl', 'v')
        time.sleep(1)
        pyautogui.press('enter')

        print("   >>> Vigilando pantalla y haciendo scroll...")

        ia_termino = False
        intentos = 0
        last_files0_check = 0
        last_task_check = 0
        last_refresh_check = 0

        while not ia_termino:
            # Periodic checks for special images
            current_time = time.time()

            # Check files0.png every 5 seconds
            if current_time - last_files0_check >= 5:
                pos_files0 = buscar_imagen_segura('files0.png', confianza=0.7)
                if pos_files0:
                    print("   [!] 'files0.png' detectado. Clickeando...")
                    pyautogui.click(pos_files0)
                last_files0_check = current_time

            # Check  ask.png every 7 seconds (Espacio intencional)
            if current_time - last_task_check >= 7:
                pos_task = buscar_imagen_segura('ask.png', confianza=0.7)
                if pos_task:
                    print("   [!] 'ask.png' detectado. Clickeando...")
                    pyautogui.click(pos_task)
                last_task_check = current_time

            # Check refresh click every 10 seconds (Coordinates: x=254, y=759)
            if current_time - last_refresh_check >= 10:
                print("   [TIME] 10s pasaron. Haciendo click en refresh (254, 759)...")
                pyautogui.click(x=254, y=759)
                last_refresh_check = current_time

            # Check retry.png - if it appears, click it immediately
            pos_retry = buscar_imagen_segura('retry.png', confianza=0.7)
            if pos_retry:
                print("   [!] 'retry.png' detectado. Clickeando...")
                pyautogui.click(pos_retry)
                time.sleep(2)

            # Ahora usamos confidence=0.8 por defecto (80% de coincidencia)

            # A) Botón molesto (Aceptar)
            pos_boton = buscar_imagen_segura('boton-acept-all.jpg', confianza=0.75)

            # B) Archivo implementation
            pos_implementacion = buscar_imagen_segura('implementation.jpg', confianza=0.7)
            # B) Archivo implementation 2
            pos_implementacion2 = buscar_imagen_segura('implementation2.jpg', confianza=0.7)

            proceed = buscar_imagen_segura('proceed.png', confianza=0.7)
            # C) Icono de Listo
            pos_ready = buscar_imagen_segura('ready.png', confianza=0.7)
            # D) Allow-this button
            pos_allow = buscar_imagen_segura('allow-this.png', confianza=0.7)



            if pos_boton:
                print("   [!] Botón 'Aceptar' detectado. Clickeando...")
                pyautogui.click(pos_boton)
                pyautogui.moveRel(0, 100) # Mover un poco más lejos
                time.sleep(2)

            if pos_implementacion:
                print("   [OJO] Archivo detectado. Escribiendo 'listo'...")
                pyautogui.write("listo")
                time.sleep(0.5)
                pyautogui.press('enter')
                print("   --- Pausa de 10s para procesar ---")
                time.sleep(10)
            elif pos_implementacion2:
                print("   [OJO] Archivo detectado2. Escribiendo 'listo'...")
                pyautogui.write("listo")
                time.sleep(0.5)
                pyautogui.press('enter')
                print("   --- Pausa de 10s para procesar ---")
                time.sleep(10)
            elif proceed:
                print("   [!] 'proceed.png' detectado. Clickeando...")
                pyautogui.click(proceed)
                time.sleep(2)
            elif pos_allow:
                print("   [!] 'allow-this.png' detectado. Clickeando...")
                pyautogui.click(pos_allow)
                time.sleep(2)



            elif pos_ready:
                print("   [OK] La IA terminó. Ejecutando secuencia post-tarea...")
                
                # Paso 1: Click en more.png
                time.sleep(1)
                pos_more = buscar_imagen_segura('more.png', confianza=0.7)
                if pos_more:
                    print("   [!] Clickeando 'more.png'...")
                    pyautogui.click(pos_more)
                    time.sleep(1.5)
                else:
                    print("   [?] No se encontró 'more.png'")
                
                # # Paso 2: Click en ask.png
                pos_ask = buscar_imagen_segura('ask.png', confianza=0.7)
                if pos_ask:
                    print("   [!] Clickeando 'ask.png'...")
                    pyautogui.click(pos_ask)
                    time.sleep(1)
                else:
                    print("   [?] No se encontró 'ask.png'")
                
                # Paso 3: Ctrl+V para pegar
                print("   [!] Ejecutando Ctrl+V...")
                pyautogui.hotkey('ctrl', 'v')
                time.sleep(1)
                
                print("   [OK] Secuencia post-tarea completada. Siguiente comando.")
                ia_termino = True

            # --- NUEVA LÓGICA: SÍMBOLO ERROR TOKEN ---
            pos_no_token = buscar_imagen_segura(ERROR_NO_TOKEN, confianza=0.7)
            if pos_no_token:
                print(f"   [!] Detectado '{ERROR_NO_TOKEN}'. Cambiando de modelo...")
                pyautogui.click(pos_no_token)
                time.sleep(1)

                # Paso 1: Click en choose-model2.png
                pos_choose = buscar_imagen_segura(BOTON_CAMBIO_MODELO, confianza=0.7)
                if pos_choose:
                    print(f"   [!] Clickeando '{BOTON_CAMBIO_MODELO}'...")
                    pyautogui.click(pos_choose)
                    time.sleep(2) # Esperar a que el menú abra

                    # Paso 2: Buscar alguno de los modelos preferidos
                    encontrado = False
                    for mod_img in MODELOS_PREFERIDOS:
                        pos_mod = buscar_imagen_segura(mod_img, confianza=0.7)
                        if pos_mod:
                            print(f"   [!] Modelo '{mod_img}' encontrado. Seleccionando...")
                            pyautogui.click(pos_mod)
                            encontrado = True
                            time.sleep(2)
                            break

                    if not encontrado:
                        print("   [?] No se encontró ninguno de los modelos preferidos en el menú.")
                else:
                    print(f"   [?] No se encontró el botón '{BOTON_CAMBIO_MODELO}' después de detectar error.")

            # F) Espera y Scroll
            else:
                # SCROLL AQUÍ: Bajamos para buscar si el botón apareció abajo
                # Bajamos un poco menos y esperamos para que el renderizado se estabilice
                pyautogui.scroll(-200)
                time.sleep(1.5)
                intentos += 1
                if intentos > 600: # 10 minutos
                    print("   [!] Timeout (La IA tardó demasiado).")
                    break
# --- EJECUCIÓN ---
try:
    BEFORE=r"""## Estructura de Carpetas

> **Regla de Organización:**
>
> - `components/`: Componentes UI atómicos y reutilizables en toda la app (Buttons, inputs, tables).
> - `modules/{nombre}/`: Dominio de negocio (lógica, stores, componentes específicos).
> - `pages/.../_components/`: Componentes visuales específicos de una página (Layouts, Landing sections).

```
components/
├── extras/               # UI genérica (Buttons, Modals, Badges)
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Loader.tsx
├── form/                 # Form Inputs & Wrappers
│   ├── form-array
│   ├── form-color
│   ├── form-area
│   ├── ...etc
├── tables/               # Data Tables (Admin)
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── ...etc

modules/
├── auth/                 # Login, Password Recovery
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── RecoveryForm.tsx
│   ├── stores/
│   │   └── auth.store.ts
│   ├── login.tsx
│   ├── forgot-password.tsx
│   └── reset-password.tsx
├── blog/                 # Article, Community
│   └── components/
│       ├── FuturisticMDX.tsx
│       ├── FloatingReactionBar.tsx
│       └── SocialHub.tsx
├── projects/             # Project Details
│   └── components/
│       └── ProjectDetails.tsx
├── skills/               # Tech Stack Grid
│   └── components/
│       └── SkillBentoGrid.tsx
├── user/                 # Profile logic
│   └── stores/
│       └── user.store.ts

pages/
├── [...locale]/          # Rutas internacionalizadas
│   ├── _components/
│   │   ├── HeroTerminal.tsx
│   │   ├── TechOrbit.tsx
│   │   ├── WaveTimeline.tsx
│   │   ├── FloatingActionChat.tsx
│   │   ├── NeuroPlayer.tsx
│   │   ├── MonstercatVisualizer.tsx
│   │   ├── legal/
│   │   │   └── LegalDoc.tsx
│   ├── layouts/
│   ├── auth/
│   │   ├── login.astro
│   │   └── forgot-password.astro
│   ├── home.astro
│   ├── skills.astro
│   ├── privacy.astro
│   ├── terms.astro
│   ├── blog/
│   │   └── [...slug].astro
│   ├── projects/
│   │   └── [...slug].astro
│   ├── 404.astro
│   └── 500.astro
├── dashboard/
    ├── _components/
    ├── pages/
    │   ├── Overview.tsx
    │   ├── Content.tsx
    │   ├── AI.tsx
    │   ├── HR.tsx
    │   ├── Inbox.tsx
    │   ├── Shared.tsx
    │   └── Settings.tsx
    ├── router.tsx    # Enrutador de las páginas del dashboard (WOUTER)
    └── [...all].astro
```
"""
    # print("\n--- PASO 1: GENERACIÓN ---")
   # run_automation_pass(comandos, PROMPT_BASE,PROMPT_CONTEXT + BEFORE, "Empezamos con ")
 
    # print("\n--- PASO 2: VERIFICACIÓN ---")
    # run_automation_pass(comandos,"",PROMPT_CONTEXT_VERIFIED, "Verificamos si esta al 100% fiel ")
   
    # run_automation_pass([""],"","", "cambia el idioma de la web principal home, contacto,projectos, login, register,etc, blog, etc. osea toda la pagina normales en los 3 idiomas, claro la pagina dashboard normal en español, ojo las paginas de dashboard que estan en wouter ese si en español, fijate en los formularios, cards, deben estar en español ARREGLALO, fijate tomate tu tiempo, mira los archivos, que no se te escape ninguno, sigue las practicas de rules-class.md, rules-pages.md,prompt-frontend.md")
    # run_automation_pass([""],"","", "sigue arreglando check astro check, si ya acabaste presion && pnpm test:e2e:db && y sigue arreglando  pnpm test , recuerda seguir con las practicas de prompt-frontend.md y prompt-backend.md , rules-pages.md")
    # run_automation_pass([""],"","", "que todos los componentes .tsx esten en minuscula,ejemplo name-component.tsx verifica, tomate tu tiempo y testea pnpm test")
   

    # run_automation_pass([""],"","", "EN los seeder blogs en los contenidos debe aver minimo 5000 caracateres, estan muy cortos, psdt debe  en los 3 idiomas pt,en,es y el titulo ya no es necesario, ejemplo # 02. Keyset Pagination (Cursor-based), ya no es necesario. psdt agrega mas practicas senior blog , claro sin que se repitan, agrega mas practicas buenas practicas senior, puede ser practicas para nest,base de datos, optimizacion, practicas de docker, practicas aws, practicas de langchain,etc,, todo lo quie esta en mis conocmientos de mi portfolio., agrega 5 mas. si pones ejemplo hazlo con ts,drizzleorm,expressjs ultima version, tomate tu tiempo, profundiza los archivos")
    # run_automation_pass([""],"","", "arregla las traducciones hay algunos que estan separados tomate tu tiempo, profundiza los archivos.")
    # run_automation_pass([""],"","", "arregla mira en todos los archivos si no hay hardcode de tipos tiene que heredar de los schema, fijate que no hay codigo que no esta usando dry tiene que estar en utils ya sabes prompt-frontend.md, que las apis este en sus archivos, que las apis esten bien tipado, fijate que no tengan as any, que este bien tipado.  tomate tu tiempo , revisa codigo por codigo")
    # run_automation_pass([""],"","", "arregla mira en todos los archivos si no hay hardcode de tipos tiene que heredar de los schema, fijate que no hay codigo que no esta usando dry tiene que estar en utils ya sabes prompt-frontend.md, que las apis este en sus archivos, que las apis esten bien tipado, fijate que no tengan as any, que este bien tipado. tomate tu tiempo , revisa codigo por codigo")
    # run_automation_pass([""],"","", "arregla mira en todos los archivos si no hay hardcode de tipos tiene que heredar de los schema, fijate que no hay codigo que no esta usando dry tiene que estar en utils ya sabes prompt-frontend.md, que las apis este en sus archivos, que las apis esten bien tipado, fijate que no tengan as any, que este bien tipado. tomate tu tiempo , revisa codigo por codigo")
    # run_automation_pass([""],"","", "arregla mira en todos los archivos si no hay hardcode de tipos tiene que heredar de los schema, fijate que no hay codigo que no esta usando dry tiene que estar en utils ya sabes prompt-frontend.md, que las apis este en sus archivos, que las apis esten bien tipado, fijate que no tengan as any, que este bien tipado. tomate tu tiempo , revisa codigo por codigo")

    # run_automation_pass([""],"","", "fijate donde haya codigo que se repita, recuerda dry, evita hardcode, codigo limpio, seguir las practicas de prompt-fronten.md y prompt-backend.md. tomate tu tiempo , revisa codigo por codigo")
    # run_automation_pass([""],"","", "fijate donde haya codigo que se repita, recuerda dry, evita hardcode, codigo limpio, seguir las practicas de prompt-fronten.md y prompt-backend.md. tomate tu tiempo , revisa codigo por codigo")
    # run_automation_pass([""],"","", "fijate donde haya codigo que se repita, recuerda dry, evita hardcode, codigo limpio, seguir las practicas de prompt-fronten.md y prompt-backend.md. tomate tu tiempo , revisa codigo por codigo")
    # run_automation_pass([""],"","", "fijate donde haya codigo que se repita, recuerda dry, evita hardcode, codigo limpio, seguir las practicas de prompt-fronten.md y prompt-backend.md. tomate tu tiempo , revisa codigo por codigo")
    # run_automation_pass([""],"","", "fijate donde haya codigo que se repita, recuerda dry, evita hardcode, codigo limpio, seguir las practicas de prompt-fronten.md y prompt-backend.md. tomate tu tiempo , revisa codigo por codigo")

    run_automation_pass([""],"","", "so te das cuenta en blog-post/seeders/content sigue agregando las imagenes que faltan como tambien agrega mas contenido en los .md en cada uno de esos con ejemplos practicos en ts, express, con drizzle,etc, minimo 3000 caracteres debe haber en blog-post/seeders/content/.md, tomate tu tiempo profundiza.")    
    run_automation_pass([""],"","", "so te das cuenta en blog-post/seeders/content sigue agregando las imagenes que faltan como tambien agrega mas contenido en los .md en cada uno de esos con ejemplos practicos en ts, express, con drizzle,etc, minimo 3000 caracteres debe haber en blog-post/seeders/content/.md, tomate tu tiempo profundiza.")    
    run_automation_pass([""],"","", "so te das cuenta en blog-post/seeders/content sigue agregando las imagenes que faltan como tambien agrega mas contenido en los .md en cada uno de esos con ejemplos practicos en ts, express, con drizzle,etc, minimo 3000 caracteres debe haber en blog-post/seeders/content/.md, tomate tu tiempo profundiza.")    
    run_automation_pass([""],"","", "so te das cuenta en blog-post/seeders/content sigue agregando las imagenes que faltan como tambien agrega mas contenido en los .md en cada uno de esos con ejemplos practicos en ts, express, con drizzle,etc, minimo 3000 caracteres debe haber en blog-post/seeders/content/.md, tomate tu tiempo profundiza.")    
    run_automation_pass([""],"","", "so te das cuenta en blog-post/seeders/content sigue agregando las imagenes que faltan como tambien agrega mas contenido en los .md en cada uno de esos con ejemplos practicos en ts, express, con drizzle,etc, minimo 3000 caracteres debe haber en blog-post/seeders/content/.md, tomate tu tiempo profundiza.")    
    run_automation_pass([""],"","", "so te das cuenta en blog-post/seeders/content sigue agregando las imagenes que faltan como tambien agrega mas contenido en los .md en cada uno de esos con ejemplos practicos en ts, express, con drizzle,etc, minimo 3000 caracteres debe haber en blog-post/seeders/content/.md, tomate tu tiempo profundiza.")    
    run_automation_pass([""],"","", "so te das cuenta en blog-post/seeders/content sigue agregando las imagenes que faltan como tambien agrega mas contenido en los .md en cada uno de esos con ejemplos practicos en ts, express, con drizzle,etc, minimo 3000 caracteres debe haber en blog-post/seeders/content/.md, tomate tu tiempo profundiza.")    
    run_automation_pass([""],"","", "so te das cuenta en blog-post/seeders/content sigue agregando las imagenes que faltan como tambien agrega mas contenido en los .md en cada uno de esos con ejemplos practicos en ts, express, con drizzle,etc, minimo 3000 caracteres debe haber en blog-post/seeders/content/.md, tomate tu tiempo profundiza.")    

    run_automation_pass([""],"","", "arregla las traducciones hay algunos que estan separados tomate tu tiempo, profundiza los archivos.")    
    run_automation_pass([""],"","", "arregla las traducciones hay algunos que estan separados tomate tu tiempo, profundiza los archivos.")
    run_automation_pass([""],"","", "sigue arreglando check astro check, si ya acabaste presion && pnpm test:e2e:db && y sigue arreglando  pnpm test , recuerda seguir con las practicas de prompt-frontend.md y prompt-backend.md , rules-pages.md")
    run_automation_pass([""],"","", "sigue arreglando check astro check, si ya acabaste presion && pnpm test:e2e:db && y sigue arreglando  pnpm test , recuerda seguir con las practicas de prompt-frontend.md y prompt-backend.md , rules-pages.md")
    run_automation_pass([""],"","", "sigue arreglando check astro check, si ya acabaste presion && pnpm test:e2e:db && y sigue arreglando  pnpm test , recuerda seguir con las practicas de prompt-frontend.md y prompt-backend.md , rules-pages.md")

except KeyboardInterrupt:
    print("\nScript detenido por el usuario.")
except Exception as e:
    print(f"\nERROR CRÍTICO: {e}")
