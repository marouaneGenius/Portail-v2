<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250526131223 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE tutorschedule_center (tutorschedule_id INT NOT NULL, center_id INT NOT NULL, PRIMARY KEY(tutorschedule_id, center_id))');
        $this->addSql('CREATE INDEX IDX_12DD1A53F8A8F8B ON tutorschedule_center (tutorschedule_id)');
        $this->addSql('CREATE INDEX IDX_12DD1A535932F377 ON tutorschedule_center (center_id)');
        $this->addSql('ALTER TABLE tutorschedule_center ADD CONSTRAINT FK_12DD1A53F8A8F8B FOREIGN KEY (tutorschedule_id) REFERENCES TutorSchedule (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE tutorschedule_center ADD CONSTRAINT FK_12DD1A535932F377 FOREIGN KEY (center_id) REFERENCES Center (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE tutorschedule_center DROP CONSTRAINT FK_12DD1A53F8A8F8B');
        $this->addSql('ALTER TABLE tutorschedule_center DROP CONSTRAINT FK_12DD1A535932F377');
        $this->addSql('DROP TABLE tutorschedule_center');
    }
}
