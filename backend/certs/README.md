# Local CA certificates

Place the locally downloaded trusted GigaChat CA certificate here and set its absolute path in `AI_GIGACHAT_CA_BUNDLE` inside `backend/.env`.

Certificate files are intentionally ignored by Git. TLS verification must remain enabled; never use `verify=False` or `CERT_NONE`.
