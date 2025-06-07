import requests
import html
from urllib import parse
import re
def Google_translator(text, to_language, text_language):
    GOOGLE_TRANSLATE_URL = 'http://translate.google.com/m?q=%s&tl=%s&sl=%s'
    text = parse.quote(text)
    url = GOOGLE_TRANSLATE_URL % (text,to_language,text_language)
    response = requests.get(url)
    data = response.text
    expr = r'(?s)class="(?:t0|result-container)">(.*?)<'
    result = re.findall(expr, data)
    if (len(result) == 0):
        return ""

    return html.unescape(result[0])

if __name__ == "__main__":
    text = "Hello, world!"
    to_language = "zh-CN"
    text_language = "en"
    translated_text = Google_translator(text, to_language, text_language)
    print(translated_text)  # 输出翻译结果