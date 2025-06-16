<p align="center">
  <img src="./favicon.ico" alt="Research Helper Logo" width="120" />
</p>

<h1 align="center">Research Helper 🧑‍🎓</h1>

<p align="center">
  <a href="#quick-start">🚀 Quick Start</a> •
  <a href="#appearance--features">🎨 Appearance & Features</a> •
  <a href="#local-compilation">🛠️ Local Compilation</a> •
  <a href="#packaging">📦 Packaging</a> •
  <a href="./README.md"><strong>🀄中文</strong></a>
</p>

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Appearance & Features](#appearance--features)
3. [Local Compilation](#Local-Compilation)
4. [Packaging](#packaging)
5. [中文 (Chinese Version)](#中文版)

---
## License

This project is licensed under the GNU General Public License v3.0.  
See the [LICENSE](./LICENSE) file for details.

## Quick Start

Download the latest installer from the [Releases page](https://github.com/JuneDrinleng/ResearchHelper/releases) and double‑click to install.

Once installed, **Research Helper** launches automatically and is ready to assist you. 🎉

---

## Appearance & Features

| Feature               | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| ⚡Power monitoring     | Monitor the electricity supply of Tsinghua University student apartment dormitory |
| 🌓 Light / Dark Mode   | Select the look that suits your eyes                         |
| 📕 Built‑in Translator | Highlight & translate any text instantly                     |
| 🔥 Weibo Hot Topics    | One‑click to explore trending hashtags                       |
| 📌 Pin Window          | Keep **Research Helper** always on top                       |

<p align="center"><img src="./readme.assets/1.png" width="45%" /> <img src="./readme.assets/2.png" width="45%" /></p>
<p align="center"><img src="./readme.assets/3.png" width="45%" /> <img src="./readme.assets/4.png" width="45%" /></p>

---

## Local Compilation

### Backend (🔧 Python / FastAPI)

```bash
# 1️⃣ Create and activate a virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2️⃣ Install dependencies
pip install -r requirements.txt

# 3️⃣ Run the backend service
python main.py
```

> **Tip:** If you cloned the repo on Windows you can also use the pre‑built `ResearchHelperService.exe` located in `backend/dist` — no Python setup required.

### Frontend (⚡ Electron)

```bash
# Install dependencies
npm install

# Start the app in dev mode
npm start
```

---

## Packaging

### Package the Python Backend

```bash
npm run pack:win
```
 The mac version is also compiled. In GitHub action, but it faces problems such as slow backend startup and no certificates.



---

<p align="center">✨ Happy Researching! ✨</p>
