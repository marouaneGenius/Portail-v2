<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250624094038 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session ADD is_absent BOOLEAN DEFAULT NULL');
        $this->addSql('ALTER TABLE session ADD absent_by VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE session ADD created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL');
        $this->addSql('ALTER TABLE session ADD created_by VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE session ADD updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE session ADD updated_by VARCHAR(255) NOT NULL');
        $this->addSql('COMMENT ON COLUMN session.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN session.updated_at IS \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE Session DROP is_absent');
        $this->addSql('ALTER TABLE Session DROP absent_by');
        $this->addSql('ALTER TABLE Session DROP created_at');
        $this->addSql('ALTER TABLE Session DROP created_by');
        $this->addSql('ALTER TABLE Session DROP updated_at');
        $this->addSql('ALTER TABLE Session DROP updated_by');
    }
}
