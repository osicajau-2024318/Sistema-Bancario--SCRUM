CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    migration_id character varying(150) NOT NULL,
    product_version character varying(32) NOT NULL,
    CONSTRAINT pk___ef_migrations_history PRIMARY KEY (migration_id)
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE TABLE role (
        id character varying(16) NOT NULL,
        name character varying(100) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_role PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE TABLE "user" (
        id character varying(16) NOT NULL,
        name character varying(25) NOT NULL,
        surname character varying(25) NOT NULL,
        username character varying(25) NOT NULL,
        email character varying(150) NOT NULL,
        password character varying(255) NOT NULL,
        status boolean NOT NULL DEFAULT FALSE,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_user PRIMARY KEY (id)
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE TABLE user_email (
        id character varying(16) NOT NULL,
        user_id character varying(16) NOT NULL,
        email_verified boolean NOT NULL DEFAULT FALSE,
        email_verification_token character varying(256),
        email_verification_token_expiry timestamp with time zone,
        CONSTRAINT pk_user_email PRIMARY KEY (id),
        CONSTRAINT fk_user_email_user_user_id FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE TABLE user_password_reset (
        id character varying(16) NOT NULL,
        user_id character varying(16) NOT NULL,
        password_reset_token character varying(256),
        password_reset_token_expiry timestamp with time zone,
        CONSTRAINT pk_user_password_reset PRIMARY KEY (id),
        CONSTRAINT fk_user_password_reset_user_user_id FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE TABLE user_profile (
        id character varying(16) NOT NULL,
        user_id character varying(16) NOT NULL,
        profile_picture character varying(512) NOT NULL DEFAULT '',
        phone character varying(8) NOT NULL,
        address character varying(100) NOT NULL,
        dpi character varying(13) NOT NULL,
        work_name character varying(50) NOT NULL,
        monthly_income numeric NOT NULL,
        CONSTRAINT pk_user_profile PRIMARY KEY (id),
        CONSTRAINT fk_user_profile_user_user_id FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE TABLE user_role (
        id character varying(16) NOT NULL,
        user_id character varying(16) NOT NULL,
        role_id character varying(16) NOT NULL,
        created_at timestamp with time zone NOT NULL,
        updated_at timestamp with time zone NOT NULL,
        CONSTRAINT pk_user_role PRIMARY KEY (id),
        CONSTRAINT fk_user_role_role_role_id FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_role_user_user_id FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE UNIQUE INDEX ix_user_email ON "user" (email);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE UNIQUE INDEX ix_user_username ON "user" (username);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE UNIQUE INDEX ix_user_email_user_id ON user_email (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE UNIQUE INDEX ix_user_password_reset_user_id ON user_password_reset (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE UNIQUE INDEX ix_user_profile_user_id ON user_profile (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE INDEX ix_user_role_role_id ON user_role (role_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    CREATE INDEX ix_user_role_user_id ON user_role (user_id);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "migration_id" = '20260228075541_AddNewFieldsToUserProfile') THEN
    INSERT INTO "__EFMigrationsHistory" (migration_id, product_version)
    VALUES ('20260228075541_AddNewFieldsToUserProfile', '8.0.0');
    END IF;
END $EF$;
COMMIT;

