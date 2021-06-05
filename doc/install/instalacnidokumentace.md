# Instalační dokumentace

Dokument obsahuje:

1. Zjednodušenou instalaci: Pro ukázku, demo. Instaluje se pouze server. Pro jednoduchost jsem projekt odevzdal s již vybuilděným klientem (složka dist v client složce). To znamená, není potřeba instalovat závislosti klienta a buildit ho.
2. Plnou instalaci: Pro vývoj. 

**Poznámka**: Předpokládá se nainstalovaný docker a docker-compose.

**Poznámka**: V případě problémů s oprávněním pouštět příkazy se sudo.

**Poznámka**: Spustit příkazy v pořadí od shora dolů.

# Zapnutí docker kontejneru a přechod do bash (společné pro všechny instalace)

V projektové složce, kde se nachází `docker-compose.yml`.
```bash
docker-compose up -d
docker-compose exec node bash
```

**Poznámka**: Všechny další příkazy v tomto dokumentu jsou spouštěny v bashi kontejneru, kterou jsme právě otevřeli.

# 1. Zjednodušená instalace

## 1.1 Instalace závislostí

```bash
cd /workspace/server && npm install
```

## 1.2 Build serveru

Build server: typescript na javascript (vytvoření složky dist)
```bash
cd /workspace/server && npm run build
```

## 1.3 Spuštění serveru
```bash
cd /workspace/server && npm run start

# server dostupný na http://localhost:8086
```

---

<div class="page"/>

# 2. Plná instalace

- A. Produkční
- B. Vývojová

## 2.A. Produkční instalace

### 2.A.1 Instalace závislostí

Instalace závislostí 
```bash
cd /workspace/server && npm install
cd /workspace/client && npm install
```

### 2.A.2 Build

Build server: typescript na javascript (vytvoření složky dist)
```bash
cd /workspace/server && npm run build
```
Build client: svelte a typescript na javascript, css, ... (vytvoření složky dist)
``` bash
cd /workspace/client && npm run build
```

### 2.A.3 Spuštění serveru

```bash
cd /workspace/server && npm run start

# server dostupný na http://localhost:8086
```

---

<div class="page"/>


## 2.B. Vývojová instalace (Automatický build při změnách souborů, Automatické projevení úprav)

### 2.B.1 Instalace závislostí

```bash
cd /workspace/server && npm install
cd /workspace/client && npm install
```

### 2.B.2 Spuštění dev serverů (potřeba dvě bashe)
```bash
cd /workspace/server && npm run dev

# klient dostupný na http://localhost:3000
```
```bash
cd /workspace/client && npm run dev

# server dostupný na http://localhost:8086
```