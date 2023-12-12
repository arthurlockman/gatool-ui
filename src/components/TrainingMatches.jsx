import moment from "moment"; 

const trainingSchedule = {};
trainingSchedule.qual = {};
trainingSchedule.playoff = {};
const trainingScores = {};
trainingScores.playoff = {};
const trainingTeams = {};
const trainingRanks = {};
const trainingAlliances = {};
const trainingEvents = {};

trainingSchedule.qual.final = {
    "Schedule": [
        {
            "description": "Qualification 1",
            "level": "Qualification",
            "startTime": "2024-02-18T08:40:00",
            "matchNumber": 1,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 246,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 509,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 47,
            "scoreRedFoul": 0,
            "scoreRedAuto": 10,
            "scoreBlueFinal": 54,
            "scoreBlueFoul": 15,
            "scoreBlueAuto": 11,
            "autoStartTime": "2024-02-18T09:00:19.763",
            "actualStartTime": "2024-02-18T09:00:19.763",
            "postResultTime": "2024-02-18T09:03:51.97"
        },
        {
            "description": "Qualification 2",
            "level": "Qualification",
            "startTime": "2024-02-18T08:48:00",
            "matchNumber": 2,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 501,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 49,
            "scoreRedFoul": 0,
            "scoreRedAuto": 8,
            "scoreBlueFinal": 27,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 0,
            "autoStartTime": "2024-02-18T09:09:19.997",
            "actualStartTime": "2024-02-18T09:09:19.997",
            "postResultTime": "2024-02-18T09:12:38.38"
        },
        {
            "description": "Qualification 3",
            "level": "Qualification",
            "startTime": "2024-02-18T08:56:00",
            "matchNumber": 3,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9999,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1729,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 77,
            "scoreRedFoul": 22,
            "scoreRedAuto": 3,
            "scoreBlueFinal": 71,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 12,
            "autoStartTime": "2024-02-18T09:20:33.153",
            "actualStartTime": "2024-02-18T09:20:33.153",
            "postResultTime": "2024-02-18T09:23:37.63"
        },
        {
            "description": "Qualification 4",
            "level": "Qualification",
            "startTime": "2024-02-18T09:04:00",
            "matchNumber": 4,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 58,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 172,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9996,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9997,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 20,
            "scoreRedFoul": 0,
            "scoreRedAuto": 6,
            "scoreBlueFinal": 60,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 21,
            "autoStartTime": "2024-02-18T09:33:19.947",
            "actualStartTime": "2024-02-18T09:33:19.947",
            "postResultTime": "2024-02-18T09:38:11.74"
        },
        {
            "description": "Qualification 5",
            "level": "Qualification",
            "startTime": "2024-02-18T09:12:00",
            "matchNumber": 5,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 238,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1721,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 42,
            "scoreRedFoul": 15,
            "scoreRedAuto": 3,
            "scoreBlueFinal": 75,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 30,
            "autoStartTime": "2024-02-18T09:46:08.13",
            "actualStartTime": "2024-02-18T09:46:08.13",
            "postResultTime": "2024-02-18T09:49:53.033"
        },
        {
            "description": "Qualification 6",
            "level": "Qualification",
            "startTime": "2024-02-18T09:20:00",
            "matchNumber": 6,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 4905,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1729,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 39,
            "scoreRedFoul": 0,
            "scoreRedAuto": 13,
            "scoreBlueFinal": 48,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 3,
            "autoStartTime": "2024-02-18T09:55:12.317",
            "actualStartTime": "2024-02-18T09:55:12.317",
            "postResultTime": "2024-02-18T09:58:23.383"
        },
        {
            "description": "Qualification 7",
            "level": "Qualification",
            "startTime": "2024-02-18T09:28:00",
            "matchNumber": 7,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9995,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 501,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9999,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9996,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 246,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 50,
            "scoreRedFoul": 0,
            "scoreRedAuto": 0,
            "scoreBlueFinal": 36,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 3,
            "autoStartTime": "2024-02-18T10:06:14.35",
            "actualStartTime": "2024-02-18T10:06:14.35",
            "postResultTime": "2024-02-18T10:09:11.45"
        },
        {
            "description": "Qualification 8",
            "level": "Qualification",
            "startTime": "2024-02-18T09:36:00",
            "matchNumber": 8,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 2423,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 172,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 53,
            "scoreRedFoul": 0,
            "scoreRedAuto": 10,
            "scoreBlueFinal": 87,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 21,
            "autoStartTime": "2024-02-18T10:14:36.097",
            "actualStartTime": "2024-02-18T10:14:36.097",
            "postResultTime": "2024-02-18T10:17:30.183"
        },
        {
            "description": "Qualification 9",
            "level": "Qualification",
            "startTime": "2024-02-18T09:44:00",
            "matchNumber": 9,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 1721,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 22,
            "scoreRedFoul": 5,
            "scoreRedAuto": 3,
            "scoreBlueFinal": 55,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 15,
            "autoStartTime": "2024-02-18T10:21:50.17",
            "actualStartTime": "2024-02-18T10:21:50.17",
            "postResultTime": "2024-02-18T10:25:12.093"
        },
        {
            "description": "Qualification 10",
            "level": "Qualification",
            "startTime": "2024-02-18T09:52:00",
            "matchNumber": 10,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 238,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 509,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9997,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 65,
            "scoreRedFoul": 0,
            "scoreRedAuto": 12,
            "scoreBlueFinal": 38,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T10:32:54.977",
            "actualStartTime": "2024-02-18T10:32:54.977",
            "postResultTime": "2024-02-18T10:35:53.643"
        },
        {
            "description": "Qualification 11",
            "level": "Qualification",
            "startTime": "2024-02-18T10:00:00",
            "matchNumber": 11,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 811,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1729,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 246,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 72,
            "scoreRedFoul": 0,
            "scoreRedAuto": 9,
            "scoreBlueFinal": 30,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 7,
            "autoStartTime": "2024-02-18T10:42:23.343",
            "actualStartTime": "2024-02-18T10:42:23.343",
            "postResultTime": "2024-02-18T10:45:32.54"
        },
        {
            "description": "Qualification 12",
            "level": "Qualification",
            "startTime": "2024-02-18T10:08:00",
            "matchNumber": 12,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9998,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9999,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 37,
            "scoreRedFoul": 0,
            "scoreRedAuto": 15,
            "scoreBlueFinal": 89,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 19,
            "autoStartTime": "2024-02-18T10:49:51.207",
            "actualStartTime": "2024-02-18T10:49:51.207",
            "postResultTime": "2024-02-18T10:53:10.59"
        },
        {
            "description": "Qualification 13",
            "level": "Qualification",
            "startTime": "2024-02-18T10:16:00",
            "matchNumber": 13,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 509,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 501,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 172,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1721,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 39,
            "scoreRedFoul": 10,
            "scoreRedAuto": 9,
            "scoreBlueFinal": 56,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 12,
            "autoStartTime": "2024-02-18T10:59:57.627",
            "actualStartTime": "2024-02-18T10:59:57.627",
            "postResultTime": "2024-02-18T11:03:43.653"
        },
        {
            "description": "Qualification 14",
            "level": "Qualification",
            "startTime": "2024-02-18T10:24:00",
            "matchNumber": 14,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9996,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 238,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 39,
            "scoreRedFoul": 5,
            "scoreRedAuto": 9,
            "scoreBlueFinal": 45,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 3,
            "autoStartTime": "2024-02-18T11:08:49.24",
            "actualStartTime": "2024-02-18T11:08:49.24",
            "postResultTime": "2024-02-18T11:11:48.237"
        },
        {
            "description": "Qualification 15",
            "level": "Qualification",
            "startTime": "2024-02-18T10:32:00",
            "matchNumber": 15,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9997,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 60,
            "scoreRedFoul": 0,
            "scoreRedAuto": 10,
            "scoreBlueFinal": 84,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 12,
            "autoStartTime": "2024-02-18T11:19:33.533",
            "actualStartTime": "2024-02-18T11:19:33.533",
            "postResultTime": "2024-02-18T11:22:26.573"
        },
        {
            "description": "Qualification 16",
            "level": "Qualification",
            "startTime": "2024-02-18T10:40:00",
            "matchNumber": 16,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 3467,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 509,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 501,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9999,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 94,
            "scoreRedFoul": 5,
            "scoreRedAuto": 27,
            "scoreBlueFinal": 43,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 3,
            "autoStartTime": "2024-02-18T11:28:53.717",
            "actualStartTime": "2024-02-18T11:28:53.717",
            "postResultTime": "2024-02-18T11:33:02.15"
        },
        {
            "description": "Qualification 17",
            "level": "Qualification",
            "startTime": "2024-02-18T10:48:00",
            "matchNumber": 17,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 2342,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 172,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 61,
            "scoreRedFoul": 0,
            "scoreRedAuto": 9,
            "scoreBlueFinal": 34,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T11:38:01.23",
            "actualStartTime": "2024-02-18T11:38:01.23",
            "postResultTime": "2024-02-18T11:41:22.18"
        },
        {
            "description": "Qualification 18",
            "level": "Qualification",
            "startTime": "2024-02-18T10:56:00",
            "matchNumber": 18,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 78,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9996,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 102,
            "scoreRedFoul": 5,
            "scoreRedAuto": 29,
            "scoreBlueFinal": 43,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 15,
            "autoStartTime": "2024-02-18T11:46:56.483",
            "actualStartTime": "2024-02-18T11:46:56.483",
            "postResultTime": "2024-02-18T11:50:34.317"
        },
        {
            "description": "Qualification 19",
            "level": "Qualification",
            "startTime": "2024-02-18T11:04:00",
            "matchNumber": 19,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 157,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 246,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1721,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9997,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 56,
            "scoreRedFoul": 0,
            "scoreRedAuto": 0,
            "scoreBlueFinal": 22,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 0,
            "autoStartTime": "2024-02-18T11:55:15.077",
            "actualStartTime": "2024-02-18T11:55:15.077",
            "postResultTime": "2024-02-18T11:58:06.353"
        },
        {
            "description": "Qualification 20",
            "level": "Qualification",
            "startTime": "2024-02-18T11:12:00",
            "matchNumber": 20,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 238,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 45,
            "scoreRedFoul": 0,
            "scoreRedAuto": 9,
            "scoreBlueFinal": 76,
            "scoreBlueFoul": 10,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T12:03:23.77",
            "actualStartTime": "2024-02-18T12:03:23.77",
            "postResultTime": "2024-02-18T12:07:14.917"
        }
    ]
}

