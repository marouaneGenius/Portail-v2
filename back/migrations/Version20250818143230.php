<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250818_add_modification_history extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create modification_history table to track entity changes';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE modification_history (
            id SERIAL PRIMARY KEY,
            user_id INT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INT NOT NULL,
            entity_name VARCHAR(255) NULL,
            field_name VARCHAR(100) NOT NULL,
            old_value JSON NULL,
            new_value JSON NULL,
            action VARCHAR(20) NOT NULL,
            ip_address VARCHAR(45) NULL,
            user_agent TEXT NULL,
            created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
            metadata JSON NULL
        )');

        $this->addSql('ALTER TABLE modification_history ADD CONSTRAINT FK_modification_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL');

        $this->addSql('CREATE INDEX idx_modification_user ON modification_history (user_id)');
        $this->addSql('CREATE INDEX idx_modification_entity_type ON modification_history (entity_type)');
        $this->addSql('CREATE INDEX idx_modification_entity_id ON modification_history (entity_id)');
        $this->addSql('CREATE INDEX idx_modification_created_at ON modification_history (created_at)');
        $this->addSql('CREATE INDEX idx_modification_entity ON modification_history (entity_type, entity_id)');
        $this->addSql('CREATE INDEX idx_modification_action ON modification_history (action)');
        $this->addSql('CREATE INDEX idx_modification_field_name ON modification_history (field_name)');
        $this->addSql('CREATE INDEX idx_modification_type_date ON modification_history (entity_type, created_at DESC)');
        $this->addSql('CREATE INDEX idx_modification_user_date ON modification_history (user_id, created_at DESC)');

        $this->addSql("COMMENT ON TABLE modification_history IS 'Historique des modifications des entités principales'");
        $this->addSql("COMMENT ON COLUMN modification_history.entity_type IS 'Type d''entité (student, parent, center, user, etc.)'");
        $this->addSql("COMMENT ON COLUMN modification_history.old_value IS 'Ancienne valeur au format JSON avec type et valeur'");
        $this->addSql("COMMENT ON COLUMN modification_history.new_value IS 'Nouvelle valeur au format JSON avec type et valeur'");
        $this->addSql("COMMENT ON COLUMN modification_history.action IS 'Type d''action (create, update, delete)'");
        $this->addSql("COMMENT ON COLUMN modification_history.metadata IS 'Données contextuelles supplémentaires au format JSON'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IF EXISTS idx_modification_user_date');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_type_date');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_field_name');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_action');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_entity');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_created_at');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_entity_id');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_entity_type');
        $this->addSql('DROP INDEX IF EXISTS idx_modification_user');

        $this->addSql('DROP TABLE IF EXISTS modification_history');
    }
}
