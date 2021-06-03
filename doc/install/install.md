# Zapnutí kontejneru a přechod do bash

// v projektové složce, kde se nachází `docker-compose.yml`
```bash
docker-compose up -d
docker-compose exec node bash
```

# 1. Produkce

**Poznámka**: v případě problémů s oprávněním pouštět příkazy se sudo

**Poznámka**: spustit příkazy od shora dolů

## Instalace závislostí a Build

Instalace závislostí 
```bash
cd /workspace/server && npm install
cd /workspace/client && npm install
```

Build server: typescript na javascript (vytvoření složky dist)
```bash
cd /workspace/server && npm run build
```
Build client: svelte a typescript na javascript, css, ... (vytvoření složky dist)
``` bash
cd /workspace/client && npm run build
```

## Spuštění serveru

ln -s ../client/dist/ client
// create symlink to client dist folder
```bash
cd /workspace/server && npm run start
# klient dostupný na http://localhost:8086
```

---

# 2. Vývoj (Automatický build při změnách souborů, Automatické projevení úprav)

## Instalace závislostí

```bash
cd /workspace/server && npm install
cd /workspace/client && npm install
```

## Spuštění dev serverů (potřeba dvě bashe)
```bash
cd /workspace/server && npm run dev
cd /workspace/client && npm run dev
```