trainingSchedule.qual.partial = {
    "Schedule": [
        {
            "description": "Qualification 1",
            "level": "Qualification",
            "startTime": "2024-02-18T08:40:00",
            "matchNumber": 1,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 246,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 509,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 47,
            "scoreRedFoul": 0,
            "scoreRedAuto": 10,
            "scoreBlueFinal": 54,
            "scoreBlueFoul": 15,
            "scoreBlueAuto": 11,
            "autoStartTime": "2024-02-18T09:00:19.763",
            "actualStartTime": "2024-02-18T09:00:19.763",
            "postResultTime": "2024-02-18T09:03:51.97"
        },
        {
            "description": "Qualification 2",
            "level": "Qualification",
            "startTime": "2024-02-18T08:48:00",
            "matchNumber": 2,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 501,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 49,
            "scoreRedFoul": 0,
            "scoreRedAuto": 8,
            "scoreBlueFinal": 27,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 0,
            "autoStartTime": "2024-02-18T09:09:19.997",
            "actualStartTime": "2024-02-18T09:09:19.997",
            "postResultTime": "2024-02-18T09:12:38.38"
        },
        {
            "description": "Qualification 3",
            "level": "Qualification",
            "startTime": "2024-02-18T08:56:00",
            "matchNumber": 3,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9999,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1729,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 77,
            "scoreRedFoul": 22,
            "scoreRedAuto": 3,
            "scoreBlueFinal": 71,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 12,
            "autoStartTime": "2024-02-18T09:20:33.153",
            "actualStartTime": "2024-02-18T09:20:33.153",
            "postResultTime": "2024-02-18T09:23:37.63"
        },
        {
            "description": "Qualification 4",
            "level": "Qualification",
            "startTime": "2024-02-18T09:04:00",
            "matchNumber": 4,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 58,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 172,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9996,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9997,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 20,
            "scoreRedFoul": 0,
            "scoreRedAuto": 6,
            "scoreBlueFinal": 60,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 21,
            "autoStartTime": "2024-02-18T09:33:19.947",
            "actualStartTime": "2024-02-18T09:33:19.947",
            "postResultTime": "2024-02-18T09:38:11.74"
        },
        {
            "description": "Qualification 5",
            "level": "Qualification",
            "startTime": "2024-02-18T09:12:00",
            "matchNumber": 5,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 238,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1721,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 42,
            "scoreRedFoul": 15,
            "scoreRedAuto": 3,
            "scoreBlueFinal": 75,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 30,
            "autoStartTime": "2024-02-18T09:46:08.13",
            "actualStartTime": "2024-02-18T09:46:08.13",
            "postResultTime": "2024-02-18T09:49:53.033"
        },
        {
            "description": "Qualification 6",
            "level": "Qualification",
            "startTime": "2024-02-18T09:20:00",
            "matchNumber": 6,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 4905,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1729,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 39,
            "scoreRedFoul": 0,
            "scoreRedAuto": 13,
            "scoreBlueFinal": 48,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 3,
            "autoStartTime": "2024-02-18T09:55:12.317",
            "actualStartTime": "2024-02-18T09:55:12.317",
            "postResultTime": "2024-02-18T09:58:23.383"
        },
        {
            "description": "Qualification 7",
            "level": "Qualification",
            "startTime": "2024-02-18T09:28:00",
            "matchNumber": 7,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9995,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 501,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9999,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9996,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 246,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 50,
            "scoreRedFoul": 0,
            "scoreRedAuto": 0,
            "scoreBlueFinal": 36,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 3,
            "autoStartTime": "2024-02-18T10:06:14.35",
            "actualStartTime": "2024-02-18T10:06:14.35",
            "postResultTime": "2024-02-18T10:09:11.45"
        },
        {
            "description": "Qualification 8",
            "level": "Qualification",
            "startTime": "2024-02-18T09:36:00",
            "matchNumber": 8,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 2423,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 172,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 53,
            "scoreRedFoul": 0,
            "scoreRedAuto": 10,
            "scoreBlueFinal": 87,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 21,
            "autoStartTime": "2024-02-18T10:14:36.097",
            "actualStartTime": "2024-02-18T10:14:36.097",
            "postResultTime": "2024-02-18T10:17:30.183"
        },
        {
            "description": "Qualification 9",
            "level": "Qualification",
            "startTime": "2024-02-18T09:44:00",
            "matchNumber": 9,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 1721,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 22,
            "scoreRedFoul": 5,
            "scoreRedAuto": 3,
            "scoreBlueFinal": 55,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 15,
            "autoStartTime": "2024-02-18T10:21:50.17",
            "actualStartTime": "2024-02-18T10:21:50.17",
            "postResultTime": "2024-02-18T10:25:12.093"
        },
        {
            "description": "Qualification 10",
            "level": "Qualification",
            "startTime": "2024-02-18T09:52:00",
            "matchNumber": 10,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 238,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 509,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9997,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 65,
            "scoreRedFoul": 0,
            "scoreRedAuto": 12,
            "scoreBlueFinal": 38,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T10:32:54.977",
            "actualStartTime": "2024-02-18T10:32:54.977",
            "postResultTime": "2024-02-18T10:35:53.643"
        },
        {
            "description": "Qualification 11",
            "level": "Qualification",
            "startTime": "2024-02-18T10:00:00",
            "matchNumber": 11,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 811,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1729,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 246,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Qualification 12",
            "level": "Qualification",
            "startTime": "2024-02-18T10:08:00",
            "matchNumber": 12,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9998,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9999,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Qualification 13",
            "level": "Qualification",
            "startTime": "2024-02-18T10:16:00",
            "matchNumber": 13,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 509,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 501,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 172,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1721,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Qualification 14",
            "level": "Qualification",
            "startTime": "2024-02-18T10:24:00",
            "matchNumber": 14,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9996,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 238,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Qualification 15",
            "level": "Qualification",
            "startTime": "2024-02-18T10:32:00",
            "matchNumber": 15,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 9997,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Qualification 16",
            "level": "Qualification",
            "startTime": "2024-02-18T10:40:00",
            "matchNumber": 16,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 3467,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 509,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 501,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9999,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Qualification 17",
            "level": "Qualification",
            "startTime": "2024-02-18T10:48:00",
            "matchNumber": 17,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 2342,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 172,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Qualification 18",
            "level": "Qualification",
            "startTime": "2024-02-18T10:56:00",
            "matchNumber": 18,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 78,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9996,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Qualification 19",
            "level": "Qualification",
            "startTime": "2024-02-18T11:04:00",
            "matchNumber": 19,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 157,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 246,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1721,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9997,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Qualification 20",
            "level": "Qualification",
            "startTime": "2024-02-18T11:12:00",
            "matchNumber": 20,
            "field": "Primary",
            "tournamentLevel": "Qualification",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 238,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        }
    ]
}

trainingSchedule.playoff.pending = {
    "Schedule": []
}

