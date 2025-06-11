import requests
import pandas as pd
import time
def hot_search_loop(url, interval=30):
    while True:
        try:
            res = requests.get(url)
            data = res.json()['data']['realtime']
            return data
        except Exception as e:
            pass
        time.sleep(interval)
if __name__ == "__main__":
    url="https://weibo.com/ajax/side/hotSearch"
    hot_search_loop(url, interval=30)