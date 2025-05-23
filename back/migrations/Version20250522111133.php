<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250522111133 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_center (user_id INT NOT NULL, center_id INT NOT NULL, PRIMARY KEY(user_id, center_id))');
        $this->addSql('CREATE INDEX IDX_25A2F019A76ED395 ON user_center (user_id)');
        $this->addSql('CREATE INDEX IDX_25A2F0195932F377 ON user_center (center_id)');
        $this->addSql('ALTER TABLE user_center ADD CONSTRAINT FK_25A2F019A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_center ADD CONSTRAINT FK_25A2F0195932F377 FOREIGN KEY (center_id) REFERENCES Center (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE users DROP CONSTRAINT fk_2da17977d9074f50');
        $this->addSql('DROP INDEX idx_1483a5e9d9074f50');
        $this->addSql('ALTER TABLE users DROP id_center_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE user_center DROP CONSTRAINT FK_25A2F019A76ED395');
        $this->addSql('ALTER TABLE user_center DROP CONSTRAINT FK_25A2F0195932F377');
        $this->addSql('DROP TABLE user_center');
        $this->addSql('ALTER TABLE users ADD id_center_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE users ADD CONSTRAINT fk_2da17977d9074f50 FOREIGN KEY (id_center_id) REFERENCES center (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX idx_1483a5e9d9074f50 ON users (id_center_id)');
    }
}
