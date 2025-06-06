import os
import sys

def resource_path(relative_path):
    """获取资源路径，支持 PyInstaller 打包后访问"""
    if hasattr(sys, '_MEIPASS'):
        # PyInstaller 打包后
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)
