export default async () => {
    const t = {
        ["./modules/rules/constants/rules.constants"]: await import("./modules/rules/constants/rules.constants"),
        ["./modules/api/plex-api/enums/plex-data-type-enum"]: await import("./modules/api/plex-api/enums/plex-data-type-enum"),
        ["./modules/rules/dtos/rule.dto"]: await import("./modules/rules/dtos/rule.dto"),
        ["./modules/rules/dtos/exclusion.dto"]: await import("./modules/rules/dtos/exclusion.dto"),
        ["./modules/api/plex-api/interfaces/collection.interface"]: await import("./modules/api/plex-api/interfaces/collection.interface"),
        ["./modules/api/plex-api/dto/basic-response.dto"]: await import("./modules/api/plex-api/dto/basic-response.dto"),
        ["./modules/api/external-api/dto/basic-response.dto"]: await import("./modules/api/external-api/dto/basic-response.dto"),
        ["./modules/collections/entities/collection.entities"]: await import("./modules/collections/entities/collection.entities"),
        ["./modules/collections/entities/collection_media.entities"]: await import("./modules/collections/entities/collection_media.entities"),
        ["../../packages/contracts/dist/index"]: await import("../../packages/contracts/dist/index"),
        ["./modules/rules/entities/community-rule-karma.entities"]: await import("./modules/rules/entities/community-rule-karma.entities"),
        ["./modules/rules/entities/exclusion.entities"]: await import("./modules/rules/entities/exclusion.entities"),
        ["./modules/rules/entities/rules.entities"]: await import("./modules/rules/entities/rules.entities"),
        ["./modules/rules/entities/rule-group.entities"]: await import("./modules/rules/entities/rule-group.entities"),
        ["./modules/rules/dtos/rules.dto"]: await import("./modules/rules/dtos/rules.dto")
    };
    return { "@nestjs/swagger": { "models": [[import("./modules/api/external-api/dto/basic-response.dto"), { "BasicResponseDto": { status: { required: true, type: () => Object }, code: { required: true, type: () => Object }, message: { required: false, type: () => String } } }], [import("./modules/settings/dto's/setting.dto"), { "SettingDto": { id: { required: true, type: () => Number }, clientId: { required: true, type: () => String }, applicationTitle: { required: true, type: () => String }, applicationUrl: { required: true, type: () => String }, apikey: { required: true, type: () => String }, locale: { required: true, type: () => String }, cacheImages: { required: true, type: () => Number }, plex_name: { required: true, type: () => String }, plex_hostname: { required: true, type: () => String }, plex_port: { required: true, type: () => Number }, plex_ssl: { required: true, type: () => Number }, plex_auth_token: { required: true, type: () => String }, overseerr_url: { required: true, type: () => String }, overseerr_api_key: { required: true, type: () => String }, tautulli_url: { required: true, type: () => String }, tautulli_api_key: { required: true, type: () => String }, jellyseerr_url: { required: true, type: () => String }, jellyseerr_api_key: { required: true, type: () => String }, collection_handler_job_cron: { required: true, type: () => String }, rules_handler_job_cron: { required: true, type: () => String } } }], [import("./modules/api/plex-api/dto/basic-response.dto"), { "BasicResponseDto": { status: { required: true, type: () => Object }, code: { required: true, type: () => Object }, message: { required: false, type: () => String } } }], [import("./modules/api/plex-api/dto/collection-hub-settings.dto"), { "CollectionHubSettingsDto": { libraryId: { required: true, type: () => Object }, collectionId: { required: true, type: () => Object }, recommended: { required: true, type: () => Boolean }, ownHome: { required: true, type: () => Boolean }, sharedHome: { required: true, type: () => Boolean } } }], [import("./modules/rules/dtos/rule.dto"), { "RuleDto": { operator: { required: true, nullable: true, enum: t["./modules/rules/constants/rules.constants"].RuleOperators }, action: { required: true, enum: t["./modules/rules/constants/rules.constants"].RulePossibility }, firstVal: { required: true }, lastVal: { required: false }, customVal: { required: false, type: () => ({ ruleTypeId: { required: true, type: () => Number }, value: { required: true, type: () => String } }) }, section: { required: true, type: () => Number } } }], [import("./modules/rules/dtos/ruleDb.dto"), { "RuleDbDto": { id: { required: true, type: () => Number }, ruleJson: { required: true, type: () => String }, section: { required: true, type: () => Number }, ruleGroupId: { required: true, type: () => Number }, isActive: { required: true, type: () => Boolean } } }], [import("./modules/rules/dtos/rules.dto"), { "RulesDto": { id: { required: false, type: () => Number }, libraryId: { required: true, type: () => Number }, name: { required: true, type: () => String }, description: { required: true, type: () => String }, isActive: { required: false, type: () => Boolean }, arrAction: { required: false, type: () => Number }, useRules: { required: false, type: () => Boolean }, collection: { required: false, type: () => Object }, listExclusions: { required: false, type: () => Boolean }, forceOverseerr: { required: false, type: () => Boolean }, rules: { required: true, type: () => Object }, manualCollection: { required: false, type: () => Boolean }, manualCollectionName: { required: false, type: () => String }, dataType: { required: true, enum: t["./modules/api/plex-api/enums/plex-data-type-enum"].EPlexDataType }, tautulliWatchedPercentOverride: { required: false, type: () => Number }, radarrSettingsId: { required: false, type: () => Number }, sonarrSettingsId: { required: false, type: () => Number } } }], [import("./modules/settings/dto's/cron.schedule.dto"), { "CronScheduleDto": { schedule: { required: true, type: () => String } } }], [import("./modules/rules/dtos/communityRule.dto"), { "CommunityRule": { id: { required: false, type: () => Number }, karma: { required: false, type: () => Number }, appVersion: { required: false, type: () => String }, name: { required: true, type: () => String }, description: { required: true, type: () => String }, JsonRules: { required: true, type: () => t["./modules/rules/dtos/rule.dto"].RuleDto } } }], [import("./modules/rules/dtos/exclusion.dto"), { "ExclusionDto": { plexId: { required: true, type: () => Number }, ruleGroupId: { required: false, type: () => Number }, collectionId: { required: false, type: () => Number }, action: { required: false, enum: t["./modules/rules/dtos/exclusion.dto"].ExclusionAction } } }], [import("./modules/api/plex-api/dto/plex-status.dto"), { "PlexStatusDto": { id: { required: true, type: () => String } } }], [import("./modules/api/servarr-api/dto/basic-response.dto"), { "BasicResponseDto": { status: { required: true, type: () => Object }, code: { required: true, type: () => Object }, message: { required: false, type: () => String } } }]], "controllers": [[import("./modules/api/jellyseerr-api/jellyseerr-api.controller"), { "JellyseerrApiController": { "getMovie": { type: Object }, "getShow": { type: Object }, "deleteRequest": { type: Object }, "deleteMedia": { type: Object }, "removeMediaByTmdbId": { type: Object } } }], [import("./modules/api/overseerr-api/overseerr-api.controller"), { "OverseerrApiController": { "getMovie": { type: Object }, "getShow": { type: Object }, "deleteRequest": { type: Object }, "deleteMedia": { type: Object }, "removeMediaByTmdbId": { type: Object } } }], [import("./modules/api/plex-api/plex-api.controller"), { "PlexApiController": { "getStatus": { type: Object }, "getLibraries": { type: [Object] }, "getLibraryContent": {}, "getMetadata": { type: Object }, "getSeenBy": { type: [Object] }, "getUser": { type: [Object] }, "getChildrenMetadata": { type: [Object] }, "getRecentlyAdded": {}, "getCollections": { type: [t["./modules/api/plex-api/interfaces/collection.interface"].PlexCollection] }, "getCollection": { type: t["./modules/api/plex-api/interfaces/collection.interface"].PlexCollection }, "getCollectionChildren": { type: [Object] }, "searchLibrary": { type: [Object] }, "addChildToCollection": { type: Object }, "deleteChildFromCollection": { type: t["./modules/api/plex-api/dto/basic-response.dto"].BasicResponseDto }, "updateCollection": { type: t["./modules/api/plex-api/interfaces/collection.interface"].PlexCollection }, "createCollection": { type: t["./modules/api/plex-api/interfaces/collection.interface"].PlexCollection }, "deleteCollection": { type: t["./modules/api/plex-api/dto/basic-response.dto"].BasicResponseDto }, "UpdateCollectionSettings": { type: Object } } }], [import("./modules/settings/settings.controller"), { "SettingsController": { "getSettings": { type: Object }, "getRadarrSettings": { type: Object }, "getSonarrSettings": { type: Object }, "getVersion": { type: String }, "generateApiKey": { type: String }, "deletePlexApiAuth": { type: t["./modules/api/external-api/dto/basic-response.dto"].BasicResponseDto }, "updateSettings": { type: t["./modules/api/external-api/dto/basic-response.dto"].BasicResponseDto }, "updateAuthToken": {}, "testSetup": { type: Boolean }, "testOverseerr": { type: t["./modules/api/external-api/dto/basic-response.dto"].BasicResponseDto }, "testJellyseerr": { type: t["./modules/api/external-api/dto/basic-response.dto"].BasicResponseDto }, "testRadarr": { type: t["./modules/api/external-api/dto/basic-response.dto"].BasicResponseDto }, "addRadarrSetting": { type: Object }, "updateRadarrSetting": { type: Object }, "deleteRadarrSetting": { type: Object }, "testSonarr": { type: t["./modules/api/external-api/dto/basic-response.dto"].BasicResponseDto }, "addSonarrSetting": { type: Object }, "updateSonarrSetting": { type: Object }, "deleteSonarrSetting": { type: Object }, "testPlex": { type: Object }, "testTautulli": { type: t["./modules/api/external-api/dto/basic-response.dto"].BasicResponseDto }, "getPlexServers": { type: [Object] }, "validateSingleCron": {} } }], [import("./modules/api/tmdb-api/tmdb.controller"), { "TmdbApiController": { "getPerson": { type: Object }, "getMovie": { type: Object }, "getBackdropImage": { type: String }, "getImage": { type: String } } }], [import("./modules/collections/collections.controller"), { "CollectionsController": { "createCollection": {}, "addToCollection": {}, "removeFromCollection": {}, "removeCollection": { type: t["./modules/api/plex-api/dto/basic-response.dto"].BasicResponseDto }, "updateCollection": {}, "handleCollection": {}, "updateSchedule": { type: Object }, "deactivate": { type: Object }, "activate": { type: Object }, "getCollections": {}, "getCollection": { type: t["./modules/collections/entities/collection.entities"].Collection }, "ManualActionOnCollection": { type: t["./modules/collections/entities/collection.entities"].Collection }, "getMediaInCollection": { type: [t["./modules/collections/entities/collection_media.entities"].CollectionMedia] }, "getMediaInCollectionCount": { type: Number }, "getLibraryContent": {}, "getExclusions": {}, "getCollectionLogs": {} } }], [import("./modules/logging/logs.controller"), { "LogsController": { "stream": {}, "getFiles": { type: [Object] }, "getFile": {}, "getLogSettings": {}, "setLogSettings": {} } }], [import("./modules/rules/rules.controller"), { "RulesController": { "getRuleConstants": { type: t["./modules/rules/constants/rules.constants"].RuleConstants }, "updateSchedule": { type: Object }, "getCommunityRules": { type: Object }, "getCommunityRuleCount": { type: Number }, "getCommunityRuleKarmaHistory": { type: [t["./modules/rules/entities/community-rule-karma.entities"].CommunityRuleKarma] }, "getExclusion": { type: [t["./modules/rules/entities/exclusion.entities"].Exclusion] }, "getRuleGroupCount": { type: Number }, "getRules": { type: [t["./modules/rules/entities/rules.entities"].Rules] }, "getRuleGroupByCollectionId": { type: t["./modules/rules/entities/rule-group.entities"].RuleGroup }, "getRuleGroups": { type: [t["./modules/rules/dtos/rules.dto"].RulesDto] }, "deleteRuleGroup": { type: Object }, "executeRules": {}, "setRules": { type: Object }, "setExclusion": { type: Object }, "removeExclusion": { type: Object }, "removeAllExclusion": { type: Object }, "updateRule": { type: Object }, "updateJob": { type: Object }, "updateCommunityRules": { type: Object }, "updateCommunityRuleKarma": { type: Object }, "yamlEncode": { type: Object }, "yamlDecode": { type: Object }, "testRuleGroup": { type: Object } } }], [import("./app/app.controller"), { "AppController": { "getAppStatus": { type: String }, "getAppTimezone": { type: String } } }]] } };
};