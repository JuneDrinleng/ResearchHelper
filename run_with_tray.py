import threading, subprocess, os, time, webbrowser
from pystray import Icon, Menu, MenuItem
from PIL import Image, ImageDraw, ImageFont
from hotsearch_task import hot_search_loop
from server import run_server
from get_resource import resource_path
import ctypes
def create_emoji_icon(emoji_char="📟"):
    img = Image.new('RGBA', (64, 64), (255,255,255,0))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("seguiemj.ttf", 48)
    except:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), emoji_char, font=font)
    w, h = bbox[2]-bbox[0], bbox[3]-bbox[1]
    draw.text(((64-w)/2, (64-h)/2), emoji_char, font=font, fill="black")
    return img

def open_browser(icon, item):
    webbrowser.open("http://localhost:8080")

def on_quit(icon, item):
    icon.stop()
    os._exit(0)

if __name__ == '__main__':
    try:
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except:
        try:
            ctypes.windll.user32.SetProcessDPIAware()
        except:
            pass
    threading.Thread(target=run_server, daemon=True).start()
    threading.Thread(target=hot_search_loop, args=("https://weibo.com/ajax/side/hotSearch",), daemon=True).start()

    menu = Menu(
        MenuItem("打开浏览器", open_browser),
        MenuItem("退出", on_quit)
    )
    icon_path = resource_path("favicon.ico")
    if not os.path.exists(icon_path):
        # Create a default icon if it doesn't exist
        create_emoji_icon("📟").save(icon_path, "ICO")
    tray_icon = Image.open(icon_path)
    Icon("KeepAlive", icon=tray_icon, menu=menu).run()
