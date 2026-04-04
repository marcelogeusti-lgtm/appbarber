# Central de Segurança e Backups

Este diretório contém as ferramentas e os snapshots do seu projeto **App Barbeiro**.

## Como realizar um backup agora?

Abra o seu terminal na pasta raiz do projeto e execute:

1. **Backup completo do código (Snapshot)**:
   ```bash
   node server/scripts/safety/create_snapshot.js
   ```
   *Os arquivos serão salvos em `backups/snapshots/`.*

2. **Backup de todos os dados do Banco (JSON Dump)**:
   ```bash
   node server/scripts/safety/dump_database.js
   ```
   *Os dados serão salvos em `backups/db_dumps/`.*

## Como restaurar?

- **Código**: Copie o conteúdo da pasta do snapshot desejado de volta para as pastas `client` ou `server`.
- **Dados**: Os arquivos JSON servem como referência histórica e podem ser re-importados via script caso ocorra perda de dados no Supabase.

---
**Dica:** Execute esses comandos sempre que terminar uma grande funcionalidade ou antes de fazer uma alteração arriscada!
