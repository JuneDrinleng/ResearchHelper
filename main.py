from flask import Flask, render_template
from flask import jsonify
from utils.get_hot import hot_search_loop
app = Flask(__name__)

@app.route('/')
@app.route('/settings')
def settings():
    return render_template("settings.html")

@app.route('/hotsearch')
def hotsearch():
    return render_template('hotsearch.html')

@app.route("/api/hotsearch")
def hotsearch_api():
    # 示例静态数据，替换为你的动态数据
    hot_items = hot_search_loop("https://weibo.com/ajax/side/hotSearch", interval=30)
    return jsonify(hot_items)

@app.route('/index.html')
def index():
    return render_template("index.html")


if __name__ == '__main__':
    app.run(port=8080)
