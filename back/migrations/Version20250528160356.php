<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250528160356 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE subscription ADD subscription_start_date TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE subscription ADD paiemnt_mode VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE subscription ADD date_caution DATE DEFAULT NULL');
        $this->addSql('ALTER TABLE subscription ADD caution BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE subscription ADD favorite_slots JSON DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE Subscription DROP subscription_start_date');
        $this->addSql('ALTER TABLE Subscription DROP paiemnt_mode');
        $this->addSql('ALTER TABLE Subscription DROP date_caution');
        $this->addSql('ALTER TABLE Subscription DROP caution');
        $this->addSql('ALTER TABLE Subscription DROP favorite_slots');
    }
}
