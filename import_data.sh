#!/bin/bash

# Définissez l'utilisateur et le mot de passe MySQL
MYSQL_USER="root"
MYSQL_PASS="root"
CONTAINER_NAME="symfony_db"

# Liste des bases et des fichiers SQL correspondants
declare -A imports=(
  ["lacryo_genius_alm"]="docker/mysql/initdb/lacryo_genius_alm.sql"
  ["lacryo_genius_home"]="docker/mysql/initdb/lacryo_genius_home.sql"
  ["lacryo_geniusclass"]="docker/mysql/initdb/lacryo_geniusclass.sql"
  ["lacryo_lacryo_landing"]="docker/mysql/initdb/lacryo_lacryo_landing.sql"
  ["lacryo_lacryo_lpgin_gc"]="docker/mysql/initdb/lacryo_lacryo_lpgin_gc.sql"
  ["lacryo_landing_gc"]="docker/mysql/initdb/lacryo_landing_gc.sql"
  ["lacryo_portail_gc_ass"]="docker/mysql/initdb/lacryo_portail_gc_ass.sql"
  ["lacryo_portail_gc_eng"]="docker/mysql/initdb/lacryo_portail_gc_eng.sql"
  ["lacryo_portail_gc_gonesse"]="docker/mysql/initdb/lacryo_portail_gc_gonesse.sql"
  ["lacryo_portail_gc_pontoise"]="docker/mysql/initdb/lacryo_portail_gc_pontoise.sql"
  ["lacryo_portail_gc"]="docker/mysql/initdb/lacryo_portail_gc.sql"
)


# Parcourir chaque base et importer le fichier SQL associé
for db in "${!imports[@]}"; do
  echo "Création de la base '$db' si elle n'existe pas..."
  docker exec -i ${CONTAINER_NAME} mysql -u${MYSQL_USER} -p${MYSQL_PASS} -e "CREATE DATABASE IF NOT EXISTS ${db};"
  
  echo "Importation du fichier ${imports[$db]} dans la base ${db}..."
  docker exec -i ${CONTAINER_NAME} mysql -u${MYSQL_USER} -p${MYSQL_PASS} ${db} < ${imports[$db]}
done

echo "Import terminé."



# chmod +x import_data.sh
# ./import_data.sh