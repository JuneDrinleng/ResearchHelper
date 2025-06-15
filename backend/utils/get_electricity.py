import requests
import bs4
import urllib3
import pickle
from datetime import datetime
def get_electricty(name,password):
    cookie_file = '.thb_cookie'
    # login with https
    login_page = 'https://m.myhome.tsinghua.edu.cn/weixin/weixin_user_authenticate.aspx'
    session = requests.session()
    session.verify = False  # ignore certificate error
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    try:  # to load cookie
        with open(cookie_file, 'rb') as f:
            session.cookies.update(pickle.load(f))
    except Exception:
        pass

    session.get('https://m.myhome.tsinghua.edu.cn/weixin/index.aspx')
    res = session.get(login_page)
    res.encoding = 'gbk'
    soup = bs4.BeautifulSoup(res.text, features='html.parser')
    inputs = soup.find_all('input', recursive=True)

    keys = [
        '__VIEWSTATE',
        '__VIEWSTATEGENERATOR',
        '__EVENTVALIDATION',
        'weixin_user_authenticateCtrl1$txtUserName',
        'weixin_user_authenticateCtrl1$txtPassword',
        'weixin_user_authenticateCtrl1$btnLogin'
    ]

    data = dict()

    for key in keys:
        data[key] = None

    for x in inputs:
        if x['name'] in set(keys):
            try:
                if data[x['name']] is None:
                    data[x['name']] = x['value']
            except KeyError:
                pass

    data['weixin_user_authenticateCtrl1$btnLogin'] = '%B5%C7%C2%BC'
    data['weixin_user_authenticateCtrl1$txtUserName'] = name
    data['weixin_user_authenticateCtrl1$txtPassword'] = password

    for k in data.keys():
        if data[k] is None:
            data[k] = ''
        data[k] = data[k].encode('gbk')

    if 'weixin_user_authenticateCtrl1$txtUserName' not in [
        x['name'] for x in inputs
    ]:
        pass  # already logged in!
    else:
        res = session.post(login_page, data=data)

    try:  # to save cookie
        with open(cookie_file, 'wb') as f:
            pickle.dump(session.cookies, f)
    except Exception:
        pass



    res = session.get('http://m.myhome.tsinghua.edu.cn/weixin/weixin_student_electricity_search.aspx')
    res.encoding = 'gbk'
    soup = bs4.BeautifulSoup(res.text, 'html.parser')
    reading = soup.find('span', {'id': 'weixin_student_electricity_searchCtrl1_lblele'}).text
    return str(reading)