trainingSchedule.playoff.final = {
    "Schedule": [
        {
            "description": "Match 1 (R1)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:15:00",
            "matchNumber": 1,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 246,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 106,
            "scoreRedFoul": 0,
            "scoreRedAuto": 24,
            "scoreBlueFinal": 52,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T13:22:34.033",
            "actualStartTime": "2024-02-18T13:22:34.033",
            "postResultTime": "2024-02-18T13:25:43.507"
        },
        {
            "description": "Match 2 (R1)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:23:00",
            "matchNumber": 2,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 2370,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 238,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 91,
            "scoreRedFoul": 5,
            "scoreRedAuto": 16,
            "scoreBlueFinal": 57,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 20,
            "autoStartTime": "2024-02-18T13:32:31.237",
            "actualStartTime": "2024-02-18T13:32:31.237",
            "postResultTime": "2024-02-18T13:35:36.173"
        },
        {
            "description": "Match 3 (R1)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:31:00",
            "matchNumber": 3,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 108,
            "scoreRedFoul": 5,
            "scoreRedAuto": 24,
            "scoreBlueFinal": 52,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 15,
            "autoStartTime": "2024-02-18T13:43:56.353",
            "actualStartTime": "2024-02-18T13:43:56.353",
            "postResultTime": "2024-02-18T13:49:08.837"
        },
        {
            "description": "Match 4 (R1)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:39:00",
            "matchNumber": 4,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 509,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 39,
            "scoreRedFoul": 0,
            "scoreRedAuto": 4,
            "scoreBlueFinal": 56,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T13:53:35.27",
            "actualStartTime": "2024-02-18T13:53:35.27",
            "postResultTime": "2024-02-18T13:56:28.297"
        },
        {
            "description": "Match 5 (R2)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:47:00",
            "matchNumber": 5,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1512,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 238,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 75,
            "scoreRedFoul": 30,
            "scoreRedAuto": 9,
            "scoreBlueFinal": 19,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T14:10:14.743",
            "actualStartTime": "2024-02-18T14:10:14.743",
            "postResultTime": "2024-02-18T14:14:00.213"
        },
        {
            "description": "Match 6 (R2)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:55:00",
            "matchNumber": 6,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1153,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 509,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 89,
            "scoreRedFoul": 5,
            "scoreRedAuto": 12,
            "scoreBlueFinal": 79,
            "scoreBlueFoul": 5,
            "scoreBlueAuto": 18,
            "autoStartTime": "2024-02-18T14:19:29.367",
            "actualStartTime": "2024-02-18T14:19:29.367",
            "postResultTime": "2024-02-18T14:22:57.677"
        },
        {
            "description": "Match 7 (R2)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:03:00",
            "matchNumber": 7,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 246,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 68,
            "scoreRedFoul": 0,
            "scoreRedAuto": 27,
            "scoreBlueFinal": 38,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 3,
            "autoStartTime": "2024-02-18T14:27:45.15",
            "actualStartTime": "2024-02-18T14:27:45.15",
            "postResultTime": "2024-02-18T14:30:39.073"
        },
        {
            "description": "Match 8 (R2)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:11:00",
            "matchNumber": 8,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 70,
            "scoreRedFoul": 0,
            "scoreRedAuto": 21,
            "scoreBlueFinal": 42,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 28,
            "autoStartTime": "2024-02-18T14:35:39.107",
            "actualStartTime": "2024-02-18T14:35:39.107",
            "postResultTime": "2024-02-18T14:38:33.527"
        },
        {
            "description": "Match 9 (R3)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:19:00",
            "matchNumber": 9,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 2370,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 54,
            "scoreRedFoul": 5,
            "scoreRedAuto": 7,
            "scoreBlueFinal": 91,
            "scoreBlueFoul": 10,
            "scoreBlueAuto": 18,
            "autoStartTime": "2024-02-18T14:53:07.623",
            "actualStartTime": "2024-02-18T14:53:07.623",
            "postResultTime": "2024-02-18T14:56:10.14"
        },
        {
            "description": "Match 10 (R3)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:27:00",
            "matchNumber": 10,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 2423,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 501,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 30,
            "scoreRedFoul": 5,
            "scoreRedAuto": 7,
            "scoreBlueFinal": 62,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T15:02:19.657",
            "actualStartTime": "2024-02-18T15:02:19.657",
            "postResultTime": "2024-02-18T15:06:00.917"
        },
        {
            "description": "Match 11 (R4)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:35:00",
            "matchNumber": 11,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 246,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1729,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 101,
            "scoreRedFoul": 0,
            "scoreRedAuto": 24,
            "scoreBlueFinal": 106,
            "scoreBlueFoul": 10,
            "scoreBlueAuto": 24,
            "autoStartTime": "2024-02-18T15:23:18.87",
            "actualStartTime": "2024-02-18T15:23:18.87",
            "postResultTime": "2024-02-18T15:28:39.213"
        },
        {
            "description": "Match 12 (R4)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:43:00",
            "matchNumber": 12,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1512,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 60,
            "scoreRedFoul": 5,
            "scoreRedAuto": 9,
            "scoreBlueFinal": 104,
            "scoreBlueFoul": 5,
            "scoreBlueAuto": 30,
            "autoStartTime": "2024-02-18T15:33:15.133",
            "actualStartTime": "2024-02-18T15:33:15.133",
            "postResultTime": "2024-02-18T15:36:29.997"
        },
        {
            "description": "Match 13 (R5)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:51:00",
            "matchNumber": 13,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 246,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 74,
            "scoreRedFoul": 5,
            "scoreRedAuto": 15,
            "scoreBlueFinal": 95,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 30,
            "autoStartTime": "2024-02-18T15:59:26.87",
            "actualStartTime": "2024-02-18T15:59:26.87",
            "postResultTime": "2024-02-18T16:02:55.607"
        },
        {
            "description": "Final 1",
            "level": "Playoff",
            "startTime": "2024-02-18T14:59:00",
            "matchNumber": 14,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 104,
            "scoreRedFoul": 5,
            "scoreRedAuto": 24,
            "scoreBlueFinal": 120,
            "scoreBlueFoul": 20,
            "scoreBlueAuto": 27,
            "autoStartTime": "2024-02-18T16:26:10.907",
            "actualStartTime": "2024-02-18T16:26:10.907",
            "postResultTime": "2024-02-18T16:29:33.733"
        },
        {
            "description": "Final 2",
            "level": "Playoff",
            "startTime": "2024-02-18T15:07:00",
            "matchNumber": 15,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 102,
            "scoreRedFoul": 17,
            "scoreRedAuto": 24,
            "scoreBlueFinal": 102,
            "scoreBlueFoul": 10,
            "scoreBlueAuto": 24,
            "autoStartTime": "2024-02-18T16:49:45.2",
            "actualStartTime": "2024-02-18T16:49:45.2",
            "postResultTime": "2024-02-18T16:54:46.087"
        },
        {
            "description": "Final Tiebreaker",
            "level": "Playoff",
            "startTime": "2024-02-18T15:15:00",
            "matchNumber": 16,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 98,
            "scoreRedFoul": 15,
            "scoreRedAuto": 24,
            "scoreBlueFinal": 90,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 12,
            "autoStartTime": "2024-02-18T17:06:41.037",
            "actualStartTime": "2024-02-18T17:06:41.037",
            "postResultTime": "2024-02-18T17:10:01.573"
        },
        {
            "description": "Overtime 1",
            "level": "Playoff",
            "startTime": "2024-02-18T17:10:00.693",
            "matchNumber": 17,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 91,
            "scoreRedFoul": 20,
            "scoreRedAuto": 12,
            "scoreBlueFinal": 81,
            "scoreBlueFoul": 25,
            "scoreBlueAuto": 12,
            "autoStartTime": "2024-02-18T17:21:33.857",
            "actualStartTime": "2024-02-18T17:21:33.857",
            "postResultTime": "2024-02-18T17:27:10.973"
        }
    ]
}

trainingSchedule.playoff.partial = {
    "Schedule": [
        {
            "description": "Match 1 (R1)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:15:00",
            "matchNumber": 1,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 246,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 106,
            "scoreRedFoul": 0,
            "scoreRedAuto": 24,
            "scoreBlueFinal": 52,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T13:22:34.033",
            "actualStartTime": "2024-02-18T13:22:34.033",
            "postResultTime": "2024-02-18T13:25:43.507"
        },
        {
            "description": "Match 2 (R1)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:23:00",
            "matchNumber": 2,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 2370,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 238,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 91,
            "scoreRedFoul": 5,
            "scoreRedAuto": 16,
            "scoreBlueFinal": 57,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 20,
            "autoStartTime": "2024-02-18T13:32:31.237",
            "actualStartTime": "2024-02-18T13:32:31.237",
            "postResultTime": "2024-02-18T13:35:36.173"
        },
        {
            "description": "Match 3 (R1)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:31:00",
            "matchNumber": 3,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 108,
            "scoreRedFoul": 5,
            "scoreRedAuto": 24,
            "scoreBlueFinal": 52,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 15,
            "autoStartTime": "2024-02-18T13:43:56.353",
            "actualStartTime": "2024-02-18T13:43:56.353",
            "postResultTime": "2024-02-18T13:49:08.837"
        },
        {
            "description": "Match 4 (R1)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:39:00",
            "matchNumber": 4,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 509,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 39,
            "scoreRedFoul": 0,
            "scoreRedAuto": 4,
            "scoreBlueFinal": 56,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T13:53:35.27",
            "actualStartTime": "2024-02-18T13:53:35.27",
            "postResultTime": "2024-02-18T13:56:28.297"
        },
        {
            "description": "Match 5 (R2)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:47:00",
            "matchNumber": 5,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1512,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4041,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 238,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9998,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 75,
            "scoreRedFoul": 30,
            "scoreRedAuto": 9,
            "scoreBlueFinal": 19,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 9,
            "autoStartTime": "2024-02-18T14:10:14.743",
            "actualStartTime": "2024-02-18T14:10:14.743",
            "postResultTime": "2024-02-18T14:14:00.213"
        },
        {
            "description": "Match 6 (R2)",
            "level": "Playoff",
            "startTime": "2024-02-18T13:55:00",
            "matchNumber": 6,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1153,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 509,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2342,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 157,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 89,
            "scoreRedFoul": 5,
            "scoreRedAuto": 12,
            "scoreBlueFinal": 79,
            "scoreBlueFoul": 5,
            "scoreBlueAuto": 18,
            "autoStartTime": "2024-02-18T14:19:29.367",
            "actualStartTime": "2024-02-18T14:19:29.367",
            "postResultTime": "2024-02-18T14:22:57.677"
        },
        {
            "description": "Match 7 (R2)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:03:00",
            "matchNumber": 7,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 246,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2370,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": 68,
            "scoreRedFoul": 0,
            "scoreRedAuto": 27,
            "scoreBlueFinal": 38,
            "scoreBlueFoul": 0,
            "scoreBlueAuto": 3,
            "autoStartTime": "2024-02-18T14:27:45.15",
            "actualStartTime": "2024-02-18T14:27:45.15",
            "postResultTime": "2024-02-18T14:30:39.073"
        },
        {
            "description": "Match 8 (R2)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:11:00",
            "matchNumber": 8,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 1729,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 9995,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1073,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 2423,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 4905,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Match 9 (R3)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:19:00",
            "matchNumber": 9,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 2370,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 166,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 125,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1153,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1768,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 58,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Match 10 (R3)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:27:00",
            "matchNumber": 10,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 2423,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 501,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 811,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1512,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 1058,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 151,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Match 11 (R4)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:35:00",
            "matchNumber": 11,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 246,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 78,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 3467,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Match 12 (R4)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:43:00",
            "matchNumber": 12,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 0,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Match 13 (R5)",
            "level": "Playoff",
            "startTime": "2024-02-18T14:51:00",
            "matchNumber": 13,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 0,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Final 1",
            "level": "Playoff",
            "startTime": "2024-02-18T14:59:00",
            "matchNumber": 14,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 0,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Final 2",
            "level": "Playoff",
            "startTime": "2024-02-18T15:07:00",
            "matchNumber": 15,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 0,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": null,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": null,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": null,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Final Tiebreaker",
            "level": "Playoff",
            "startTime": "2024-02-18T15:15:00",
            "matchNumber": 16,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 0,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        },
        {
            "description": "Overtime 1",
            "level": "Playoff",
            "startTime": "2024-02-18T17:10:00.693",
            "matchNumber": 17,
            "field": "Primary",
            "tournamentLevel": "Playoff",
            "teams": [
                {
                    "teamNumber": 0,
                    "station": "Red1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Red3",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue1",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue2",
                    "surrogate": false,
                    "dq": false
                },
                {
                    "teamNumber": 0,
                    "station": "Blue3",
                    "surrogate": false,
                    "dq": false
                }
            ],
            "isReplay": false,
            "matchVideoLink": null,
            "scoreRedFinal": null,
            "scoreRedFoul": null,
            "scoreRedAuto": null,
            "scoreBlueFinal": null,
            "scoreBlueFoul": null,
            "scoreBlueAuto": null,
            "autoStartTime": null,
            "actualStartTime": null,
            "postResultTime": null
        }
    ]
}

