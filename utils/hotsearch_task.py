import time, requests
import pandas as pd
from utils.log_utils import record_hotsearch,log,get_log_path
import os
def hot_search_loop(url, interval=60):
    paste = get_log_path(log_name="hot_history.log")
    if os.path.exists(paste):
        os.remove(paste)
    hot_search_list=[]
    while True:
        try:
            res = requests.get(url)
            data = res.json()['data']['realtime']
            df = pd.DataFrame(data)['word']
            top = df.to_string(index=False).splitlines()[0].split()[-1]
            if top not in hot_search_list:
                hot_search_list.append(top)
                record_hotsearch(top)
            else:
                pass
        except Exception as e:
            log(f"Error: {e}")
        time.sleep(interval)
