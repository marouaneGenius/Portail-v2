--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: notify_messenger_messages(); Type: FUNCTION; Schema: public; Owner: symfony
--

CREATE FUNCTION public.notify_messenger_messages() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
            BEGIN
                PERFORM pg_notify('messenger_messages', NEW.queue_name::text);
                RETURN NEW;
            END;
        $$;


ALTER FUNCTION public.notify_messenger_messages() OWNER TO symfony;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: center; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.center (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    phone character varying(255) DEFAULT NULL::character varying,
    email character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.center OWNER TO symfony;

--
-- Name: center_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.center_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.center_id_seq OWNER TO symfony;

--
-- Name: doctrine_migration_versions; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.doctrine_migration_versions (
    version character varying(191) NOT NULL,
    executed_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    execution_time integer
);


ALTER TABLE public.doctrine_migration_versions OWNER TO symfony;

--
-- Name: messenger_messages; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.messenger_messages (
    id bigint NOT NULL,
    body text NOT NULL,
    headers text NOT NULL,
    queue_name character varying(190) NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    available_at timestamp(0) without time zone NOT NULL,
    delivered_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.messenger_messages OWNER TO symfony;

--
-- Name: messenger_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.messenger_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messenger_messages_id_seq OWNER TO symfony;

--
-- Name: messenger_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: symfony
--

ALTER SEQUENCE public.messenger_messages_id_seq OWNED BY public.messenger_messages.id;


--
-- Name: report; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.report (
    id integer NOT NULL,
    id_student_id integer,
    id_user_id integer,
    id_session_id integer,
    skills_assessment json NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    created_by integer NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    updated_by integer
);


ALTER TABLE public.report OWNER TO symfony;

--
-- Name: COLUMN report.created_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.report.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN report.updated_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.report.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: report_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_id_seq OWNER TO symfony;

--
-- Name: session; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.session (
    id integer NOT NULL,
    id_tutor_id integer,
    payment_date date NOT NULL,
    stripe_number character varying(255) DEFAULT NULL::character varying,
    school_subjects json,
    date_slot date NOT NULL,
    resume character varying(255) DEFAULT NULL::character varying,
    scheduled_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    scheduled_by character varying(255) DEFAULT NULL::character varying,
    session_type character varying(255) DEFAULT NULL::character varying,
    is_canceled boolean NOT NULL,
    canceled_by integer,
    is_paid boolean,
    is_absent boolean,
    absent_by character varying(255) DEFAULT NULL::character varying,
    created_at timestamp(0) without time zone NOT NULL,
    created_by character varying(255) NOT NULL,
    updated_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    updated_by character varying(255) NOT NULL,
    center_id integer
);


ALTER TABLE public.session OWNER TO symfony;

--
-- Name: COLUMN session.scheduled_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.session.scheduled_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN session.created_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.session.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN session.updated_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.session.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: session_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.session_id_seq OWNER TO symfony;

--
-- Name: session_student; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.session_student (
    session_id integer NOT NULL,
    student_id integer NOT NULL
);


ALTER TABLE public.session_student OWNER TO symfony;

--
-- Name: session_subscription; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.session_subscription (
    session_id integer NOT NULL,
    subscription_id integer NOT NULL
);


ALTER TABLE public.session_subscription OWNER TO symfony;

--
-- Name: student; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.student (
    id integer NOT NULL,
    id_center_id integer,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    gender character varying(255) NOT NULL,
    class character varying(255) NOT NULL,
    phone character varying(255) DEFAULT NULL::character varying,
    email character varying(255) NOT NULL,
    is_active boolean NOT NULL,
    is_deleted boolean NOT NULL,
    stripe_key character varying(255) DEFAULT NULL::character varying,
    url_notion_public character varying(255) DEFAULT NULL::character varying,
    url_notion character varying(255) DEFAULT NULL::character varying,
    id_pipedrive character varying(255) DEFAULT NULL::character varying,
    id_sinao character varying(255) DEFAULT NULL::character varying,
    created_at timestamp(0) without time zone NOT NULL,
    created_by character varying(255) DEFAULT NULL::character varying,
    updated_by character varying(255) DEFAULT NULL::character varying,
    updated_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    school_subjects json
);


ALTER TABLE public.student OWNER TO symfony;

--
-- Name: COLUMN student.created_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.student.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN student.updated_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.student.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: student_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.student_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_id_seq OWNER TO symfony;

--
-- Name: student_studentparent; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.student_studentparent (
    student_id integer NOT NULL,
    studentparent_id integer NOT NULL
);


ALTER TABLE public.student_studentparent OWNER TO symfony;

--
-- Name: studentparent; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.studentparent (
    id integer NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    gender character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    address character varying(255) NOT NULL,
    zip_code character varying(255) DEFAULT NULL::character varying,
    city character varying(255) DEFAULT NULL::character varying,
    created_at timestamp(0) without time zone NOT NULL,
    created_by character varying(255) DEFAULT NULL::character varying,
    updated_by character varying(255) DEFAULT NULL::character varying,
    updated_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone
);


ALTER TABLE public.studentparent OWNER TO symfony;

--
-- Name: COLUMN studentparent.created_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.studentparent.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN studentparent.updated_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.studentparent.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: studentparent_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.studentparent_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.studentparent_id_seq OWNER TO symfony;

--
-- Name: subscription; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.subscription (
    id integer NOT NULL,
    id_student_id integer,
    created_at timestamp(0) without time zone NOT NULL,
    created_by character varying(255) DEFAULT NULL::character varying,
    updated_by character varying(255) DEFAULT NULL::character varying,
    updated_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    subscription_end_date timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    first_debit_date timestamp(0) without time zone,
    recurrent_debit_date character varying(255) DEFAULT NULL::timestamp without time zone,
    installment_count integer,
    session_per_week integer,
    week_count integer,
    selected_weeks json,
    known_weeks character varying(255) DEFAULT NULL::character varying,
    session_schedule json,
    discount integer,
    school_subjects json,
    offer_type character varying(255) NOT NULL,
    offer_amount integer,
    membership_fee double precision,
    combined_id character varying(255),
    subscription_type character varying(255) NOT NULL,
    is_valide boolean NOT NULL,
    subscription_start_date timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    payment_mode character varying(255) DEFAULT NULL::character varying,
    date_caution date,
    caution boolean,
    favorite_slots json,
    is_programmed boolean,
    programed_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    programed_by character varying(255) DEFAULT NULL::character varying,
    is_canceled boolean,
    canceled_by character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.subscription OWNER TO symfony;

--
-- Name: COLUMN subscription.created_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.subscription.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN subscription.updated_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.subscription.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN subscription.programed_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.subscription.programed_at IS '(DC2Type:datetime_immutable)';


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscription_id_seq OWNER TO symfony;

--
-- Name: subscriptionurl; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.subscriptionurl (
    id integer NOT NULL,
    student_id integer,
    subscription_id integer,
    url character varying(255) NOT NULL,
    is_combined boolean
);


ALTER TABLE public.subscriptionurl OWNER TO symfony;

--
-- Name: subscriptionurl_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.subscriptionurl_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscriptionurl_id_seq OWNER TO symfony;

--
-- Name: tutorschedule; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.tutorschedule (
    id integer NOT NULL,
    id_user_id integer,
    day character varying(20) NOT NULL,
    start_hour time(0) without time zone NOT NULL,
    end_hour time(0) without time zone NOT NULL
);


ALTER TABLE public.tutorschedule OWNER TO symfony;

--
-- Name: COLUMN tutorschedule.start_hour; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.tutorschedule.start_hour IS '(DC2Type:time_immutable)';


--
-- Name: COLUMN tutorschedule.end_hour; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.tutorschedule.end_hour IS '(DC2Type:time_immutable)';


--
-- Name: tutorschedule_center; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.tutorschedule_center (
    tutorschedule_id integer NOT NULL,
    center_id integer NOT NULL
);


ALTER TABLE public.tutorschedule_center OWNER TO symfony;

--
-- Name: tutorschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.tutorschedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tutorschedule_id_seq OWNER TO symfony;

--
-- Name: user_center; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.user_center (
    user_id integer NOT NULL,
    center_id integer NOT NULL
);


ALTER TABLE public.user_center OWNER TO symfony;

--
-- Name: users; Type: TABLE; Schema: public; Owner: symfony
--

CREATE TABLE public.users (
    id integer NOT NULL,
    firstname character varying(255) DEFAULT NULL::character varying,
    lastname character varying(255) DEFAULT NULL::character varying,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    siret character varying(255) DEFAULT NULL::character varying,
    is_active boolean NOT NULL,
    is_deleted boolean NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    created_by character varying(255) DEFAULT NULL::character varying,
    updated_by character varying(255) DEFAULT NULL::character varying,
    updated_at timestamp(0) without time zone DEFAULT NULL::timestamp without time zone,
    max_session integer,
    price_per_hour character varying(255) DEFAULT NULL::character varying,
    roles json NOT NULL,
    google_id character varying(255) DEFAULT NULL::character varying,
    school_subjects json,
    class json
);


ALTER TABLE public.users OWNER TO symfony;

--
-- Name: COLUMN users.created_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.users.created_at IS '(DC2Type:datetime_immutable)';


--
-- Name: COLUMN users.updated_at; Type: COMMENT; Schema: public; Owner: symfony
--

COMMENT ON COLUMN public.users.updated_at IS '(DC2Type:datetime_immutable)';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: symfony
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO symfony;

--
-- Name: messenger_messages id; Type: DEFAULT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.messenger_messages ALTER COLUMN id SET DEFAULT nextval('public.messenger_messages_id_seq'::regclass);


--
-- Name: users User_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: center center_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.center
    ADD CONSTRAINT center_pkey PRIMARY KEY (id);


--
-- Name: doctrine_migration_versions doctrine_migration_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.doctrine_migration_versions
    ADD CONSTRAINT doctrine_migration_versions_pkey PRIMARY KEY (version);


--
-- Name: messenger_messages messenger_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.messenger_messages
    ADD CONSTRAINT messenger_messages_pkey PRIMARY KEY (id);


--
-- Name: report report_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session_student session_student_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.session_student
    ADD CONSTRAINT session_student_pkey PRIMARY KEY (session_id, student_id);


--
-- Name: session_subscription session_subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.session_subscription
    ADD CONSTRAINT session_subscription_pkey PRIMARY KEY (session_id, subscription_id);


--
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (id);


--
-- Name: student_studentparent student_studentparent_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.student_studentparent
    ADD CONSTRAINT student_studentparent_pkey PRIMARY KEY (student_id, studentparent_id);


--
-- Name: studentparent studentparent_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.studentparent
    ADD CONSTRAINT studentparent_pkey PRIMARY KEY (id);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);


--
-- Name: subscriptionurl subscriptionurl_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.subscriptionurl
    ADD CONSTRAINT subscriptionurl_pkey PRIMARY KEY (id);


--
-- Name: tutorschedule_center tutorschedule_center_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.tutorschedule_center
    ADD CONSTRAINT tutorschedule_center_pkey PRIMARY KEY (tutorschedule_id, center_id);


--
-- Name: tutorschedule tutorschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.tutorschedule
    ADD CONSTRAINT tutorschedule_pkey PRIMARY KEY (id);


--
-- Name: user_center user_center_pkey; Type: CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.user_center
    ADD CONSTRAINT user_center_pkey PRIMARY KEY (user_id, center_id);


--
-- Name: idx_12dd1a535932f377; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_12dd1a535932f377 ON public.tutorschedule_center USING btree (center_id);


--
-- Name: idx_12dd1a53f8a8f8b; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_12dd1a53f8a8f8b ON public.tutorschedule_center USING btree (tutorschedule_id);


--
-- Name: idx_164d7b569a1887dc; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_164d7b569a1887dc ON public.subscriptionurl USING btree (subscription_id);


--
-- Name: idx_164d7b56cb944f1a; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_164d7b56cb944f1a ON public.subscriptionurl USING btree (student_id);


--
-- Name: idx_1ff9ec485932f377; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_1ff9ec485932f377 ON public.session USING btree (center_id);


--
-- Name: idx_1ff9ec4870548864; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_1ff9ec4870548864 ON public.session USING btree (id_tutor_id);


--
-- Name: idx_25a2f0195932f377; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_25a2f0195932f377 ON public.user_center USING btree (center_id);


--
-- Name: idx_25a2f019a76ed395; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_25a2f019a76ed395 ON public.user_center USING btree (user_id);


--
-- Name: idx_6a1d0dd0cb944f1a; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_6a1d0dd0cb944f1a ON public.student_studentparent USING btree (student_id);


--
-- Name: idx_6a1d0dd0ef31c38b; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_6a1d0dd0ef31c38b ON public.student_studentparent USING btree (studentparent_id);


--
-- Name: idx_6d5bd952613fecdf; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_6d5bd952613fecdf ON public.session_subscription USING btree (session_id);


--
-- Name: idx_6d5bd9529a1887dc; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_6d5bd9529a1887dc ON public.session_subscription USING btree (subscription_id);


--
-- Name: idx_75ea56e016ba31db; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_75ea56e016ba31db ON public.messenger_messages USING btree (delivered_at);


--
-- Name: idx_75ea56e0e3bd61ce; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_75ea56e0e3bd61ce ON public.messenger_messages USING btree (available_at);


--
-- Name: idx_75ea56e0fb7336f0; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_75ea56e0fb7336f0 ON public.messenger_messages USING btree (queue_name);


--
-- Name: idx_789e96afd9074f50; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_789e96afd9074f50 ON public.student USING btree (id_center_id);


--
-- Name: idx_a5fb2d69613fecdf; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_a5fb2d69613fecdf ON public.session_student USING btree (session_id);


--
-- Name: idx_a5fb2d69cb944f1a; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_a5fb2d69cb944f1a ON public.session_student USING btree (student_id);


--
-- Name: idx_bbf7bf2b6e1ecfcd; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_bbf7bf2b6e1ecfcd ON public.subscription USING btree (id_student_id);


--
-- Name: idx_c38372b26e1ecfcd; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_c38372b26e1ecfcd ON public.report USING btree (id_student_id);


--
-- Name: idx_c38372b279f37ae5; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_c38372b279f37ae5 ON public.report USING btree (id_user_id);


--
-- Name: idx_c38372b2c4b56c08; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_c38372b2c4b56c08 ON public.report USING btree (id_session_id);


--
-- Name: idx_c80d49a79f37ae5; Type: INDEX; Schema: public; Owner: symfony
--

CREATE INDEX idx_c80d49a79f37ae5 ON public.tutorschedule USING btree (id_user_id);


--
-- Name: messenger_messages notify_trigger; Type: TRIGGER; Schema: public; Owner: symfony
--

CREATE TRIGGER notify_trigger AFTER INSERT OR UPDATE ON public.messenger_messages FOR EACH ROW EXECUTE FUNCTION public.notify_messenger_messages();


--
-- Name: tutorschedule_center fk_12dd1a535932f377; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.tutorschedule_center
    ADD CONSTRAINT fk_12dd1a535932f377 FOREIGN KEY (center_id) REFERENCES public.center(id) ON DELETE CASCADE;


--
-- Name: tutorschedule_center fk_12dd1a53f8a8f8b; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.tutorschedule_center
    ADD CONSTRAINT fk_12dd1a53f8a8f8b FOREIGN KEY (tutorschedule_id) REFERENCES public.tutorschedule(id) ON DELETE CASCADE;


--
-- Name: subscriptionurl fk_164d7b569a1887dc; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.subscriptionurl
    ADD CONSTRAINT fk_164d7b569a1887dc FOREIGN KEY (subscription_id) REFERENCES public.subscription(id);


--
-- Name: subscriptionurl fk_164d7b56cb944f1a; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.subscriptionurl
    ADD CONSTRAINT fk_164d7b56cb944f1a FOREIGN KEY (student_id) REFERENCES public.student(id);


--
-- Name: session fk_1ff9ec485932f377; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT fk_1ff9ec485932f377 FOREIGN KEY (center_id) REFERENCES public.center(id);


--
-- Name: session fk_1ff9ec4870548864; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT fk_1ff9ec4870548864 FOREIGN KEY (id_tutor_id) REFERENCES public.users(id);


--
-- Name: user_center fk_25a2f0195932f377; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.user_center
    ADD CONSTRAINT fk_25a2f0195932f377 FOREIGN KEY (center_id) REFERENCES public.center(id) ON DELETE CASCADE;


--
-- Name: user_center fk_25a2f019a76ed395; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.user_center
    ADD CONSTRAINT fk_25a2f019a76ed395 FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: student_studentparent fk_6a1d0dd0cb944f1a; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.student_studentparent
    ADD CONSTRAINT fk_6a1d0dd0cb944f1a FOREIGN KEY (student_id) REFERENCES public.student(id) ON DELETE CASCADE;


--
-- Name: student_studentparent fk_6a1d0dd0ef31c38b; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.student_studentparent
    ADD CONSTRAINT fk_6a1d0dd0ef31c38b FOREIGN KEY (studentparent_id) REFERENCES public.studentparent(id) ON DELETE CASCADE;


--
-- Name: session_subscription fk_6d5bd952613fecdf; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.session_subscription
    ADD CONSTRAINT fk_6d5bd952613fecdf FOREIGN KEY (session_id) REFERENCES public.session(id) ON DELETE CASCADE;


--
-- Name: session_subscription fk_6d5bd9529a1887dc; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.session_subscription
    ADD CONSTRAINT fk_6d5bd9529a1887dc FOREIGN KEY (subscription_id) REFERENCES public.subscription(id) ON DELETE CASCADE;


--
-- Name: student fk_789e96afd9074f50; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT fk_789e96afd9074f50 FOREIGN KEY (id_center_id) REFERENCES public.center(id);


--
-- Name: session_student fk_a5fb2d69613fecdf; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.session_student
    ADD CONSTRAINT fk_a5fb2d69613fecdf FOREIGN KEY (session_id) REFERENCES public.session(id) ON DELETE CASCADE;


--
-- Name: session_student fk_a5fb2d69cb944f1a; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.session_student
    ADD CONSTRAINT fk_a5fb2d69cb944f1a FOREIGN KEY (student_id) REFERENCES public.student(id) ON DELETE CASCADE;


--
-- Name: subscription fk_bbf7bf2b6e1ecfcd; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.subscription
    ADD CONSTRAINT fk_bbf7bf2b6e1ecfcd FOREIGN KEY (id_student_id) REFERENCES public.student(id);


--
-- Name: report fk_c38372b26e1ecfcd; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT fk_c38372b26e1ecfcd FOREIGN KEY (id_student_id) REFERENCES public.student(id);


--
-- Name: report fk_c38372b279f37ae5; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT fk_c38372b279f37ae5 FOREIGN KEY (id_user_id) REFERENCES public.users(id);


--
-- Name: report fk_c38372b2c4b56c08; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT fk_c38372b2c4b56c08 FOREIGN KEY (id_session_id) REFERENCES public.session(id);


--
-- Name: tutorschedule fk_c80d49a79f37ae5; Type: FK CONSTRAINT; Schema: public; Owner: symfony
--

ALTER TABLE ONLY public.tutorschedule
    ADD CONSTRAINT fk_c80d49a79f37ae5 FOREIGN KEY (id_user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--