trainingScores.playoff.final = {
    "MatchScores": [
        {
            "matchLevel": "Playoff",
            "matchNumber": 1,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Park",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 3,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 7,
                    "teleopPoints": 33,
                    "teleopGamePiecePoints": 27,
                    "endGameChargeStationPoints": 0,
                    "endGameParkPoints": 6,
                    "endGameBridgeState": "NotLevel",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                6,
                                7,
                                8
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 0,
                    "totalChargeStationPoints": 0,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 52
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "Cone",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 12,
                    "teleopPoints": 72,
                    "teleopGamePiecePoints": 42,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Mid",
                            "nodes": [
                                2,
                                3,
                                4
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 5,
                    "totalChargeStationPoints": 42,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 106
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 2,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 20,
                    "autoDocked": true,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 8,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 37,
                    "teleopGamePiecePoints": 15,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 28,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 57
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 6,
                    "autoPoints": 16,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 10,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 9,
                    "teleopPoints": 60,
                    "teleopGamePiecePoints": 30,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 30,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 91
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 3,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "None",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 9,
                    "autoPoints": 15,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 32,
                    "teleopGamePiecePoints": 24,
                    "endGameChargeStationPoints": 6,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "NotLevel",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                5,
                                6,
                                7
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 6,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 52
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 10,
                    "teleopPoints": 69,
                    "teleopGamePiecePoints": 39,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 42,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 108
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 4,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 3,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 42,
                    "teleopGamePiecePoints": 12,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Bottom",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 30,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 56
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "No",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 0,
                    "autoPoints": 4,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 4,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 35,
                    "teleopGamePiecePoints": 13,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 1,
                    "totalChargeStationPoints": 20,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 39
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 5,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "None",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "None",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 3,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 5,
                    "teleopPoints": 10,
                    "teleopGamePiecePoints": 10,
                    "endGameChargeStationPoints": 0,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "NotLevel",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 0,
                    "foulCount": 6,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 19
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "None",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 3,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "Cone",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 31,
                    "teleopGamePiecePoints": 29,
                    "endGameChargeStationPoints": 0,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "NotLevel",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 0,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 30,
                    "rp": 0,
                    "totalPoints": 75
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 6,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 18,
                    "autoDocked": true,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 4,
                    "autoChargeStationPoints": 8,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "Cone",
                            "None",
                            "Cone",
                            "None",
                            "Cube",
                            "None",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cone",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 10,
                    "teleopPoints": 51,
                    "teleopGamePiecePoints": 29,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Mid",
                            "nodes": [
                                6,
                                7,
                                8
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 28,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 79
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 9,
                    "autoPoints": 12,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 3,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "Cube",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 9,
                    "teleopPoints": 67,
                    "teleopGamePiecePoints": 37,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                2,
                                3,
                                4
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 30,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 89
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 7,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "No",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 0,
                    "autoPoints": 3,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 3,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "Cone",
                            "Cone",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 4,
                    "teleopPoints": 35,
                    "teleopGamePiecePoints": 15,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 20,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 38
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 9,
                    "autoPoints": 27,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 41,
                    "teleopGamePiecePoints": 21,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 32,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 68
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 8,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 9,
                    "autoPoints": 28,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 7,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 3,
                    "teleopPoints": 14,
                    "teleopGamePiecePoints": 2,
                    "endGameChargeStationPoints": 10,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 22,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 42
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 21,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 3,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "None",
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 49,
                    "teleopGamePiecePoints": 19,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 42,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 70
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 9,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 9,
                    "autoPoints": 18,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 9,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "Cone",
                            "None",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 9,
                    "teleopPoints": 53,
                    "teleopGamePiecePoints": 23,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Bottom",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                5,
                                6,
                                7
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 30,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 10,
                    "rp": 0,
                    "totalPoints": 91
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 3,
                    "autoPoints": 7,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 4,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 4,
                    "teleopPoints": 42,
                    "teleopGamePiecePoints": 12,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 30,
                    "foulCount": 2,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 54
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 10,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Park",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 3,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 10,
                    "teleopPoints": 43,
                    "teleopGamePiecePoints": 37,
                    "endGameChargeStationPoints": 0,
                    "endGameParkPoints": 6,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                2,
                                3,
                                4
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                5,
                                6,
                                7
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 0,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 62
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "No",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 0,
                    "autoPoints": 7,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 7,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 4,
                    "teleopPoints": 18,
                    "teleopGamePiecePoints": 6,
                    "endGameChargeStationPoints": 12,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "NotLevel",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 12,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 30
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 11,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "Docked",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 62,
                    "teleopGamePiecePoints": 32,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                2,
                                3,
                                4
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                5,
                                6,
                                7
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 42,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 10,
                    "rp": 0,
                    "totalPoints": 106
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "Cone",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube"
                        ]
                    },
                    "teleopGamePieceCount": 11,
                    "teleopPoints": 67,
                    "teleopGamePiecePoints": 37,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Mid",
                            "nodes": [
                                2,
                                3,
                                4
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 42,
                    "foulCount": 2,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 101
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 12,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "None",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 9,
                    "autoPoints": 30,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 9,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 11,
                    "teleopPoints": 59,
                    "teleopGamePiecePoints": 39,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                1,
                                2,
                                3
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                4,
                                5,
                                6
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 32,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 104
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 3,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 36,
                    "teleopGamePiecePoints": 32,
                    "endGameChargeStationPoints": 0,
                    "endGameParkPoints": 4,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 0,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 60
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 13,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 9,
                    "autoPoints": 30,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 9,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 10,
                    "teleopPoints": 55,
                    "teleopGamePiecePoints": 25,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Bottom",
                            "nodes": [
                                4,
                                5,
                                6
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                6,
                                7,
                                8
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 42,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 95
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 0,
                    "autoMobilityPoints": 3,
                    "autoPoints": 15,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 0,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 49,
                    "teleopGamePiecePoints": 29,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Mid",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 1,
                    "totalChargeStationPoints": 32,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 74
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 14,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 6,
                    "autoPoints": 27,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 9,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "Cone",
                            "Cone",
                            "None",
                            "None",
                            "Cone",
                            "Cube"
                        ]
                    },
                    "teleopGamePieceCount": 11,
                    "teleopPoints": 63,
                    "teleopGamePiecePoints": 33,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                6,
                                7,
                                8
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 5,
                    "totalChargeStationPoints": 42,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 20,
                    "rp": 0,
                    "totalPoints": 120
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 65,
                    "teleopGamePiecePoints": 35,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 42,
                    "foulCount": 4,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 104
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 15,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "Docked",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 12,
                    "teleopPoints": 58,
                    "teleopGamePiecePoints": 38,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Bottom",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                4,
                                5,
                                6
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 32,
                    "foulCount": 1,
                    "techFoulCount": 1,
                    "adjustPoints": 0,
                    "foulPoints": 10,
                    "rp": 0,
                    "totalPoints": 102
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "None",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 10,
                    "teleopPoints": 51,
                    "teleopGamePiecePoints": 39,
                    "endGameChargeStationPoints": 12,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "NotLevel",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 24,
                    "foulCount": 2,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 17,
                    "rp": 0,
                    "totalPoints": 102
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 16,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 12,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 13,
                    "teleopPoints": 63,
                    "teleopGamePiecePoints": 49,
                    "endGameChargeStationPoints": 12,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "NotLevel",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                6,
                                7,
                                8
                            ]
                        }
                    ],
                    "linkPoints": 15,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 12,
                    "foulCount": 3,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 90
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 7,
                    "teleopPoints": 54,
                    "teleopGamePiecePoints": 24,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 42,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 15,
                    "rp": 0,
                    "totalPoints": 98
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 17,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Park",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 12,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 39,
                    "teleopGamePiecePoints": 29,
                    "endGameChargeStationPoints": 6,
                    "endGameParkPoints": 4,
                    "endGameBridgeState": "NotLevel",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                4,
                                5,
                                6
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 6,
                    "foulCount": 4,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 25,
                    "rp": 0,
                    "totalPoints": 81
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 12,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "Cube"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 54,
                    "teleopGamePiecePoints": 24,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 30,
                    "foulCount": 5,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 20,
                    "rp": 0,
                    "totalPoints": 91
                }
            ]
        }
    ]
}

trainingScores.playoff.partial = {
    "MatchScores": [
        {
            "matchLevel": "Playoff",
            "matchNumber": 1,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Park",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 3,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 7,
                    "teleopPoints": 33,
                    "teleopGamePiecePoints": 27,
                    "endGameChargeStationPoints": 0,
                    "endGameParkPoints": 6,
                    "endGameBridgeState": "NotLevel",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                6,
                                7,
                                8
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 0,
                    "totalChargeStationPoints": 0,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 52
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "Cone",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 12,
                    "teleopPoints": 72,
                    "teleopGamePiecePoints": 42,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Mid",
                            "nodes": [
                                2,
                                3,
                                4
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 5,
                    "totalChargeStationPoints": 42,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 106
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 2,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 20,
                    "autoDocked": true,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 8,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 37,
                    "teleopGamePiecePoints": 15,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 28,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 57
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 6,
                    "autoPoints": 16,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 10,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 9,
                    "teleopPoints": 60,
                    "teleopGamePiecePoints": 30,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 30,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 91
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 3,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "None",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 9,
                    "autoPoints": 15,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 32,
                    "teleopGamePiecePoints": 24,
                    "endGameChargeStationPoints": 6,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "NotLevel",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                5,
                                6,
                                7
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 6,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 52
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 24,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 10,
                    "teleopPoints": 69,
                    "teleopGamePiecePoints": 39,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        },
                        {
                            "row": "Top",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        }
                    ],
                    "linkPoints": 10,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 42,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 108
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 4,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 3,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 42,
                    "teleopGamePiecePoints": 12,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Bottom",
                            "nodes": [
                                3,
                                4,
                                5
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 30,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 56
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "No",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 0,
                    "autoPoints": 4,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 4,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 35,
                    "teleopGamePiecePoints": 13,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 1,
                    "totalChargeStationPoints": 20,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 39
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 5,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "None",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "None",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 3,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 5,
                    "teleopPoints": 10,
                    "teleopGamePiecePoints": 10,
                    "endGameChargeStationPoints": 0,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "NotLevel",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 3,
                    "totalChargeStationPoints": 0,
                    "foulCount": 6,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 19
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "None",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 3,
                    "autoPoints": 9,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "Cone",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 8,
                    "teleopPoints": 31,
                    "teleopGamePiecePoints": 29,
                    "endGameChargeStationPoints": 0,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "NotLevel",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                0,
                                1,
                                2
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 0,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 30,
                    "rp": 0,
                    "totalPoints": 75
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 6,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Park",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 18,
                    "autoDocked": true,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 4,
                    "autoChargeStationPoints": 8,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ],
                        "M": [
                            "Cone",
                            "None",
                            "Cone",
                            "None",
                            "Cube",
                            "None",
                            "Cone",
                            "Cube",
                            "Cone"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "Cone",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 10,
                    "teleopPoints": 51,
                    "teleopGamePiecePoints": 29,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Mid",
                            "nodes": [
                                6,
                                7,
                                8
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 28,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 79
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 9,
                    "autoPoints": 12,
                    "autoDocked": false,
                    "autoBridgeState": "NotLevel",
                    "autoGamePiecePoints": 3,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "Cone",
                            "Cone",
                            "Cube",
                            "Cone",
                            "Cone",
                            "None",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "Cube",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 9,
                    "teleopPoints": 67,
                    "teleopGamePiecePoints": 37,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [
                        {
                            "row": "Top",
                            "nodes": [
                                2,
                                3,
                                4
                            ]
                        }
                    ],
                    "linkPoints": 5,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": true,
                    "coopGamePieceCount": 4,
                    "totalChargeStationPoints": 30,
                    "foulCount": 1,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 5,
                    "rp": 0,
                    "totalPoints": 89
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 7,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "No",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "No",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 0,
                    "autoPoints": 3,
                    "autoDocked": false,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 3,
                    "autoChargeStationPoints": 0,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "Cone",
                            "Cone",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 4,
                    "teleopPoints": 35,
                    "teleopGamePiecePoints": 15,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 20,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 38
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 9,
                    "autoPoints": 27,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 6,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "Cone",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 41,
                    "teleopGamePiecePoints": 21,
                    "endGameChargeStationPoints": 20,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 32,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 68
                }
            ]
        },
        {
            "matchLevel": "Playoff",
            "matchNumber": 8,
            "alliances": [
                {
                    "alliance": "Blue",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "Yes",
                    "autoChargeStationRobot2": "Docked",
                    "endGameChargeStationRobot2": "Park",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "None",
                    "endGameChargeStationRobot3": "None",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "autoGamePieceCount": 2,
                    "autoMobilityPoints": 9,
                    "autoPoints": 28,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 7,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "Cone",
                            "None",
                            "None",
                            "Cone"
                        ]
                    },
                    "teleopGamePieceCount": 3,
                    "teleopPoints": 14,
                    "teleopGamePiecePoints": 2,
                    "endGameChargeStationPoints": 10,
                    "endGameParkPoints": 2,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": false,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 22,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 42
                },
                {
                    "alliance": "Red",
                    "mobilityRobot1": "Yes",
                    "autoChargeStationRobot1": "None",
                    "endGameChargeStationRobot1": "Docked",
                    "mobilityRobot2": "No",
                    "autoChargeStationRobot2": "None",
                    "endGameChargeStationRobot2": "Docked",
                    "mobilityRobot3": "Yes",
                    "autoChargeStationRobot3": "Docked",
                    "endGameChargeStationRobot3": "Docked",
                    "autoCommunity": {
                        "T": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "autoGamePieceCount": 1,
                    "autoMobilityPoints": 6,
                    "autoPoints": 21,
                    "autoDocked": true,
                    "autoBridgeState": "Level",
                    "autoGamePiecePoints": 3,
                    "autoChargeStationPoints": 12,
                    "teleopCommunity": {
                        "T": [
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "M": [
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ],
                        "B": [
                            "Cone",
                            "None",
                            "Cone",
                            "Cube",
                            "None",
                            "None",
                            "None",
                            "None",
                            "None"
                        ]
                    },
                    "teleopGamePieceCount": 6,
                    "teleopPoints": 49,
                    "teleopGamePiecePoints": 19,
                    "endGameChargeStationPoints": 30,
                    "endGameParkPoints": 0,
                    "endGameBridgeState": "Level",
                    "links": [],
                    "linkPoints": 0,
                    "activationBonusAchieved": true,
                    "sustainabilityBonusAchieved": false,
                    "coopertitionCriteriaMet": false,
                    "coopGamePieceCount": 2,
                    "totalChargeStationPoints": 42,
                    "foulCount": 0,
                    "techFoulCount": 0,
                    "adjustPoints": 0,
                    "foulPoints": 0,
                    "rp": 0,
                    "totalPoints": 70
                }
            ]
        }
    ]
}

