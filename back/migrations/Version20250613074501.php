<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250613074501 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE SubscriptionURL_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE SubscriptionURL (id INT NOT NULL, id_user_id INT DEFAULT NULL, subscription_id INT DEFAULT NULL, url VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_164D7B5679F37AE5 ON SubscriptionURL (id_user_id)');
        $this->addSql('CREATE INDEX IDX_164D7B569A1887DC ON SubscriptionURL (subscription_id)');
        $this->addSql('ALTER TABLE SubscriptionURL ADD CONSTRAINT FK_164D7B5679F37AE5 FOREIGN KEY (id_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE SubscriptionURL ADD CONSTRAINT FK_164D7B569A1887DC FOREIGN KEY (subscription_id) REFERENCES Subscription (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE SubscriptionURL_id_seq CASCADE');
        $this->addSql('ALTER TABLE SubscriptionURL DROP CONSTRAINT FK_164D7B5679F37AE5');
        $this->addSql('ALTER TABLE SubscriptionURL DROP CONSTRAINT FK_164D7B569A1887DC');
        $this->addSql('DROP TABLE SubscriptionURL');
    }
}
