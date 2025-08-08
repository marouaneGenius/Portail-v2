<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250805203559 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE Center_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE Report_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE Session_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE Student_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE StudentParent_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE Subscription_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE SubscriptionURL_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE TutorSchedule_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE users_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE Center (id INT NOT NULL, name VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, city VARCHAR(255) NOT NULL, phone VARCHAR(255) DEFAULT NULL, email VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE Report (id INT NOT NULL, id_student_id INT DEFAULT NULL, id_user_id INT DEFAULT NULL, id_session_id INT DEFAULT NULL, skills_assessment JSON NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_by INT NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, updated_by INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C38372B26E1ECFCD ON Report (id_student_id)');
        $this->addSql('CREATE INDEX IDX_C38372B279F37AE5 ON Report (id_user_id)');
        $this->addSql('CREATE INDEX IDX_C38372B2C4B56C08 ON Report (id_session_id)');
        $this->addSql('COMMENT ON COLUMN Report.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN Report.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE Session (id INT NOT NULL, id_tutor_id INT DEFAULT NULL, center_id INT DEFAULT NULL, payment_date DATE NOT NULL, stripe_number VARCHAR(255) DEFAULT NULL, school_subjects JSON DEFAULT NULL, date_slot DATE NOT NULL, resume VARCHAR(255) DEFAULT NULL, Scheduled_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, scheduled_by VARCHAR(255) DEFAULT NULL, session_type VARCHAR(255) DEFAULT NULL, is_canceled BOOLEAN NOT NULL, canceled_by INT DEFAULT NULL, is_paid BOOLEAN DEFAULT NULL, is_absent BOOLEAN DEFAULT NULL, absent_by VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_by VARCHAR(255) NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, updated_by VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_1FF9EC4870548864 ON Session (id_tutor_id)');
        $this->addSql('CREATE INDEX IDX_1FF9EC485932F377 ON Session (center_id)');
        $this->addSql('COMMENT ON COLUMN Session.Scheduled_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN Session.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN Session.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE session_student (session_id INT NOT NULL, student_id INT NOT NULL, PRIMARY KEY(session_id, student_id))');
        $this->addSql('CREATE INDEX IDX_A5FB2D69613FECDF ON session_student (session_id)');
        $this->addSql('CREATE INDEX IDX_A5FB2D69CB944F1A ON session_student (student_id)');
        $this->addSql('CREATE TABLE session_subscription (session_id INT NOT NULL, subscription_id INT NOT NULL, PRIMARY KEY(session_id, subscription_id))');
        $this->addSql('CREATE INDEX IDX_6D5BD952613FECDF ON session_subscription (session_id)');
        $this->addSql('CREATE INDEX IDX_6D5BD9529A1887DC ON session_subscription (subscription_id)');
        $this->addSql('CREATE TABLE Student (id INT NOT NULL, id_center_id INT DEFAULT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, gender VARCHAR(255) NOT NULL, class VARCHAR(255) NOT NULL, phone VARCHAR(255) DEFAULT NULL, email VARCHAR(255) NOT NULL, is_active BOOLEAN NOT NULL, is_deleted BOOLEAN NOT NULL, stripe_key VARCHAR(255) DEFAULT NULL, url_notion_public VARCHAR(255) DEFAULT NULL, url_notion VARCHAR(255) DEFAULT NULL, id_pipedrive VARCHAR(255) DEFAULT NULL, id_sinao VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_by VARCHAR(255) DEFAULT NULL, updated_by VARCHAR(255) DEFAULT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, school_subjects JSON DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_789E96AFD9074F50 ON Student (id_center_id)');
        $this->addSql('COMMENT ON COLUMN Student.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN Student.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE student_studentparent (student_id INT NOT NULL, studentparent_id INT NOT NULL, PRIMARY KEY(student_id, studentparent_id))');
        $this->addSql('CREATE INDEX IDX_6A1D0DD0CB944F1A ON student_studentparent (student_id)');
        $this->addSql('CREATE INDEX IDX_6A1D0DD0EF31C38B ON student_studentparent (studentparent_id)');
        $this->addSql('CREATE TABLE StudentParent (id INT NOT NULL, firstname VARCHAR(255) NOT NULL, lastname VARCHAR(255) NOT NULL, gender VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, zip_code VARCHAR(255) DEFAULT NULL, city VARCHAR(255) DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_by VARCHAR(255) DEFAULT NULL, updated_by VARCHAR(255) DEFAULT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN StudentParent.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN StudentParent.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE Subscription (id INT NOT NULL, id_student_id INT DEFAULT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_by VARCHAR(255) DEFAULT NULL, updated_by VARCHAR(255) DEFAULT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, subscription_end_date TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, first_debit_date TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, recurrent_debit_date VARCHAR(255) DEFAULT NULL, installment_count INT DEFAULT NULL, session_per_week INT DEFAULT NULL, week_count INT DEFAULT NULL, selected_weeks JSON DEFAULT NULL, known_weeks VARCHAR(255) DEFAULT NULL, session_schedule JSON DEFAULT NULL, discount INT DEFAULT NULL, school_subjects JSON DEFAULT NULL, offer_type VARCHAR(255) NOT NULL, offer_amount INT DEFAULT NULL, membership_fee DOUBLE PRECISION DEFAULT NULL, combined_id VARCHAR(255) DEFAULT NULL, subscription_type VARCHAR(255) NOT NULL, is_valide BOOLEAN NOT NULL, subscription_start_date TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, payment_mode VARCHAR(255) DEFAULT NULL, date_caution DATE DEFAULT NULL, caution BOOLEAN DEFAULT NULL, favorite_slots JSON DEFAULT NULL, is_programmed BOOLEAN DEFAULT NULL, programed_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, programed_by VARCHAR(255) DEFAULT NULL, is_canceled BOOLEAN DEFAULT NULL, canceled_by VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_BBF7BF2B6E1ECFCD ON Subscription (id_student_id)');
        $this->addSql('COMMENT ON COLUMN Subscription.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN Subscription.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN Subscription.programed_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE SubscriptionURL (id INT NOT NULL, subscription_id INT DEFAULT NULL, student_id INT DEFAULT NULL, url VARCHAR(255) NOT NULL, is_combined BOOLEAN DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_164D7B569A1887DC ON SubscriptionURL (subscription_id)');
        $this->addSql('CREATE INDEX IDX_164D7B56CB944F1A ON SubscriptionURL (student_id)');
        $this->addSql('CREATE TABLE TutorSchedule (id INT NOT NULL, id_user_id INT DEFAULT NULL, day VARCHAR(20) NOT NULL, start_hour TIME(0) WITHOUT TIME ZONE NOT NULL, end_hour TIME(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C80D49A79F37AE5 ON TutorSchedule (id_user_id)');
        $this->addSql('COMMENT ON COLUMN TutorSchedule.start_hour IS \'(DC2Type:time_immutable)\'');
        $this->addSql('COMMENT ON COLUMN TutorSchedule.end_hour IS \'(DC2Type:time_immutable)\'');
        $this->addSql('CREATE TABLE tutorschedule_center (tutorschedule_id INT NOT NULL, center_id INT NOT NULL, PRIMARY KEY(tutorschedule_id, center_id))');
        $this->addSql('CREATE INDEX IDX_12DD1A53F8A8F8B ON tutorschedule_center (tutorschedule_id)');
        $this->addSql('CREATE INDEX IDX_12DD1A535932F377 ON tutorschedule_center (center_id)');
        $this->addSql('CREATE TABLE users (id INT NOT NULL, firstname VARCHAR(255) DEFAULT NULL, lastname VARCHAR(255) DEFAULT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, siret VARCHAR(255) DEFAULT NULL, is_active BOOLEAN NOT NULL, is_deleted BOOLEAN NOT NULL, roles JSON NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, created_by VARCHAR(255) DEFAULT NULL, updated_by VARCHAR(255) DEFAULT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, max_session INT DEFAULT NULL, price_per_hour VARCHAR(255) DEFAULT NULL, google_id VARCHAR(255) DEFAULT NULL, school_subjects JSON DEFAULT NULL, class JSON DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN users.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN users.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE user_center (user_id INT NOT NULL, center_id INT NOT NULL, PRIMARY KEY(user_id, center_id))');
        $this->addSql('CREATE INDEX IDX_25A2F019A76ED395 ON user_center (user_id)');
        $this->addSql('CREATE INDEX IDX_25A2F0195932F377 ON user_center (center_id)');
        $this->addSql('CREATE TABLE messenger_messages (id BIGSERIAL NOT NULL, body TEXT NOT NULL, headers TEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, available_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, delivered_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_75EA56E0FB7336F0 ON messenger_messages (queue_name)');
        $this->addSql('CREATE INDEX IDX_75EA56E0E3BD61CE ON messenger_messages (available_at)');
        $this->addSql('CREATE INDEX IDX_75EA56E016BA31DB ON messenger_messages (delivered_at)');
        $this->addSql('CREATE OR REPLACE FUNCTION notify_messenger_messages() RETURNS TRIGGER AS $$
            BEGIN
                PERFORM pg_notify(\'messenger_messages\', NEW.queue_name::text);
                RETURN NEW;
            END;
        $$ LANGUAGE plpgsql;');
        $this->addSql('DROP TRIGGER IF EXISTS notify_trigger ON messenger_messages;');
        $this->addSql('CREATE TRIGGER notify_trigger AFTER INSERT OR UPDATE ON messenger_messages FOR EACH ROW EXECUTE PROCEDURE notify_messenger_messages();');
        $this->addSql('ALTER TABLE Report ADD CONSTRAINT FK_C38372B26E1ECFCD FOREIGN KEY (id_student_id) REFERENCES Student (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE Report ADD CONSTRAINT FK_C38372B279F37AE5 FOREIGN KEY (id_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE Report ADD CONSTRAINT FK_C38372B2C4B56C08 FOREIGN KEY (id_session_id) REFERENCES Session (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE Session ADD CONSTRAINT FK_1FF9EC4870548864 FOREIGN KEY (id_tutor_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE Session ADD CONSTRAINT FK_1FF9EC485932F377 FOREIGN KEY (center_id) REFERENCES Center (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE session_student ADD CONSTRAINT FK_A5FB2D69613FECDF FOREIGN KEY (session_id) REFERENCES Session (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE session_student ADD CONSTRAINT FK_A5FB2D69CB944F1A FOREIGN KEY (student_id) REFERENCES Student (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE session_subscription ADD CONSTRAINT FK_6D5BD952613FECDF FOREIGN KEY (session_id) REFERENCES Session (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE session_subscription ADD CONSTRAINT FK_6D5BD9529A1887DC FOREIGN KEY (subscription_id) REFERENCES Subscription (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE Student ADD CONSTRAINT FK_789E96AFD9074F50 FOREIGN KEY (id_center_id) REFERENCES Center (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE student_studentparent ADD CONSTRAINT FK_6A1D0DD0CB944F1A FOREIGN KEY (student_id) REFERENCES Student (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE student_studentparent ADD CONSTRAINT FK_6A1D0DD0EF31C38B FOREIGN KEY (studentparent_id) REFERENCES StudentParent (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE Subscription ADD CONSTRAINT FK_BBF7BF2B6E1ECFCD FOREIGN KEY (id_student_id) REFERENCES Student (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE SubscriptionURL ADD CONSTRAINT FK_164D7B569A1887DC FOREIGN KEY (subscription_id) REFERENCES Subscription (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE SubscriptionURL ADD CONSTRAINT FK_164D7B56CB944F1A FOREIGN KEY (student_id) REFERENCES Student (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE TutorSchedule ADD CONSTRAINT FK_C80D49A79F37AE5 FOREIGN KEY (id_user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE tutorschedule_center ADD CONSTRAINT FK_12DD1A53F8A8F8B FOREIGN KEY (tutorschedule_id) REFERENCES TutorSchedule (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE tutorschedule_center ADD CONSTRAINT FK_12DD1A535932F377 FOREIGN KEY (center_id) REFERENCES Center (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_center ADD CONSTRAINT FK_25A2F019A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_center ADD CONSTRAINT FK_25A2F0195932F377 FOREIGN KEY (center_id) REFERENCES Center (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE Center_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE Report_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE Session_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE Student_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE StudentParent_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE Subscription_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE SubscriptionURL_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE TutorSchedule_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE users_id_seq CASCADE');
        $this->addSql('ALTER TABLE Report DROP CONSTRAINT FK_C38372B26E1ECFCD');
        $this->addSql('ALTER TABLE Report DROP CONSTRAINT FK_C38372B279F37AE5');
        $this->addSql('ALTER TABLE Report DROP CONSTRAINT FK_C38372B2C4B56C08');
        $this->addSql('ALTER TABLE Session DROP CONSTRAINT FK_1FF9EC4870548864');
        $this->addSql('ALTER TABLE Session DROP CONSTRAINT FK_1FF9EC485932F377');
        $this->addSql('ALTER TABLE session_student DROP CONSTRAINT FK_A5FB2D69613FECDF');
        $this->addSql('ALTER TABLE session_student DROP CONSTRAINT FK_A5FB2D69CB944F1A');
        $this->addSql('ALTER TABLE session_subscription DROP CONSTRAINT FK_6D5BD952613FECDF');
        $this->addSql('ALTER TABLE session_subscription DROP CONSTRAINT FK_6D5BD9529A1887DC');
        $this->addSql('ALTER TABLE Student DROP CONSTRAINT FK_789E96AFD9074F50');
        $this->addSql('ALTER TABLE student_studentparent DROP CONSTRAINT FK_6A1D0DD0CB944F1A');
        $this->addSql('ALTER TABLE student_studentparent DROP CONSTRAINT FK_6A1D0DD0EF31C38B');
        $this->addSql('ALTER TABLE Subscription DROP CONSTRAINT FK_BBF7BF2B6E1ECFCD');
        $this->addSql('ALTER TABLE SubscriptionURL DROP CONSTRAINT FK_164D7B569A1887DC');
        $this->addSql('ALTER TABLE SubscriptionURL DROP CONSTRAINT FK_164D7B56CB944F1A');
        $this->addSql('ALTER TABLE TutorSchedule DROP CONSTRAINT FK_C80D49A79F37AE5');
        $this->addSql('ALTER TABLE tutorschedule_center DROP CONSTRAINT FK_12DD1A53F8A8F8B');
        $this->addSql('ALTER TABLE tutorschedule_center DROP CONSTRAINT FK_12DD1A535932F377');
        $this->addSql('ALTER TABLE user_center DROP CONSTRAINT FK_25A2F019A76ED395');
        $this->addSql('ALTER TABLE user_center DROP CONSTRAINT FK_25A2F0195932F377');
        $this->addSql('DROP TABLE Center');
        $this->addSql('DROP TABLE Report');
        $this->addSql('DROP TABLE Session');
        $this->addSql('DROP TABLE session_student');
        $this->addSql('DROP TABLE session_subscription');
        $this->addSql('DROP TABLE Student');
        $this->addSql('DROP TABLE student_studentparent');
        $this->addSql('DROP TABLE StudentParent');
        $this->addSql('DROP TABLE Subscription');
        $this->addSql('DROP TABLE SubscriptionURL');
        $this->addSql('DROP TABLE TutorSchedule');
        $this->addSql('DROP TABLE tutorschedule_center');
        $this->addSql('DROP TABLE users');
        $this->addSql('DROP TABLE user_center');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
