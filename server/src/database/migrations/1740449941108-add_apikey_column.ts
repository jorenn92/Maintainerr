import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApikeyColumn1740449941108 implements MigrationInterface {
    name = 'AddApikeyColumn1740449941108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "temporary_auth_settings" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "authEnabled" boolean NOT NULL DEFAULT (0),
                "username" text,
                "passwordHash" text,
                "apiKey" text
            )
        `);
        await queryRunner.query(`
            INSERT INTO "temporary_auth_settings"("id", "authEnabled", "username", "passwordHash")
            SELECT "id",
                "authEnabled",
                "username",
                "passwordHash"
            FROM "auth_settings"
        `);
        await queryRunner.query(`
            DROP TABLE "auth_settings"
        `);
        await queryRunner.query(`
            ALTER TABLE "temporary_auth_settings"
                RENAME TO "auth_settings"
        `);
        await queryRunner.query(`
            CREATE TABLE "temporary_settings" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "clientId" varchar DEFAULT ('5ddf0869-8bbb-4653-9ce5-52486e398526'),
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
                "tautulli_api_key" varchar
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
                    "tautulli_api_key"
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
                "tautulli_api_key"
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
                "clientId" varchar DEFAULT ('9f9c3b31-42bc-428f-88e6-7f7fd591f596'),
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
                "tautulli_api_key" varchar
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
                    "tautulli_api_key"
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
                "tautulli_api_key"
            FROM "temporary_settings"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_settings"
        `);
        await queryRunner.query(`
            ALTER TABLE "auth_settings"
                RENAME TO "temporary_auth_settings"
        `);
        await queryRunner.query(`
            CREATE TABLE "auth_settings" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "authEnabled" boolean NOT NULL DEFAULT (0),
                "username" text,
                "passwordHash" text
            )
        `);
        await queryRunner.query(`
            INSERT INTO "auth_settings"("id", "authEnabled", "username", "passwordHash")
            SELECT "id",
                "authEnabled",
                "username",
                "passwordHash"
            FROM "temporary_auth_settings"
        `);
        await queryRunner.query(`
            DROP TABLE "temporary_auth_settings"
        `);
    }

}