trainingScores.playoff.partial = {
    "MatchScores": []
}

trainingTeams.teams = {
    "teamCountTotal": 30,
    "teamCountPage": 30,
    "pageCurrent": 1,
    "pageTotal": 1,
    "teams": [
        {
            "teamNumber": 58,
            "nameFull": "South Portland School Department/Building STEAM&South Portland High School",
            "nameShort": "The Riot Crew",
            "city": "South Portland",
            "stateProv": "Maine",
            "country": "USA",
            "rookieYear": 1996,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "South Portland High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 78,
            "nameFull": "Naval Undersea Warfare Center/DoDSTEM/Nordson EFD/ACS Industries/BankNewport/Chad Kritzas Team/Kate Bosch Professional Organizing/KVH Industries/Mount Hope Animal Hospital/Rite-Solutions/Teri Degnan Real Estate & Consulting&Aquidneck Island Robotics",
            "nameShort": "AIR STRIKE",
            "city": "Newport",
            "stateProv": "Rhode Island",
            "country": "USA",
            "rookieYear": 1996,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Aquidneck Island Robotics",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 125,
            "nameFull": "Sonos/Markforged/West Coast Products LLC/Northeastern University/PTC/BNY Mellon/BAE Systems/Mathworks&Boston Latin School&Brookline High School&Revere High School&Greater Boston 4-H Robotics",
            "nameShort": "NUTRONs",
            "city": "Revere",
            "stateProv": "Massachusetts",
            "country": "USA",
            "rookieYear": 1998,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Greater Boston 4-H Robotics & Boston Latin School & Brookline High School & Revere High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 151,
            "nameFull": "MakeIt Labs/GHO Ventures/BAE Systems/Parker Hannifin/Star Machines/Ritz Carlton Boston/The Godfrey Hotel/Corning Foundation&Nashua High School-South&Nashua High School-North&Family/Community",
            "nameShort": "Tough Techs",
            "city": "Nashua",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 1992,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Family/Community & Nashua High School-North & Nashua High School-South",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 157,
            "nameFull": "Boston Scientific/Abbott Laboratories /Hologic/Raytheon/Workers Credit Union/Comcast/Tierpoint/Gene Haas Foundation&Assabet Valley Reg Tech HS",
            "nameShort": "AZTECHS",
            "city": "Marlborough",
            "stateProv": "Massachusetts",
            "country": "USA",
            "rookieYear": 1992,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Assabet Valley Reg Tech HS",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 166,
            "nameFull": "Merrimack School District/New Hampshire Department of Education/Elbit Systems of America/Saint-Gobain/Raytheon Technologies/B & K Industrial Finishing, Inc./Fully Promoted/Sal's Pizza&Merrimack High School",
            "nameShort": "Chop Shop",
            "city": "Merrimack",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 1995,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Merrimack High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 172,
            "nameFull": "IDEXX Laboratories/Lanco Integrated/Falmouth High School/Adobe/Texas Instruments/GoFar&Falmouth High School&Gorham High School",
            "nameShort": "Northern Force",
            "city": "Falmouth/Gorham",
            "stateProv": "Maine",
            "country": "USA",
            "rookieYear": 1996,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Falmouth High School & Gorham High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 238,
            "nameFull": "Bosch&Manchester Memorial High Sch",
            "nameShort": "Crusaders",
            "city": "Manchester",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 1999,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Manchester Memorial High Sch",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 246,
            "nameFull": "The Boeing Company/Bayer Fund/Gene Haas Foundation/Boston University&Boston University Academy",
            "nameShort": "Lobstah Bots",
            "city": "Boston",
            "stateProv": "Massachusetts",
            "country": "USA",
            "rookieYear": 1999,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Boston University Academy",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 501,
            "nameFull": "AC Trust/NH Department of Education/Louis P. Cote Inc./Stu, Sam & Lexxie/Consolidated Communications/L3/Harris/FIRST NH/TCI/BAE Systems/Heritage Helps Foundation/Macy Industries/Serge Marchesseault Memorial Fund&4-H&Goffstown High School&Manchester High School-West",
            "nameShort": "Team 501 - The PowerKnights Robotics Team",
            "city": "Manchester",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2001,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "4-H & Manchester High School-West & Goffstown High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 509,
            "nameFull": "NASA/Schneider Electric/NH Department of Education/Bedford School District/Masi Plumbing and Heating&Bedford High School",
            "nameShort": "Red Storm",
            "city": "Bedford",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2001,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Bedford High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 811,
            "nameFull": "Analog Devices/BAE Systems/NE FIRST/Darren & Tuyet Martin&Bishop Guertin High School",
            "nameShort": "Wild Cards",
            "city": "Nashua",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2002,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Bishop Guertin High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 1058,
            "nameFull": "Fleet Ready Corp./Londonderry STEM/BAE Systems/Raytheon&Londonderry High School",
            "nameShort": "PVC Pirates",
            "city": "Londonderry",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2003,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Londonderry High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 1073,
            "nameFull": "Hollis-Brookline High School/Viasat/BAE Systems/FIRST New Hampshire/New Hampshire Department of Education/Amazon Robotics/Southern New England Admirals: Semi-Pro Football Team & Family/Community & Hollis Brookline High School",
            "nameShort": "The Force Team",
            "city": "Hollis",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2003,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Family/Community & Hollis Brookline High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 1153,
            "nameFull": "Analog Devices/Legacy Engineering/WM Duggan Company/Koopman Lumber&Walpole High School",
            "nameShort": "Timberwolves",
            "city": "Walpole",
            "stateProv": "Massachusetts",
            "country": "USA",
            "rookieYear": 2003,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Walpole High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 1512,
            "nameFull": "Criterium-Turner Engineers/Penn Engineering/Plano Molding Company & St Paul'S School",
            "nameShort": "The Big Red",
            "city": "Concord",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2005,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "St Paul'S School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 1721,
            "nameFull": "Army National Guard/The Walker Lecture Series/Gene Haas Foundation/Eldridge Investments/Sedutto Family/Smykil Family/Spain Family&Concord High School",
            "nameShort": "Tidal Force",
            "city": "Concord",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2006,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Concord High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 1729,
            "nameFull": "Wyatt & Associates/NASA/New Hampshire 4-H Association&Monadnock 4-H Robotics Club",
            "nameShort": "Team Inconceivable!",
            "city": "Peterborough",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2006,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Monadnock 4-H Robotics Club",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 1768,
            "nameFull": "SynQor/Bose/Cain Electric&Nashoba Regional High School",
            "nameShort": "Nashoba Robotics",
            "city": "Bolton",
            "stateProv": "Massachusetts",
            "country": "USA",
            "rookieYear": 2006,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Nashoba Regional High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 2342,
            "nameFull": "Academy for Science and Design/Raytheon/Hi-Tech Fabricators/EmbroidMe/BAE SYSTEMS&Neighborhood Group",
            "nameShort": "Team Phoenix",
            "city": "Nashua",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2008,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Neighborhood Group",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 2370,
            "nameFull": "First Light Technologies/GE Aviation Volunteers/Alderman Chevrolet and Toyota&Stafford Technical Center",
            "nameShort": "IBOTS",
            "city": "Rutland",
            "stateProv": "Vermont",
            "country": "USA",
            "rookieYear": 2008,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Stafford Technical Center",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 2423,
            "nameFull": "The Bayer Fund/Bosch/Enanta Pharmaceuticals/Markforged&Watertown High School",
            "nameShort": "The KwarQs",
            "city": "Watertown",
            "stateProv": "Massachusetts",
            "country": "USA",
            "rookieYear": 2008,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Watertown High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 3467,
            "nameFull": "Veloxion, Inc./Windham High School/Analog Devices/Bayer/BAE Systems/TE Connectivity/Intuitive Foundation/PTC/NH Department of Education&Windup Robotics 4-H Club",
            "nameShort": "Windham Windup",
            "city": "Windham",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2011,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Windup Robotics 4-H Club",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 4041,
            "nameFull": "MSAD #11/The Robinson Fund/Passerelle Data/NASA/DoDEA & Gardiner Area High School",
            "nameShort": "Iron Tigers",
            "city": "Gardiner",
            "stateProv": "Maine",
            "country": "USA",
            "rookieYear": 2012,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Gardiner Area High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 4905,
            "nameFull": "Boston Scientific/Schneider Electric/Ansys, Inc./Analog Devices/DSS SolidWorks/BAE Systems/Amazon/Christine Miska&AYER SHIRLEY REGIONAL HIGH SCHOOL",
            "nameShort": "Andromeda One",
            "city": "Ayer",
            "stateProv": "Massachusetts",
            "country": "USA",
            "rookieYear": 2014,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "AYER SHIRLEY REGIONAL HIGH SCHOOL",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 9995,
            "nameFull": "Raytheon&Billerica Memorial High School",
            "nameShort": "Bionics",
            "city": "Billerica",
            "stateProv": "Massachusetts",
            "country": "USA",
            "rookieYear": 2014,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Billerica Memorial High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 9996,
            "nameFull": "Ipswich Education Foundation / Analog Devices Inc. / New England Biolabs / AXIS, Inc. / Josephson Family / Harmonic Drive Inc. / Joset Corp. / Tedford's Hardware and Building Supplies / East Coast Metrology / Dawn Falardeau / James Kernan / Dassault Systems & Ipswich High School",
            "nameShort": "Ipswich TIGERS",
            "city": "Ipswich",
            "stateProv": "Massachusetts",
            "country": "USA",
            "rookieYear": 2015,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Ipswich High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 9997,
            "nameFull": "EEI/NH DOE/newschoolvinyl/SAU 18/Benson Auto/C&C Cars/Watts/May Garden/DeMoulas Super Markets, Inc.&Franklin High School",
            "nameShort": "Tornadoes",
            "city": "Franklin",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2018,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Franklin High School",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 9998,
            "nameFull": "Argosy Foundation/Rockwell Automation/Burk Technology&Family/Community",
            "nameShort": "Mayhem",
            "city": "Bedford",
            "stateProv": "New Hampshire",
            "country": "USA",
            "rookieYear": 2022,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Family/Community",
            "website": "",
            "homeCMP": "CMPTX"
        },
        {
            "teamNumber": 9999,
            "nameFull": "Essex High School",
            "nameShort": "HiveMind Robotics",
            "city": "Essex Junction",
            "stateProv": "Vermont",
            "country": "USA",
            "rookieYear": 2023,
            "robotName": "",
            "districtCode": "NE",
            "schoolName": "Essex High School",
            "website": "",
            "homeCMP": "CMPTX"
        }
    ]
}

