<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250819090912 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE subscriptionurl ADD id_user INT DEFAULT NULL');
        $this->addSql('ALTER TABLE subscriptionurl ADD CONSTRAINT FK_164D7B566B3CA4B FOREIGN KEY (id_user) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_164D7B566B3CA4B ON subscriptionurl (id_user)');
        $this->addSql('ALTER TABLE modification_history DROP CONSTRAINT fk_modification_history_user');
        $this->addSql('DROP INDEX idx_modification_user_date');
        $this->addSql('DROP INDEX idx_modification_type_date');
        $this->addSql('DROP INDEX idx_modification_field_name');
        $this->addSql('DROP INDEX idx_modification_action');
        $this->addSql('ALTER TABLE modification_history ALTER id DROP DEFAULT');
        $this->addSql('ALTER TABLE modification_history ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN modification_history.entity_type IS NULL');
        $this->addSql('COMMENT ON COLUMN modification_history.old_value IS NULL');
        $this->addSql('COMMENT ON COLUMN modification_history.new_value IS NULL');
        $this->addSql('COMMENT ON COLUMN modification_history.action IS NULL');
        $this->addSql('COMMENT ON COLUMN modification_history.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN modification_history.metadata IS NULL');
        $this->addSql('ALTER TABLE modification_history ADD CONSTRAINT FK_B3AEEB2EA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE modification_history DROP CONSTRAINT FK_B3AEEB2EA76ED395');
        $this->addSql('CREATE SEQUENCE modification_history_id_seq');
        $this->addSql('SELECT setval(\'modification_history_id_seq\', (SELECT MAX(id) FROM modification_history))');
        $this->addSql('ALTER TABLE modification_history ALTER id SET DEFAULT nextval(\'modification_history_id_seq\')');
        $this->addSql('ALTER TABLE modification_history ALTER created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN modification_history.entity_type IS \'Type d\'\'entité (student, parent, center, user, etc.)\'');
        $this->addSql('COMMENT ON COLUMN modification_history.old_value IS \'Ancienne valeur au format JSON avec type et valeur\'');
        $this->addSql('COMMENT ON COLUMN modification_history.new_value IS \'Nouvelle valeur au format JSON avec type et valeur\'');
        $this->addSql('COMMENT ON COLUMN modification_history.action IS \'Type d\'\'action (create, update, delete)\'');
        $this->addSql('COMMENT ON COLUMN modification_history.created_at IS NULL');
        $this->addSql('COMMENT ON COLUMN modification_history.metadata IS \'Donn\'\'es contextuelles suppl&eacute;mentaires au format JSON\'');
        $this->addSql('ALTER TABLE modification_history ADD CONSTRAINT fk_modification_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_modification_user_date ON modification_history (user_id, created_at)');
        $this->addSql('CREATE INDEX idx_modification_type_date ON modification_history (entity_type, created_at)');
        $this->addSql('CREATE INDEX idx_modification_field_name ON modification_history (field_name)');
        $this->addSql('CREATE INDEX idx_modification_action ON modification_history (action)');
        $this->addSql('ALTER TABLE SubscriptionURL DROP CONSTRAINT FK_164D7B566B3CA4B');
        $this->addSql('DROP INDEX IDX_164D7B566B3CA4B');
        $this->addSql('ALTER TABLE SubscriptionURL DROP id_user');
    }
}
