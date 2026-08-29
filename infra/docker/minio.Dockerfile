FROM minio/minio:latest@sha256:14cea493d9a34af32f524e538b8346cf79f3321eff8e708c1e2960462bd8936e

# MinIO reste l’image officielle et s’exécute avec son utilisateur intégré.
# La politique publique est appliquée explicitement par le déploiement, jamais
# par des identifiants écrits dans l’image.