trainingTeams.communityUpdates = [
    {
        "teamNumber": 58,
        "updates": {}
    },
    {
        "teamNumber": 78,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Baker",
            "awardsLocal": "",
            "teamMottoLocal": "Teaching through competitive robotics",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-04-14T09:29:14-04:00",
            "source": "mooretep@cox.net"
        }
    },
    {
        "teamNumber": 125,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Freefall",
            "awardsLocal": "",
            "teamMottoLocal": "Uhh...strap?",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-03-25T21:06:01-04:00",
            "source": "imarcellana@gmail.com"
        }
    },
    {
        "teamNumber": 151,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "MakeIt Labs, GHO Ventures, BAE Systems, 3rd Degree Safety Solutions & JetBlue",
            "sponsorsLocal": "MakeIt Labs, GHO Ventures, BAE Systems, 3rd Degree Safety Solutions, JetBlue, Star Machines, Ritz Carlton Boston, The Godfrey Hotel, Corning Foundation & Nashua High School-South & Nashua High School-North & Family & Community",
            "organizationLocal": "",
            "robotNameLocal": "Orange Beast",
            "awardsLocal": "",
            "teamMottoLocal": "Tough matches don't last, but Tough Techs do.",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "1-5-1",
            "lastUpdate": "2022-03-25T21:06:01-04:00",
            "source": "imarcellana@gmail.com"
        }
    },
    {
        "teamNumber": 157,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Mantis",
            "awardsLocal": "",
            "teamMottoLocal": "One team, One mission",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-03-27T16:52:15-04:00",
            "source": "treydem@gmail.com"
        }
    },
    {
        "teamNumber": 166,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "Merrimack School District, New Hampshire Department of Education, Elbit Systems of America, Raytheon & Saint Gobain",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Valkyrie",
            "awardsLocal": "",
            "teamMottoLocal": "",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-04-14T09:29:14-04:00",
            "source": "mooretep@cox.net"
        }
    },
    {
        "teamNumber": 172,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "Gorham & Falmouth, Maine",
            "topSponsorsLocal": "Lanco Integrated, Adobe, IDEXX Laboratories, Texas Instruments & GoFAR",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Frank",
            "awardsLocal": "",
            "teamMottoLocal": "Think Pink",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "2",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "one seventy two",
            "lastUpdate": "2024-02-14T12:04:43-05:00",
            "source": "jlockman@adobe.com"
        }
    },
    {
        "teamNumber": 238,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Poison Ivy",
            "awardsLocal": "",
            "teamMottoLocal": "",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-04-14T09:29:14-04:00",
            "source": "mooretep@cox.net"
        }
    },
    {
        "teamNumber": 246,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Lobstah",
            "awardsLocal": "",
            "teamMottoLocal": "",
            "teamNotesLocal": "Low heavy defender",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-03-31T20:15:36-04:00",
            "source": "jlockman@adobe.com"
        }
    },
    {
        "teamNumber": 501,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "Goffstown, New Hampshire",
            "topSponsorsLocal": "Stu, Sam & Lexxie, Louis P. Cote Inc., Kellogg’s Research Lab, Heritage Helps, TCI",
            "sponsorsLocal": "Stu, Sam & Lexxie, Louis P. Cote Inc., Kellogg’s Research Lab, Heritage Helps, TCI",
            "organizationLocal": "",
            "robotNameLocal": "Johnny 5",
            "awardsLocal": "",
            "teamMottoLocal": "",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-03-25T21:06:01-04:00",
            "source": "imarcellana@gmail.com"
        }
    },
    {
        "teamNumber": 509,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Alice",
            "awardsLocal": "",
            "teamMottoLocal": "Taking the world by storm",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-04-14T09:29:14-04:00",
            "source": "mooretep@cox.net"
        }
    },
    {
        "teamNumber": 811,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "NE FIRST, BAE Systems & Mom’s Egg Rolls",
            "sponsorsLocal": "NE FIRST, BAE Systems & Mom’s Egg Rolls",
            "organizationLocal": "",
            "robotNameLocal": "Wall E",
            "awardsLocal": "",
            "teamMottoLocal": "It’s not just a robot thing",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-03-27T16:52:15-04:00",
            "source": "treydem@gmail.com"
        }
    },
    {
        "teamNumber": 1058,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "Fleet Ready Corp., Londonderry STEM, Raytheon Technologies, Londonderry HS & DOE",
            "sponsorsLocal": "Fleet Ready Corp., Londonderry STEM, Raytheon Technologies",
            "organizationLocal": "",
            "robotNameLocal": "Jiggle-Bot",
            "awardsLocal": "",
            "teamMottoLocal": "",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-03-27T16:52:15-04:00",
            "source": "treydem@gmail.com"
        }
    },
    {
        "teamNumber": 1073,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "Hollis-Brookline High School",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Nu-nu",
            "awardsLocal": "",
            "teamMottoLocal": "Sanity is optional",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": false,
            "teamNotes": "",
            "sayNumber": "Ten seventy three",
            "lastUpdate": "2024-02-18T11:18:01-05:00",
            "source": "jlockman@adobe.com"
        }
    },
    {
        "teamNumber": 1153,
        "updates": {}
    },
    {
        "teamNumber": 1512,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "Granite State Glass",
            "sponsorsLocal": "Granite State Glass",
            "organizationLocal": "St Paul's School",
            "robotNameLocal": "Big Red",
            "awardsLocal": "",
            "teamMottoLocal": "Concidite Praeclare",
            "teamNotesLocal": "Go baby go. Makes mobility devices for kids",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-03-31T19:45:44-04:00",
            "source": "jlockman@adobe.com"
        }
    },
    {
        "teamNumber": 1721,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "Bendrite, Concord Co-op, Molly B Foundation, Who Doesn't Want That?, BAE Systems, Gregg’s Customs",
            "sponsorsLocal": "Bendrite, Concord Co-op, Molly B Foundation, Who Doesn't Want That?, BAE Systems, Spain Family & Boston Scientific, Gregg’s Customs",
            "organizationLocal": "",
            "robotNameLocal": "Burnt Toaster",
            "awardsLocal": "",
            "teamMottoLocal": "",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-04-10T09:31:17-04:00",
            "source": "mooretep@cox.net"
        }
    },
    {
        "teamNumber": 1729,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Miracle Max",
            "awardsLocal": "",
            "teamMottoLocal": "I don't think it means what you think it means",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-04-14T09:29:14-04:00",
            "source": "mooretep@cox.net"
        }
    },
    {
        "teamNumber": 1768,
        "updates": {}
    },
    {
        "teamNumber": 2342,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Fax Machine",
            "awardsLocal": "",
            "teamMottoLocal": "Rising from the ashes",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-04-14T09:29:14-04:00",
            "source": "mooretep@cox.net"
        }
    },
    {
        "teamNumber": 2370,
        "updates": {}
    },
    {
        "teamNumber": 2423,
        "updates": {}
    },
    {
        "teamNumber": 3467,
        "updates": {}
    },
    {
        "teamNumber": 4041,
        "updates": {}
    },
    {
        "teamNumber": 4905,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Top Gun",
            "awardsLocal": "",
            "teamMottoLocal": "Let's build something amazing",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-04-14T09:29:14-04:00",
            "source": "mooretep@cox.net"
        }
    },
    {
        "teamNumber": 9995,
        "updates": {
            "robotNameLocal": "Equinox",
            "lastUpdate": "2024-02-18T10:26:46-05:00",
            "source": "jlockman@adobe.com"
        }
    },
    {
        "teamNumber": 9996,
        "updates": {}
    },
    {
        "teamNumber": 9997,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "Franklin High School, New School Vinyl, EEI, Disney & Benson’s Auto",
            "sponsorsLocal": "",
            "organizationLocal": "",
            "robotNameLocal": "Caution: Wet Floor",
            "awardsLocal": "",
            "teamMottoLocal": "Small but mind-y",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-03-31T19:53:01-04:00",
            "source": "jlockman@adobe.com"
        }
    },
    {
        "teamNumber": 9998,
        "updates": {
            "nameShortLocal": "",
            "cityStateLocal": "",
            "topSponsorsLocal": "Sullivan Construction, Rockwell Automation, Argosy Foundation",
            "sponsorsLocal": "Sullivan Construction, Rockwell Automation, Argosy Foundation",
            "organizationLocal": "",
            "robotNameLocal": "Shellshock ",
            "awardsLocal": "",
            "teamMottoLocal": "Should be fine",
            "teamNotesLocal": "",
            "teamYearsNoCompeteLocal": "",
            "showRobotName": true,
            "teamNotes": "",
            "sayNumber": "",
            "lastUpdate": "2022-04-14T09:29:14-04:00",
            "source": "mooretep@cox.net"
        }
    },
    {
        "teamNumber": 9999,
        "updates": null
    }
]

