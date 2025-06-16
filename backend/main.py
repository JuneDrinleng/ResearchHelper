# Research Helper - A desktop assistant for researchers.
# Copyright (C) 2025 June Drinleng
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.


from flask import Flask, render_template
from flask import jsonify
from utils.get_hot import hot_search_loop
from utils.get_google_tranlate import Google_translator
from utils.get_electricity import get_electricty
from datetime import datetime
import pandas as pd
app = Flask(__name__)
from flask import request
import os

RH_ACCOUNT  = os.getenv("RH_ACCOUNT")   # 如果变量缺失将得到 None
RH_PASSWORD = os.getenv("RH_PASSWORD")

if not RH_ACCOUNT or not RH_PASSWORD:
    print("后端启动时未收到账号或密码，请检查 Electron 端的 keytar 保存 / env 传递。")
POWER_CSV = os.getenv("POWER_CSV")
if not POWER_CSV:                                    # ← ① 给默认路径
    POWER_CSV = os.path.join(os.getcwd(), "power.csv")

# 若文件不存在则创建空模板
if not os.path.exists(POWER_CSV):
    print(f"[info] {POWER_CSV} 不存在，自动创建空白模板")
    pd.DataFrame(columns=["time", "power"]).to_csv(POWER_CSV, index=False)

power_df = pd.read_csv(POWER_CSV)
print(f"[info] 载入 POWER_CSV，共 {len(power_df)} 条记录")

@app.route('/')

@app.route("/api/hotsearch")
def hotsearch_api():
    hot_items = hot_search_loop("https://weibo.com/ajax/side/hotSearch", interval=30)
    return jsonify(hot_items)

@app.route('/index.html')
def index():
    return render_template("index.html")

@app.route("/api/translate", methods=["POST"])
def translate():
    data = request.get_json()
    text = data.get("text", "")
    to_lang = data.get("to", "en")
    from_lang = data.get("from", "auto")
    print(data, text, to_lang, from_lang)

    try:
        result = Google_translator(text, to_lang, from_lang)
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------- 路由 ----------
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
def fetch_power_job():
    """
    每 30 min 执行一次：
        • 有账号密码 → 调 get_electricty() 抓最新读数，成功即追加进 CSV
        • 缺账号密码 → 记录日志，不写 CSV
        • 抓取异常   → 日志警告，不写 CSV
    """
    if not RH_ACCOUNT or not RH_PASSWORD:
        app.logger.warning("[fetch_power_job] 无账号密码，跳过")
        return

    try:
        reading = get_electricty(RH_ACCOUNT, RH_PASSWORD)
        # 转成 DataFrame 并写 CSV
        try:
            df_old = pd.read_csv(POWER_CSV)
        except FileNotFoundError:
            df_old = pd.DataFrame(columns=["time", "power"])
        df_all = pd.concat([df_old, pd.DataFrame([reading])], ignore_index=True)
        df_all.to_csv(POWER_CSV, index=False)
        app.logger.info("[fetch_power_job] 已写入最新电量")
    except Exception as e:
        app.logger.warning(f"[fetch_power_job] 抓取失败：{e}")

@app.route("/api/power")
def power_api():
    """
    • 如果没有账号密码 AND CSV 空 ⇒ 返回单条全 0 JSON
    • 否则 ⇒ 读 CSV（或空 DataFrame），≤100 行返全表，>100 行返尾 100 行
    """
    try:
        df = pd.read_csv(POWER_CSV)
    except FileNotFoundError:
        df = pd.DataFrame(columns=["time", "power"])

    # 没账号密码且 CSV 也空 → 返回全 0
    if df.empty and (not RH_ACCOUNT or not RH_PASSWORD):
        df = pd.DataFrame([{
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "power": 0
        }])

    df_resp = df if len(df) <= 100 else df.tail(100)
    return jsonify(df_resp.to_dict(orient="records"))


if __name__ == '__main__':

    # main.py（放在 create_app/app = Flask(...) 之后）
    scheduler = BackgroundScheduler(timezone="Asia/Shanghai")   # Helsinki +5 ⇒ 上海 +8；两地时间差 3h 不影响周期
    scheduler.add_job(
        fetch_power_job,
        "interval",
        minutes=30,
        next_run_time=datetime.now()   # 立即跑一次，避免首 30 min 空窗
    )
    scheduler.start()

    # 优雅关闭
    atexit.register(lambda: scheduler.shutdown(wait=False))
    app.run(port=8080)
