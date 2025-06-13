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
