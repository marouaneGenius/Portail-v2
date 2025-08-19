<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250818_idempotent_modification_history_fix extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Idempotent fix: ensure modification_history has entity_type and expected indexes (safe)';
    }

    public function up(Schema $schema): void
    {
        // Add column if missing (Postgres supports IF NOT EXISTS)
        $this->addSql("ALTER TABLE modification_history ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50)");

        // Ensure indexes exist (IF NOT EXISTS for Postgres 9.5+ works for CREATE INDEX IF NOT EXISTS)
        $this->addSql("CREATE INDEX IF NOT EXISTS idx_modification_entity_type ON modification_history (entity_type)");
        $this->addSql("CREATE INDEX IF NOT EXISTS idx_modification_entity_id ON modification_history (entity_id)");
        $this->addSql("CREATE INDEX IF NOT EXISTS idx_modification_user ON modification_history (user_id)");
        $this->addSql("CREATE INDEX IF NOT EXISTS idx_modification_created_at ON modification_history (created_at)");
        $this->addSql("CREATE INDEX IF NOT EXISTS idx_modification_entity ON modification_history (entity_type, entity_id)");
        $this->addSql("CREATE INDEX IF NOT EXISTS idx_modification_action ON modification_history (action)");
        $this->addSql("CREATE INDEX IF NOT EXISTS idx_modification_field_name ON modification_history (field_name)");
        $this->addSql("CREATE INDEX IF NOT EXISTS idx_modification_type_date ON modification_history (entity_type, created_at DESC)");
        $this->addSql("CREATE INDEX IF NOT EXISTS idx_modification_user_date ON modification_history (user_id, created_at DESC)");
    }

    public function down(Schema $schema): void
    {
        // Drop indexes if present (safe)
        $this->addSql('DROP INDEX IF EXISTS idx_modification_user_date');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_type_date');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_field_name');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_action');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_entity');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_created_at');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_entity_id');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_entity_type');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_user');

        // We don't drop the table itself here (safer). If you want to drop the column:
        $this->addSql("ALTER TABLE IF EXISTS modification_history DROP COLUMN IF EXISTS entity_type");
    }
}
