## how to run

### Backend

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

### Frontend

1. install Node.js dependencies:
   ```bash
    npm install
   ```
2. run the frontend app:
   ```bash
    npm start
   ```

## how to package

### Packaging Python Projects

```
cd backend
pyinstaller --onefile --noconsole --name ResearchHelperService --icon=../favicon.ico main.py
```

### package electron app

管理员打开 cmd 运行

```
electron-builder --win
```
