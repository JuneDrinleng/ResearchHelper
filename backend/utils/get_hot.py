import requests
import pandas as pd
import time
def hot_search_loop(url, interval=30):
    while True:
        try:
            res = requests.get(url)
            data = res.json()['data']['realtime']
            df = pd.DataFrame(data)['word']
            df = df.to_string(index=False).splitlines()
            result = []
            for i in range(8):
                dict_now={
                    "rank": i + 1,
                    "title": df[i].strip(),
                }
                result.append(dict_now)
            return result
        except Exception as e:
            pass
        time.sleep(interval)
if __name__ == "__main__":
    url="https://weibo.com/ajax/side/hotSearch"
    hot_search_loop(url, interval=30)