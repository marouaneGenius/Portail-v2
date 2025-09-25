# 🔔 Configuration du système de rappels SMS pour tuteurs

## 📋 Vue d'ensemble

Ce système envoie automatiquement un SMS de rappel aux tuteurs qui ont des sessions programmées pour le lendemain. Il garantit qu'aucun tuteur ne reçoive plus d'un SMS par jour.

## 🏗️ Architecture

### Composants créés

1. **`SmsService`** - Service d'envoi de SMS via SMSMode
2. **`TutorReminderLog`** - Entité pour traquer les rappels envoyés
3. **`TutorReminderService`** - Logique métier des rappels
4. **`SendTutorRemindersCommand`** - Commande console
5. **Configuration cron** - Exécution quotidienne automatique

## ⚙️ Configuration requise

### 1. Variables d'environnement

Ajouter dans `.env` :
```env
###> SMS Configuration ###
SMS_ENABLED=true
SMS_API_KEY=your_smsmode_api_key_here
SMS_API_URL=https://api.smsmode.com/http/1.6/
###< SMS Configuration ###
```

### 2. Compte SMSMode

1. Créer un compte sur [SMSMode.com](https://www.smsmode.com)
2. Récupérer votre clé API (Access Token)
3. Remplacer `your_smsmode_api_key_here` par votre vraie clé

### 3. Migration de base de données

```bash
# Générer la migration pour la nouvelle entité
php bin/console make:migration

# Appliquer la migration
php bin/console doctrine:migrations:migrate
```

## 🚀 Utilisation

### Commande manuelle

```bash
# Envoi normal des rappels
php bin/console app:send-tutor-reminders

# Simulation (dry-run)
php bin/console app:send-tutor-reminders --dry-run

# Forcer l'envoi même si déjà fait aujourd'hui
php bin/console app:send-tutor-reminders --force

# Nettoyer les anciens logs
php bin/console app:send-tutor-reminders --clean-logs
```

### Tâche cron automatique

Ajouter dans votre crontab :
```bash
# Exécution tous les jours à 18h00
0 18 * * * cd /path/to/your/project/back && php bin/console app:send-tutor-reminders >> /var/log/tutor-reminders.log 2>&1
```

## 🔧 Fonctionnalités

### Anti-spam intégré

- ✅ **Maximum 1 SMS par tuteur par jour**
- ✅ **Vérification des doublons** avant envoi
- ✅ **Logs détaillés** de tous les envois
- ✅ **Ignorer les sessions annulées**

### Messages personnalisés

```
Exemple de message :
"Bonjour Marie, vous avez 2 sessions prévues demain mardi 26 septembre (14h00, 16h30). N'oubliez pas! Bonne journée."
```

### Statistiques et monitoring

- Nombre de SMS envoyés/échoués
- Taux de réussite sur 7 jours
- Nettoyage automatique des logs anciens (30+ jours)

## 📊 Structure de la base de données

### Table `tutor_reminder_log`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | int | Identifiant unique |
| `tutor_id` | int | ID du tuteur (FK vers users) |
| `reminder_date` | date | Date d'envoi du rappel |
| `session_date` | date | Date de la session concernée |
| `phone` | varchar(20) | Numéro utilisé |
| `message` | text | Contenu du SMS |
| `successful` | boolean | Succès de l'envoi |
| `error_message` | text | Message d'erreur (si échec) |
| `created_at` | timestamp | Date de création |

## 🛡️ Sécurité et bonnes pratiques

### Protection anti-spam
- Vérification que le tuteur n'a pas déjà reçu un rappel pour cette date de session
- Maximum un cycle de rappels par jour
- Logs de tous les envois pour audit

### Gestion d'erreurs
- Capture des erreurs d'API SMSMode
- Logging détaillé pour debugging
- Continuation du processus même en cas d'échec ponctuel

### Performance
- Requêtes optimisées avec JOIN pour éviter N+1
- Nettoyage automatique des anciens logs
- Groupement des sessions par tuteur

## 🔍 Dépannage

### Problèmes courants

**SMS non envoyés :**
1. Vérifier `SMS_ENABLED=true` dans `.env`
2. Vérifier la validité de `SMS_API_KEY`
3. Contrôler les logs : `/var/log/tutor-reminders.log`

**Messages de rappel non reçus :**
1. Vérifier le format des numéros de téléphone dans la BDD
2. S'assurer que les sessions ont bien `is_canceled = false`
3. Vérifier que les tuteurs ont le rôle `ROLE_TUTOR`

**Doublons de messages :**
- Le système empêche automatiquement les doublons
- Utiliser `--force` seulement en cas de besoin urgent

### Logs et monitoring

```bash
# Voir les derniers envois
tail -f /var/log/tutor-reminders.log

# Vérifier le statut de la cron
systemctl status cron

# Tester manuellement la commande
php bin/console app:send-tutor-reminders --dry-run -v
```

## 📈 Évolutions possibles

1. **Interface web** pour gérer les rappels
2. **Templates de messages** personnalisables
3. **Rappels multiples** (J-1, J-7, etc.)
4. **SMS de confirmation** après les sessions
5. **Intégration avec d'autres providers SMS**

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Migration de BDD appliquée
- [ ] Compte SMSMode créé et configuré
- [ ] Cron configuré
- [ ] Test manuel de la commande
- [ ] Vérification des logs
- [ ] Test d'envoi réel sur un tuteur de test

Le système est maintenant prêt pour la production ! 🎉