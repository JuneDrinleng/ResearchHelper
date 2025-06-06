import os, sys, time

def get_log_path(log_name="main.log"):
    return os.path.join(os.path.dirname(sys.executable if getattr(sys, 'frozen', False) else __file__), log_name)

def log(msg,log_name="main.log"):
    timestamp = time.strftime("[%Y-%m-%d %H:%M:%S]")
    with open(get_log_path(log_name=log_name), "a", encoding="utf-8") as f:
        f.write(f"{timestamp} {msg}\n")

def record_hotsearch(msg, log_name="hot_history.log", max_lines=24):
    path = get_log_path(log_name=log_name)
    
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    else:
        lines = []

    lines.append(f"{msg}\n")
    lines = lines[-max_lines:] 

    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)



