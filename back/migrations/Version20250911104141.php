<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250911104141 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session DROP is_suspended');
        $this->addSql('ALTER TABLE subscription ALTER offer_type DROP NOT NULL');
        $this->addSql('ALTER TABLE subscription ALTER is_suspended SET NOT NULL');
        $this->addSql('ALTER TABLE subscription ALTER canceled_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('COMMENT ON COLUMN subscription.canceled_at IS \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE Session ADD is_suspended BOOLEAN DEFAULT false NOT NULL');
        $this->addSql('ALTER TABLE Subscription ALTER offer_type SET NOT NULL');
        $this->addSql('ALTER TABLE Subscription ALTER canceled_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE Subscription ALTER is_suspended DROP NOT NULL');
        $this->addSql('COMMENT ON COLUMN Subscription.canceled_at IS NULL');
    }
}
