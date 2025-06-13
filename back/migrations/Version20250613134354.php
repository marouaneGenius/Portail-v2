<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250613134354 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE subscriptionurl DROP CONSTRAINT fk_164d7b5679f37ae5');
        $this->addSql('DROP INDEX idx_164d7b5679f37ae5');
        $this->addSql('ALTER TABLE subscriptionurl RENAME COLUMN id_user_id TO student_id');
        $this->addSql('ALTER TABLE subscriptionurl ADD CONSTRAINT FK_164D7B56CB944F1A FOREIGN KEY (student_id) REFERENCES Student (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_164D7B56CB944F1A ON subscriptionurl (student_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE SubscriptionURL DROP CONSTRAINT FK_164D7B56CB944F1A');
        $this->addSql('DROP INDEX IDX_164D7B56CB944F1A');
        $this->addSql('ALTER TABLE SubscriptionURL RENAME COLUMN student_id TO id_user_id');
        $this->addSql('ALTER TABLE SubscriptionURL ADD CONSTRAINT fk_164d7b5679f37ae5 FOREIGN KEY (id_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_164d7b5679f37ae5 ON SubscriptionURL (id_user_id)');
    }
}
