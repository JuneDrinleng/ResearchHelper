# README

## 1 QUICKLY START

Download the setup application from the [release](https://github.com/JuneDrinleng/ResearchHelper/releases) and double click it to install the application. After installing, it will automatically show up

## 2 APPEARENCE AND FUNCTION

Your research helper! 🧑‍🎓

- [x] 😊 Help you to surfing the internet, translate unknown words and so on ! 

- [x] ✨ It has light mode and dark mode depending your choice!  

- [x] 📕 You can conveniently using translator!

- [x] 🔥 You can surfing all the hot point from weibo. If you want to know more, you can click specific word theme to look for details!

- [x] 📌 It is easy for you to pin the window of Research Helper in the front of the screen

![image-20250612212048348](./readme.assets/image-20250612212048348.png)

![image-20250612212106765](./readme.assets/image-20250612212106765.png)

![image-20250612212119743](./readme.assets/image-20250612212119743.png)

![image-20250612212132885](./readme.assets/image-20250612212132885.png)

## 3 TRY YOURSELF

### 3.1 How to run

#### 3.1.1 Backend

1. create virtual environment and install Python dependencies:
   ```bash
    cd backend
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
   ```
2. run the backend service:
   ```bash
    python main.py
   ```

if you directly git clone the repo in Windows, you can ignore it. Because the backend is packaged into `.exe` file in the `./backend/dist`

#### 3.1.2 Frontend

1. install Node.js dependencies:
   ```bash
    npm install
   ```
2. run the frontend app:
   ```bash
    npm start
   ```

### 3.2 How to package

####  3.2.1 Packaging Python Projects

```
cd backend
pyinstaller --onefile --noconsole --name ResearchHelperService --icon=../favicon.ico main.py
```

#### 3.2.2 package electron app in windows

```
electron-builder --win
```
