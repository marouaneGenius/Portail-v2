<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250819164500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fix Session entity column mappings - rename id_tutor_id to id_tutor and Scheduled_at to scheduled_at';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        // Renommer la colonne id_tutor_id vers id_tutor si elle existe
        $this->addSql('ALTER TABLE session DROP CONSTRAINT IF EXISTS FK_D044D5D43D2E94D8');
        $this->addSql('DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = \'session\' AND column_name = \'id_tutor_id\') THEN
                ALTER TABLE session RENAME COLUMN id_tutor_id TO id_tutor;
            END IF;
        END $$;');
        
        // Renommer la colonne Scheduled_at vers scheduled_at si elle existe
        $this->addSql('DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = \'session\' AND column_name = \'\"Scheduled_at\"\') THEN
                ALTER TABLE session RENAME COLUMN "Scheduled_at" TO scheduled_at;
            END IF;
        END $$;');
        
        // Recréer la contrainte FK
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D4A76ED395 FOREIGN KEY (id_tutor) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE session DROP CONSTRAINT IF EXISTS FK_D044D5D4A76ED395');
        
        $this->addSql('DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = \'session\' AND column_name = \'id_tutor\') THEN
                ALTER TABLE session RENAME COLUMN id_tutor TO id_tutor_id;
            END IF;
        END $$;');
        
        $this->addSql('DO $$ 
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = \'session\' AND column_name = \'scheduled_at\') THEN
                ALTER TABLE session RENAME COLUMN scheduled_at TO "Scheduled_at";
            END IF;
        END $$;');
        
        $this->addSql('ALTER TABLE session ADD CONSTRAINT FK_D044D5D43D2E94D8 FOREIGN KEY (id_tutor_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}