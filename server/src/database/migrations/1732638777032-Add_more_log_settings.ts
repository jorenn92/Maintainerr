import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMoreLogSettings1732638777032 implements MigrationInterface {
    name = 'AddMoreLogSettings1732638777032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "temporary_settings" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "clientId" varchar DEFAULT ('3b6a4aa9-15a4-443d-8ad1-0ace2e0f2ceb'),
                "applicationTitle" varchar NOT NULL DEFAULT ('Maintainerr'),
                "applicationUrl" varchar NOT NULL DEFAULT ('localhost'),
                "apikey" varchar,
                "overseerr_url" varchar,
                "locale" varchar NOT NULL DEFAULT ('en'),
                "cacheImages" integer NOT NULL DEFAULT (1),
                "plex_name" varchar,
                "plex_hostname" varchar,
                "plex_port" integer DEFAULT (32400),
                "plex_ssl" integer,
                "plex_auth_token" varchar,
                "overseerr_api_key" varchar,
                "collection_handler_job_cron" varchar NOT NULL DEFAULT ('0 0-23/12 * * *'),
                "rules_handler_job_cron" varchar NOT NULL DEFAULT ('0 0-23/8 * * *'),
                "tautulli_url" varchar,
                "tautulli_api_key" varchar,
                "log_level" varchar,
                "log_max_size" integer,
                "log_max_files" integer
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_settings"(
                    "id",
                    "clientId",
                    "applicationTitle",
                    "applicationUrl",
                    "apikey",
                    "overseerr_url",
                    "locale",
                    "cacheImages",
                    "plex_name",
                    "plex_hostname",
                    "plex_port",
                    "plex_ssl",
                    "plex_auth_token",
                    "overseerr_api_key",
                    "collection_handler_job_cron",
                    "rules_handler_job_cron",
                    "tautulli_url",
                    "tautulli_api_key",
                    "log_level"
                )
            SELECT "id",
                "clientId",
                "applicationTitle",
                "applicationUrl",
                "apikey",
                "overseerr_url",
                "locale",
                "cacheImages",
                "plex_name",
                "plex_hostname",
                "plex_port",
                "plex_ssl",
                "plex_auth_token",
                "overseerr_api_key",
                "collection_handler_job_cron",
                "rules_handler_job_cron",
                "tautulli_url",
                "tautulli_api_key",
                "log_level"
            FROM "settings"
        `);
        await queryRunner.query(`
            DROP TABLE "settings"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_settings"
                RENAME TO "settings"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_settings" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "clientId" varchar DEFAULT ('704f6398-df54-49d4-9702-63eff8cdcfd3'),
                "applicationTitle" varchar NOT NULL DEFAULT ('Maintainerr'),
                "applicationUrl" varchar NOT NULL DEFAULT ('localhost'),
                "apikey" varchar,
                "overseerr_url" varchar,
                "locale" varchar NOT NULL DEFAULT ('en'),
                "cacheImages" integer NOT NULL DEFAULT (1),
                "plex_name" varchar,
                "plex_hostname" varchar,
                "plex_port" integer DEFAULT (32400),
                "plex_ssl" integer,
                "plex_auth_token" varchar,
                "overseerr_api_key" varchar,
                "collection_handler_job_cron" varchar NOT NULL DEFAULT ('0 0-23/12 * * *'),
                "rules_handler_job_cron" varchar NOT NULL DEFAULT ('0 0-23/8 * * *'),
                "tautulli_url" varchar,
                "tautulli_api_key" varchar,
                "log_level" varchar,
                "log_max_size" integer,
                "log_max_files" integer
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_settings"(
                    "id",
                    "clientId",
                    "applicationTitle",
                    "applicationUrl",
                    "apikey",
                    "overseerr_url",
                    "locale",
                    "cacheImages",
                    "plex_name",
                    "plex_hostname",
                    "plex_port",
                    "plex_ssl",
                    "plex_auth_token",
                    "overseerr_api_key",
                    "collection_handler_job_cron",
                    "rules_handler_job_cron",
                    "tautulli_url",
                    "tautulli_api_key",
                    "log_level",
                    "log_max_size",
                    "log_max_files"
                )
            SELECT "id",
                "clientId",
                "applicationTitle",
                "applicationUrl",
                "apikey",
                "overseerr_url",
                "locale",
                "cacheImages",
                "plex_name",
                "plex_hostname",
                "plex_port",
                "plex_ssl",
                "plex_auth_token",
                "overseerr_api_key",
                "collection_handler_job_cron",
                "rules_handler_job_cron",
                "tautulli_url",
                "tautulli_api_key",
                "log_level",
                "log_max_size",
                "log_max_files"
            FROM "settings"
        `);
        await queryRunner.query(`
            DROP TABLE "settings"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_settings"
                RENAME TO "settings"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settings"
                RENAME TO "temporary_settings"
        `);
        await queryRunner.query(`
            CREATE TABLE "settings" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "clientId" varchar DEFAULT ('3b6a4aa9-15a4-443d-8ad1-0ace2e0f2ceb'),
                "applicationTitle" varchar NOT NULL DEFAULT ('Maintainerr'),
                "applicationUrl" varchar NOT NULL DEFAULT ('localhost'),
                "apikey" varchar,
                "overseerr_url" varchar,
                "locale" varchar NOT NULL DEFAULT ('en'),
                "cacheImages" integer NOT NULL DEFAULT (1),
                "plex_name" varchar,
                "plex_hostname" varchar,
                "plex_port" integer DEFAULT (32400),
                "plex_ssl" integer,
                "plex_auth_token" varchar,
                "overseerr_api_key" varchar,
                "collection_handler_job_cron" varchar NOT NULL DEFAULT ('0 0-23/12 * * *'),
                "rules_handler_job_cron" varchar NOT NULL DEFAULT ('0 0-23/8 * * *'),
                "tautulli_url" varchar,
                "tautulli_api_key" varchar,
                "log_level" varchar,
                "log_max_size" integer,
                "log_max_files" integer
            )
        `);
        await queryRunner.query(`
            INSERT INTO "settings"(
                    "id",
                    "clientId",
                    "applicationTitle",
                    "applicationUrl",
                    "apikey",
                    "overseerr_url",
                    "locale",
                    "cacheImages",
                    "plex_name",
                    "plex_hostname",
                    "plex_port",
                    "plex_ssl",
                    "plex_auth_token",
                    "overseerr_api_key",
                    "collection_handler_job_cron",
                    "rules_handler_job_cron",
                    "tautulli_url",
                    "tautulli_api_key",
                    "log_level",
                    "log_max_size",
                    "log_max_files"
                )
            SELECT "id",
                "clientId",
                "applicationTitle",
                "applicationUrl",
                "apikey",
                "overseerr_url",
                "locale",
                "cacheImages",
                "plex_name",
                "plex_hostname",
                "plex_port",
                "plex_ssl",
                "plex_auth_token",
                "overseerr_api_key",
                "collection_handler_job_cron",
                "rules_handler_job_cron",
                "tautulli_url",
                "tautulli_api_key",
                "log_level",
                "log_max_size",
                "log_max_files"
            FROM "temporary_settings"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_settings"
        `);
        await queryRunner.query(`
            ALTER TABLE "settings"
                RENAME TO "temporary_settings"
        `);
        await queryRunner.query(`
            CREATE TABLE "settings" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "clientId" varchar DEFAULT ('3b6a4aa9-15a4-443d-8ad1-0ace2e0f2ceb'),
                "applicationTitle" varchar NOT NULL DEFAULT ('Maintainerr'),
                "applicationUrl" varchar NOT NULL DEFAULT ('localhost'),
                "apikey" varchar,
                "overseerr_url" varchar,
                "locale" varchar NOT NULL DEFAULT ('en'),
                "cacheImages" integer NOT NULL DEFAULT (1),
                "plex_name" varchar,
                "plex_hostname" varchar,
                "plex_port" integer DEFAULT (32400),
                "plex_ssl" integer,
                "plex_auth_token" varchar,
                "overseerr_api_key" varchar,
                "collection_handler_job_cron" varchar NOT NULL DEFAULT ('0 0-23/12 * * *'),
                "rules_handler_job_cron" varchar NOT NULL DEFAULT ('0 0-23/8 * * *'),
                "tautulli_url" varchar,
                "tautulli_api_key" varchar,
                "log_level" varchar
            )
        `);
        await queryRunner.query(`
            INSERT INTO "settings"(
                    "id",
                    "clientId",
                    "applicationTitle",
                    "applicationUrl",
                    "apikey",
                    "overseerr_url",
                    "locale",
                    "cacheImages",
                    "plex_name",
                    "plex_hostname",
                    "plex_port",
                    "plex_ssl",
                    "plex_auth_token",
                    "overseerr_api_key",
                    "collection_handler_job_cron",
                    "rules_handler_job_cron",
                    "tautulli_url",
                    "tautulli_api_key",
                    "log_level"
                )
            SELECT "id",
                "clientId",
                "applicationTitle",
                "applicationUrl",
                "apikey",
                "overseerr_url",
                "locale",
                "cacheImages",
                "plex_name",
                "plex_hostname",
                "plex_port",
                "plex_ssl",
                "plex_auth_token",
                "overseerr_api_key",
                "collection_handler_job_cron",
                "rules_handler_job_cron",
                "tautulli_url",
                "tautulli_api_key",
                "log_level"
            FROM "temporary_settings"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_settings"
        `);
    }

}
