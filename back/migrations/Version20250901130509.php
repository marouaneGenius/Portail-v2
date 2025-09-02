<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250901130509 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE report ADD content TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE report ADD points_worked VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE report ADD observations TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE report ADD homework_recommendations TEXT DEFAULT NULL');
        $this->addSql('ALTER TABLE report ADD session_duration INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE Report DROP content');
        $this->addSql('ALTER TABLE Report DROP points_worked');
        $this->addSql('ALTER TABLE Report DROP observations');
        $this->addSql('ALTER TABLE Report DROP homework_recommendations');
        $this->addSql('ALTER TABLE Report DROP session_duration');
    }
}
