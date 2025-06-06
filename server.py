from flask import Flask, render_template
from log_utils import get_log_path
from get_resource import resource_path

app = Flask(__name__, template_folder=resource_path("templates"))
hotsearch_enabled = True
@app.route('/hotsearch')
def hotSearch():
    try:
        with open(get_log_path(log_name="hot_history.log"), 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        content = "日志文件读取失败"
    return render_template("hotsearch.html", log=content)


@app.route('/settings')
def settings():
    return render_template("settings.html")


def run_server():
    app.run(host='localhost', port=8080)

from flask import jsonify

@app.route('/log')
def log_content():
    try:
        with open(get_log_path(log_name="hot_history.log"), 'r', encoding='utf-8') as f:
            lines = f.readlines()
            lines = [line.strip() for line in lines if line.strip()]
            latest = lines[-1] if lines else "暂无记录"
            history = lines[-24:] if len(lines) > 1 else []
    except Exception as e:
        return jsonify({"latest": "读取失败", "history": []})
    
    return jsonify({
        "latest": latest,
        "history": history[::-1]  # 倒序显示最新在上
    })
