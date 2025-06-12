from flask import Flask, render_template
from flask import jsonify
from utils.get_hot import hot_search_loop
import signal
import sys
from utils.get_google_tranlate import Google_translator
app = Flask(__name__)
from flask import request

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



if __name__ == '__main__':
    app.run(port=8080)