trainingRanks.final = {
    "Rankings": [
        {
            "rank": 1,
            "teamNumber": 3467,
            "sortOrder1": 2.75,
            "sortOrder2": 80.75,
            "sortOrder3": 29,
            "sortOrder4": 21.75,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 4,
            "losses": 0,
            "ties": 0,
            "qualAverage": 82,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 2,
            "teamNumber": 78,
            "sortOrder1": 2.75,
            "sortOrder2": 71.25,
            "sortOrder3": 33.5,
            "sortOrder4": 16,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 4,
            "losses": 0,
            "ties": 0,
            "qualAverage": 72.5,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 3,
            "teamNumber": 1073,
            "sortOrder1": 2.25,
            "sortOrder2": 60.25,
            "sortOrder3": 31,
            "sortOrder4": 19.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 3,
            "losses": 1,
            "ties": 0,
            "qualAverage": 61.5,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 4,
            "teamNumber": 157,
            "sortOrder1": 2,
            "sortOrder2": 60.5,
            "sortOrder3": 25.5,
            "sortOrder4": 10.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 3,
            "losses": 1,
            "ties": 0,
            "qualAverage": 64.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 5,
            "teamNumber": 9995,
            "sortOrder1": 2,
            "sortOrder2": 56.75,
            "sortOrder3": 25.5,
            "sortOrder4": 5.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 3,
            "losses": 1,
            "ties": 0,
            "qualAverage": 59.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 6,
            "teamNumber": 166,
            "sortOrder1": 2,
            "sortOrder2": 55,
            "sortOrder3": 28,
            "sortOrder4": 5.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 3,
            "losses": 1,
            "ties": 0,
            "qualAverage": 55,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 7,
            "teamNumber": 4041,
            "sortOrder1": 1.75,
            "sortOrder2": 41.75,
            "sortOrder3": 17.5,
            "sortOrder4": 6.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 3,
            "losses": 1,
            "ties": 0,
            "qualAverage": 49.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 8,
            "teamNumber": 4905,
            "sortOrder1": 1.5,
            "sortOrder2": 68,
            "sortOrder3": 28.5,
            "sortOrder4": 17.75,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 69.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 9,
            "teamNumber": 2423,
            "sortOrder1": 1.5,
            "sortOrder2": 63.75,
            "sortOrder3": 26,
            "sortOrder4": 19,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 65,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 10,
            "teamNumber": 1768,
            "sortOrder1": 1.5,
            "sortOrder2": 61.75,
            "sortOrder3": 26.5,
            "sortOrder4": 14.75,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 61.75,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 11,
            "teamNumber": 2342,
            "sortOrder1": 1.5,
            "sortOrder2": 50.25,
            "sortOrder3": 17.5,
            "sortOrder4": 6.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 3,
            "losses": 1,
            "ties": 0,
            "qualAverage": 50.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 12,
            "teamNumber": 151,
            "sortOrder1": 1.5,
            "sortOrder2": 48.25,
            "sortOrder3": 17,
            "sortOrder4": 8,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 3,
            "losses": 1,
            "ties": 0,
            "qualAverage": 48.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 13,
            "teamNumber": 1729,
            "sortOrder1": 1.25,
            "sortOrder2": 59,
            "sortOrder3": 20.5,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 59,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 14,
            "teamNumber": 125,
            "sortOrder1": 1.25,
            "sortOrder2": 56.75,
            "sortOrder3": 22.5,
            "sortOrder4": 11.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 56.75,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 15,
            "teamNumber": 1153,
            "sortOrder1": 1.25,
            "sortOrder2": 53.25,
            "sortOrder3": 23,
            "sortOrder4": 10.75,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 58.75,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 16,
            "teamNumber": 1058,
            "sortOrder1": 1.25,
            "sortOrder2": 49.5,
            "sortOrder3": 14.5,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 56.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 17,
            "teamNumber": 509,
            "sortOrder1": 1.25,
            "sortOrder2": 48.75,
            "sortOrder3": 17,
            "sortOrder4": 14,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 56.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 18,
            "teamNumber": 238,
            "sortOrder1": 1.25,
            "sortOrder2": 48,
            "sortOrder3": 15.5,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 55.5,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 19,
            "teamNumber": 501,
            "sortOrder1": 1,
            "sortOrder2": 42.75,
            "sortOrder3": 17,
            "sortOrder4": 5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 45.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 20,
            "teamNumber": 58,
            "sortOrder1": 1,
            "sortOrder2": 40.25,
            "sortOrder3": 14,
            "sortOrder4": 5.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 2,
            "ties": 0,
            "qualAverage": 40.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 21,
            "teamNumber": 2370,
            "sortOrder1": 0.75,
            "sortOrder2": 52,
            "sortOrder3": 17.5,
            "sortOrder4": 12,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 3,
            "ties": 0,
            "qualAverage": 54.5,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 22,
            "teamNumber": 1512,
            "sortOrder1": 0.75,
            "sortOrder2": 48.5,
            "sortOrder3": 14,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 3,
            "ties": 0,
            "qualAverage": 52.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 23,
            "teamNumber": 9997,
            "sortOrder1": 0.75,
            "sortOrder2": 45,
            "sortOrder3": 14.5,
            "sortOrder4": 10,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 3,
            "ties": 0,
            "qualAverage": 45,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 24,
            "teamNumber": 246,
            "sortOrder1": 0.75,
            "sortOrder2": 42.25,
            "sortOrder3": 17.5,
            "sortOrder4": 5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 3,
            "ties": 0,
            "qualAverage": 42.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 25,
            "teamNumber": 9998,
            "sortOrder1": 0.75,
            "sortOrder2": 40.75,
            "sortOrder3": 15,
            "sortOrder4": 14.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 3,
            "ties": 0,
            "qualAverage": 42,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 26,
            "teamNumber": 811,
            "sortOrder1": 0.5,
            "sortOrder2": 45.25,
            "sortOrder3": 20,
            "sortOrder4": 6.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 3,
            "ties": 0,
            "qualAverage": 45.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 27,
            "teamNumber": 9999,
            "sortOrder1": 0.5,
            "sortOrder2": 42.75,
            "sortOrder3": 19.5,
            "sortOrder4": 6,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 3,
            "ties": 0,
            "qualAverage": 48.25,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 28,
            "teamNumber": 172,
            "sortOrder1": 0.5,
            "sortOrder2": 40.75,
            "sortOrder3": 14,
            "sortOrder4": 9.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 3,
            "ties": 0,
            "qualAverage": 40.75,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 29,
            "teamNumber": 1721,
            "sortOrder1": 0.5,
            "sortOrder2": 30.5,
            "sortOrder3": 6.5,
            "sortOrder4": 4.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 3,
            "ties": 0,
            "qualAverage": 35.5,
            "dq": 0,
            "matchesPlayed": 4
        },
        {
            "rank": 30,
            "teamNumber": 9996,
            "sortOrder1": 0,
            "sortOrder2": 33.25,
            "sortOrder3": 10.5,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 4,
            "ties": 0,
            "qualAverage": 34.5,
            "dq": 0,
            "matchesPlayed": 4
        }
    ]
}

