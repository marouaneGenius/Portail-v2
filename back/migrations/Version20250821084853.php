<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250821084853 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE student ADD id_stripe VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE student DROP stripe_key');
        $this->addSql('ALTER TABLE student DROP id_sinao');
        $this->addSql('ALTER TABLE student DROP stripe_customer_id');
        $this->addSql('ALTER TABLE studentparent ADD id_sinao VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE StudentParent DROP id_sinao');
        $this->addSql('ALTER TABLE Student ADD id_sinao VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE Student ADD stripe_customer_id VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE Student RENAME COLUMN id_stripe TO stripe_key');
    }
}
