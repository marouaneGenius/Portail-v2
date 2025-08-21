<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250821084737 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE modification_history_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE modification_history (id INT NOT NULL, user_id INT DEFAULT NULL, entity_type VARCHAR(50) NOT NULL, entity_id INT NOT NULL, entity_name VARCHAR(255) DEFAULT NULL, field_name VARCHAR(100) NOT NULL, old_value JSON DEFAULT NULL, new_value JSON DEFAULT NULL, action VARCHAR(20) NOT NULL, ip_address VARCHAR(45) DEFAULT NULL, user_agent TEXT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, metadata JSON DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX idx_modification_user ON modification_history (user_id)');
        $this->addSql('CREATE INDEX idx_modification_entity_type ON modification_history (entity_type)');
        $this->addSql('CREATE INDEX idx_modification_entity_id ON modification_history (entity_id)');
        $this->addSql('CREATE INDEX idx_modification_created_at ON modification_history (created_at)');
        $this->addSql('CREATE INDEX idx_modification_entity ON modification_history (entity_type, entity_id)');
        $this->addSql('COMMENT ON COLUMN modification_history.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE modification_history ADD CONSTRAINT FK_B3AEEB2EA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE session ALTER canceled_by TYPE VARCHAR(255)');
        $this->addSql('ALTER TABLE studentparent ADD password VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE subscriptionurl ADD id_user INT DEFAULT NULL');
        $this->addSql('ALTER TABLE subscriptionurl ADD CONSTRAINT FK_164D7B566B3CA4B FOREIGN KEY (id_user) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_164D7B566B3CA4B ON subscriptionurl (id_user)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE modification_history_id_seq CASCADE');
        $this->addSql('ALTER TABLE modification_history DROP CONSTRAINT FK_B3AEEB2EA76ED395');
        $this->addSql('DROP TABLE modification_history');
        $this->addSql('ALTER TABLE SubscriptionURL DROP CONSTRAINT FK_164D7B566B3CA4B');
        $this->addSql('DROP INDEX IDX_164D7B566B3CA4B');
        $this->addSql('ALTER TABLE SubscriptionURL DROP id_user');
        $this->addSql('ALTER TABLE Session ALTER canceled_by TYPE INT');
        $this->addSql('ALTER TABLE StudentParent DROP password');
    }
}