trainingRanks.partial = {
    "Rankings": [
        {
            "rank": 1,
            "teamNumber": 3467,
            "sortOrder1": 2.75,
            "sortOrder2": 80.75,
            "sortOrder3": 29,
            "sortOrder4": 21.75,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 0,
            "ties": 0,
            "qualAverage": 82,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 2,
            "teamNumber": 78,
            "sortOrder1": 2.75,
            "sortOrder2": 71.25,
            "sortOrder3": 33.5,
            "sortOrder4": 16,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 0,
            "ties": 0,
            "qualAverage": 72.5,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 3,
            "teamNumber": 1073,
            "sortOrder1": 2.25,
            "sortOrder2": 60.25,
            "sortOrder3": 31,
            "sortOrder4": 19.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 0,
            "ties": 0,
            "qualAverage": 61.5,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 4,
            "teamNumber": 157,
            "sortOrder1": 2,
            "sortOrder2": 60.5,
            "sortOrder3": 25.5,
            "sortOrder4": 10.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 0,
            "ties": 0,
            "qualAverage": 64.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 5,
            "teamNumber": 9995,
            "sortOrder1": 2,
            "sortOrder2": 56.75,
            "sortOrder3": 25.5,
            "sortOrder4": 5.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 0,
            "ties": 0,
            "qualAverage": 59.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 6,
            "teamNumber": 166,
            "sortOrder1": 2,
            "sortOrder2": 55,
            "sortOrder3": 28,
            "sortOrder4": 5.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 0,
            "ties": 0,
            "qualAverage": 55,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 7,
            "teamNumber": 4041,
            "sortOrder1": 1.75,
            "sortOrder2": 41.75,
            "sortOrder3": 17.5,
            "sortOrder4": 6.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 0,
            "ties": 0,
            "qualAverage": 49.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 8,
            "teamNumber": 4905,
            "sortOrder1": 1.5,
            "sortOrder2": 68,
            "sortOrder3": 28.5,
            "sortOrder4": 17.75,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 69.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 9,
            "teamNumber": 2423,
            "sortOrder1": 1.5,
            "sortOrder2": 63.75,
            "sortOrder3": 26,
            "sortOrder4": 19,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 65,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 10,
            "teamNumber": 1768,
            "sortOrder1": 1.5,
            "sortOrder2": 61.75,
            "sortOrder3": 26.5,
            "sortOrder4": 14.75,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 61.75,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 11,
            "teamNumber": 2342,
            "sortOrder1": 1.5,
            "sortOrder2": 50.25,
            "sortOrder3": 17.5,
            "sortOrder4": 6.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 0,
            "ties": 0,
            "qualAverage": 50.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 12,
            "teamNumber": 151,
            "sortOrder1": 1.5,
            "sortOrder2": 48.25,
            "sortOrder3": 17,
            "sortOrder4": 8,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 2,
            "losses": 0,
            "ties": 0,
            "qualAverage": 48.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 13,
            "teamNumber": 1729,
            "sortOrder1": 1.25,
            "sortOrder2": 59,
            "sortOrder3": 20.5,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 59,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 14,
            "teamNumber": 125,
            "sortOrder1": 1.25,
            "sortOrder2": 56.75,
            "sortOrder3": 22.5,
            "sortOrder4": 11.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 56.75,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 15,
            "teamNumber": 1153,
            "sortOrder1": 1.25,
            "sortOrder2": 53.25,
            "sortOrder3": 23,
            "sortOrder4": 10.75,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 58.75,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 16,
            "teamNumber": 1058,
            "sortOrder1": 1.25,
            "sortOrder2": 49.5,
            "sortOrder3": 14.5,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 56.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 17,
            "teamNumber": 509,
            "sortOrder1": 1.25,
            "sortOrder2": 48.75,
            "sortOrder3": 17,
            "sortOrder4": 14,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 56.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 18,
            "teamNumber": 238,
            "sortOrder1": 1.25,
            "sortOrder2": 48,
            "sortOrder3": 15.5,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 55.5,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 19,
            "teamNumber": 501,
            "sortOrder1": 1,
            "sortOrder2": 42.75,
            "sortOrder3": 17,
            "sortOrder4": 5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 45.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 20,
            "teamNumber": 58,
            "sortOrder1": 1,
            "sortOrder2": 40.25,
            "sortOrder3": 14,
            "sortOrder4": 5.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 1,
            "losses": 1,
            "ties": 0,
            "qualAverage": 40.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 21,
            "teamNumber": 2370,
            "sortOrder1": 0.75,
            "sortOrder2": 52,
            "sortOrder3": 17.5,
            "sortOrder4": 12,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 54.5,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 22,
            "teamNumber": 1512,
            "sortOrder1": 0.75,
            "sortOrder2": 48.5,
            "sortOrder3": 14,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 52.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 23,
            "teamNumber": 9997,
            "sortOrder1": 0.75,
            "sortOrder2": 45,
            "sortOrder3": 14.5,
            "sortOrder4": 10,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 45,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 24,
            "teamNumber": 246,
            "sortOrder1": 0.75,
            "sortOrder2": 42.25,
            "sortOrder3": 17.5,
            "sortOrder4": 5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 42.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 25,
            "teamNumber": 9998,
            "sortOrder1": 0.75,
            "sortOrder2": 40.75,
            "sortOrder3": 15,
            "sortOrder4": 14.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 42,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 26,
            "teamNumber": 811,
            "sortOrder1": 0.5,
            "sortOrder2": 45.25,
            "sortOrder3": 20,
            "sortOrder4": 6.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 45.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 27,
            "teamNumber": 9999,
            "sortOrder1": 0.5,
            "sortOrder2": 42.75,
            "sortOrder3": 19.5,
            "sortOrder4": 6,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 48.25,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 28,
            "teamNumber": 172,
            "sortOrder1": 0.5,
            "sortOrder2": 40.75,
            "sortOrder3": 14,
            "sortOrder4": 9.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 40.75,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 29,
            "teamNumber": 1721,
            "sortOrder1": 0.5,
            "sortOrder2": 30.5,
            "sortOrder3": 6.5,
            "sortOrder4": 4.5,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 35.5,
            "dq": 0,
            "matchesPlayed": 2
        },
        {
            "rank": 30,
            "teamNumber": 9996,
            "sortOrder1": 0,
            "sortOrder2": 33.25,
            "sortOrder3": 10.5,
            "sortOrder4": 8.25,
            "sortOrder5": 0,
            "sortOrder6": 0,
            "wins": 0,
            "losses": 2,
            "ties": 0,
            "qualAverage": 34.5,
            "dq": 0,
            "matchesPlayed": 2
        }
    ]
}

trainingAlliances.initial = {
    "Alliances": []
}
trainingAlliances.final = {
    "Alliances": [
        {
            "number": 1,
            "captain": 3467,
            "round1": 78,
            "round2": 246,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 1"
        },
        {
            "number": 2,
            "captain": 1073,
            "round1": 9995,
            "round2": 1729,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 2"
        },
        {
            "number": 3,
            "captain": 157,
            "round1": 2342,
            "round2": 509,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 3"
        },
        {
            "number": 4,
            "captain": 166,
            "round1": 125,
            "round2": 2370,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 4"
        },
        {
            "number": 5,
            "captain": 4041,
            "round1": 238,
            "round2": 9998,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 5"
        },
        {
            "number": 6,
            "captain": 4905,
            "round1": 2423,
            "round2": 811,
            "round3": 501,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 6"
        },
        {
            "number": 7,
            "captain": 1768,
            "round1": 1153,
            "round2": 58,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 7"
        },
        {
            "number": 8,
            "captain": 151,
            "round1": 1058,
            "round2": 1512,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 8"
        }
    ],
    "count": 8
}

trainingAlliances.partial = {
    "Alliances": [
        {
            "number": 1,
            "captain": 3467,
            "round1": 78,
            "round2": 246,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 1"
        },
        {
            "number": 2,
            "captain": 1073,
            "round1": 9995,
            "round2": 1729,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 2"
        },
        {
            "number": 3,
            "captain": 157,
            "round1": 2342,
            "round2": 509,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 3"
        },
        {
            "number": 4,
            "captain": 166,
            "round1": 125,
            "round2": 2370,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 4"
        },
        {
            "number": 5,
            "captain": 4041,
            "round1": 238,
            "round2": 9998,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 5"
        },
        {
            "number": 6,
            "captain": 4905,
            "round1": 2423,
            "round2": 811,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 6"
        },
        {
            "number": 7,
            "captain": 1768,
            "round1": 1153,
            "round2": 58,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 7"
        },
        {
            "number": 8,
            "captain": 151,
            "round1": 1058,
            "round2": 1512,
            "round3": null,
            "backup": null,
            "backupReplaced": null,
            "name": "Alliance 8"
        }
    ],
    "count": 8
}

trainingEvents.events = [{
    "allianceCount": "EightAlliance",
    "weekNumber": 0,
    "announcements": [],
    "code": "PRACTICE1",
    "divisionCode": null,
    "name": "Practice Event Phase 1",
    "type": "OffSeasonWithAzureSync",
    "districtCode": null,
    "venue": "Bishop Guerton High School",
    "city": "Nashua",
    "stateprov": "NH",
    "country": "USA",
    "dateStart": moment().format(),
    "dateEnd": moment().format(),
    "address": "194 Lund Rd",
    "website": "N/A",
    "webcasts": [
        "https://www.twitch.tv/firstinspires",
        "https://www.twitch.tv/firstinspires1"
    ],
    "timezone": "Eastern Standard Time"
}, {
    "allianceCount": "EightAlliance",
    "weekNumber": 0,
    "announcements": [],
    "code": "PRACTICE2",
    "divisionCode": null,
    "name": "Practice Event Phase 2",
    "type": "OffSeasonWithAzureSync",
    "districtCode": null,
    "venue": "Bishop Guerton High School",
    "city": "Nashua",
    "stateprov": "NH",
    "country": "USA",
    "dateStart": moment().format(),
    "dateEnd": moment().format(),
    "address": "194 Lund Rd",
    "website": "N/A",
    "webcasts": [
        "https://www.twitch.tv/firstinspires",
        "https://www.twitch.tv/firstinspires1"
    ],
    "timezone": "Eastern Standard Time"
}, {
    "allianceCount": "EightAlliance",
    "weekNumber": 0,
    "announcements": [],
    "code": "PRACTICE3",
    "divisionCode": null,
    "name": "Practice Event Phase 3",
    "type": "OffSeasonWithAzureSync",
    "districtCode": null,
    "venue": "Bishop Guerton High School",
    "city": "Nashua",
    "stateprov": "NH",
    "country": "USA",
    "dateStart": moment().format(),
    "dateEnd": moment().format(),
    "address": "194 Lund Rd",
    "website": "N/A",
    "webcasts": [
        "https://www.twitch.tv/firstinspires",
        "https://www.twitch.tv/firstinspires1"
    ],
    "timezone": "Eastern Standard Time"
}, {
    "allianceCount": "EightAlliance",
    "weekNumber": 0,
    "announcements": [],
    "code": "PRACTICE4",
    "divisionCode": null,
    "name": "Practice Event Phase 4",
    "type": "OffSeasonWithAzureSync",
    "districtCode": null,
    "venue": "Bishop Guerton High School",
    "city": "Nashua",
    "stateprov": "NH",
    "country": "USA",
    "dateStart": moment().format(),
    "dateEnd": moment().format(),
    "address": "194 Lund Rd",
    "website": "N/A",
    "webcasts": [
        "https://www.twitch.tv/firstinspires",
        "https://www.twitch.tv/firstinspires1"
    ],
    "timezone": "Eastern Standard Time"
}, {
    "allianceCount": "EightAlliance",
    "weekNumber": 0,
    "announcements": [],
    "code": "OFFLINE",
    "divisionCode": null,
    "name": "OFFLINE",
    "type": "OffSeasonWithAzureSync",
    "districtCode": null,
    "venue": "OFFLINE",
    "city": "City",
    "stateprov": "State",
    "country": "Country",
    "dateStart": moment().format(),
    "dateEnd": moment().format(),
    "address": "Street",
    "website": "N/A",
    "webcasts": [
        "https://www.twitch.tv/firstinspires",
        "https://www.twitch.tv/firstinspires1"
    ],
    "timezone": "Eastern Standard Time"
}]

export const trainingData = {
    "events": trainingEvents,
    "alliances": trainingAlliances,
    "ranks": trainingRanks,
    "teams": trainingTeams,
    "schedule": trainingSchedule,
    "scores": trainingScores
}