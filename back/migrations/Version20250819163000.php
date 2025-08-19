<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250819163000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix SubscriptionURL id_user column mapping';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE subscription_url DROP CONSTRAINT IF EXISTS FK_5B4B7C6A3D2E94D8');
        $this->addSql('ALTER TABLE subscription_url DROP COLUMN IF EXISTS id_user_id');
        $this->addSql('ALTER TABLE subscription_url ADD CONSTRAINT FK_5B4B7C6AA76ED395 FOREIGN KEY (id_user) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE subscription_url DROP CONSTRAINT IF EXISTS FK_5B4B7C6AA76ED395');
        $this->addSql('ALTER TABLE subscription_url ADD COLUMN id_user_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE subscription_url ADD CONSTRAINT FK_5B4B7C6A3D2E94D8 FOREIGN KEY (id_user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}