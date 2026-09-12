FROM postgres:17-alpine@sha256:18cfe3ef5e6815560c98237d6216d1e5119702fb0f3894c8785dd58b8bbe5d73

# PostgreSQL reste l’image officielle et s’exécute avec son utilisateur
# postgres. Les données sont conservées exclusivement dans un volume nommé.
