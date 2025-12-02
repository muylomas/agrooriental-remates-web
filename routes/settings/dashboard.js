const express = require('express');
const router = express.Router();
const connection = require('../connection_db');
const common_auth = require('../common_auth');
const common_gral = require('../common_gral');
const formidable = require('formidable');
const sha512 = require('js-sha512');

const indexParams = {
    adminUserId: 0,
    userNameSurname: "",
    userImage: "",
    userType: 2,
    countries: {
        "1": "Uruguay",
        "2": "Argentina"
    },
    superAdmin: [1, 2, 3, 7, 9, 10, 68],
    error: {
        type: "",
        msj: ""
    }
};

function getUserData(userId, callback) {
    connection.query(
        `
            SELECT 
                users.name AS name, 
                users.surname AS surname, 
                users.picture AS image, 
                DATE_FORMAT(users.birthday, '%Y-%m-%d') AS birthday, 
                users.type AS type, 
                users.sector AS sector, 
                users.color AS color, 
                users.ink AS ink, 
                users.department AS department, 
                users_phone.country AS phoneCountry, 
                users_phone.number AS phoneNumber, 
                users_phone.intern AS phoneIntern, 
                phone_fax.country AS faxCountry, 
                phone_fax.number AS faxNumber, 
                phone_fax.intern AS faxIntern, 
                phone_cell.country AS cellCountry, 
                phone_cell.number AS cellNumber, 
                phone_cell.intern AS cellIntern 
            FROM users 
            LEFT JOIN users_phone ON users_phone.userId = users.id AND users_phone.status = 1 AND users_phone.type = 1 
            LEFT JOIN users_phone AS phone_fax ON phone_fax.userId = users.id AND phone_fax.status = 1 AND phone_fax.type = 2 
            LEFT JOIN users_phone AS phone_cell ON phone_cell.userId = users.id AND phone_cell.status = 1 AND phone_cell.type = 3 
            WHERE users.id = ?
        `,
        [
            userId,
        ],
        function (err, results) {
            if (err) {
                callback({});
            }
            else {
                if (results.length) {
                    if (!results[0].phoneNumber) {
                        results[0].phoneCountry = "1";
                        results[0].phoneNumber = "2604 8522";
                        results[0].phoneIntern = "";
                    }
                    if (!results[0].faxNumber) {
                        results[0].faxCountry = "1";
                        results[0].faxNumber = "2604 8439";
                        results[0].faxIntern = "";
                    }

                    callback(results[0]);
                }
                else
                    callback({});
            }
        }
    );
};

var getDepartments = function (callback) {
    var sqlQuery =
        "SELECT * FROM users_dep";

    connection.query(sqlQuery, function (err, results) {
        if (err) {
            callback([]);
        }
        else {
            callback(results);
        }
    });
};

function getPersonalEvents(userId, callback) {

    connection.query(
        `
            SELECT 
                events.id as id, 
                events.type as type, 
                events.description as description, 
                DATE_FORMAT(events.start, '%Y-%m-%dT%H:%i') AS start, 
                DATE_FORMAT(events.end, '%Y-%m-%dT%H:%i') AS end, 
                DATE_FORMAT(events.start, '%d/%m/%Y %H:%i') AS startText, 
                DATE_FORMAT(events.end, '%d/%m/%Y %H:%i') AS endText, 
                IF(events.end > NOW() - INTERVAL 1 WEEK, 1, 0) AS edit 
            FROM events 
            WHERE 
                events.userId = ? AND 
                events.status = 1 AND
                events.start > NOW() - INTERVAL 1 YEAR
            ORDER BY events.end DESC
        `, [userId], function (err, results) {
        if (err) {
            callback([]);
        }
        else {
            callback(results);
        }
    });
};

var getPersonalEventsNames = function (callback) {
    var sqlQuery =
        "SELECT * " +
        "FROM events_type " +
        "ORDER BY id ASC ";

    connection.query(sqlQuery, function (err, results) {
        if (err) {
            callback([]);
        }
        else {
            callback(results);
        }
    });
};

function updateProfile(fields, imageFileName, callback) {
    var sqlUpdateQuery = [
        "name = ? ",
        "surname = ? ",
        "birthday = ? ",
        "department = ? ",
    ];

    var __aux_params = [
        fields.userName,
        fields.userSurname,
        fields.userBirthday,
        fields.userDepartment,
    ];

    if (imageFileName) {
        sqlUpdateQuery.push("picture = ? ");
        __aux_params.push("https://rewo.s3.amazonaws.com/backoffice/images/faces/" + imageFileName)
    }

    if ("userColor" in fields && fields.userColor) {
        sqlUpdateQuery.push("color = ? ");
        __aux_params.push(fields.userColor.replace(/\#/g, ''));
    }

    if ("userInk" in fields && fields.userInk) {
        sqlUpdateQuery.push("ink = ? ");
        __aux_params.push(fields.userInk.replace(/\#/g, ''));
    }

    __aux_params.push(fields.userId);

    connection.query(
        "UPDATE users SET " +
        sqlUpdateQuery.join(", ") +
        "WHERE id = ?",
        __aux_params,
        function () {
            callback();
        });
};

function insertPhones(fields, callback) {
    connection.query(
        "UPDATE users_phone SET status = 0 WHERE userId = " + fields.userId,
        function () {
            var __aux_insertValues = [];
            if ("userphone_number" && fields && fields.userphone_number) {
                __aux_insertValues.push(
                    "('" + fields.userId + "', 1,'" + fields.userphone_country + "','" + fields.userphone_number + "','" + fields.userphone_intern + "', 1, NOW())"
                );
            }

            if ("userfax_number" && fields && fields.userfax_number) {
                __aux_insertValues.push(
                    "('" + fields.userId + "', 2,'" + fields.userfax_country + "','" + fields.userfax_number + "','" + fields.userfax_intern + "', 1, NOW())"
                );
            }

            if ("usercell_number" && fields && fields.usercell_number) {
                __aux_insertValues.push(
                    "('" + fields.userId + "', 3,'" + fields.usercell_country + "','" + fields.usercell_number + "','" + fields.usercell_intern + "', 1, NOW())"
                );
            }
            connection.query(
                "INSERT INTO `users_phone` (`userId`, `type`, `country`, `number`, `intern`, `status`, `date`) VALUES " +
                __aux_insertValues.join(),
                function () {
                    callback();
                });
        });
};

function basicProcedure(req, res) {
    common_auth.basic(req.sessionID, function (reply) {
        if (reply.err) {
            res.redirect('/login');
        }
        else {
            let viewParams = common_gral.duplicateObject(indexParams);
            viewParams.userNameSurname = reply.user.name;
            viewParams.userImage = reply.user.image;
            viewParams.userType = reply.user.type;
            viewParams.userId = reply.user.id;

            let __aux_userId = viewParams.userId;

            getUserData(
                __aux_userId,
                function (data) {
                    if (data.name) {
                        viewParams.user = data;
                        getDepartments(function (departments) {
                            viewParams.departments = departments;
                            getPersonalEvents(
                                __aux_userId,
                                function (events) {
                                    viewParams.events = events;
                                    getPersonalEventsNames(function (eventsName) {
                                        viewParams.eventsName = eventsName;
                                        common_gral.getRewoUsers(viewParams, function (returnIndexParams) {
                                            viewParams = returnIndexParams;
                                            common_gral.renderSavingSession(req, res, 'settings/dashboard', viewParams);
                                        });
                                    });
                                }
                            );
                        });
                    }
                    else {
                        common_gral.redirectSavingSession(req, res, '/');
                    }
                }
            );
        }
    });
};

router.get('/', function (req, res, next) {
    basicProcedure(req, res);
});

router.post('/update', function (req, res, next) {
    common_auth.basic(req.sessionID, function (reply) {
        if (reply.err) {
            res.redirect('/login');
        }
        else {
            let viewParams = common_gral.duplicateObject(indexParams);
            viewParams.userNameSurname = reply.user.name;
            viewParams.userImage = reply.user.image;
            viewParams.userType = reply.user.type;
            viewParams.userId = reply.user.id;

            var form = new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
                if ("imagetoupload" in files && "path" in files.imagetoupload &&
                    "fileName" in fields &&
                    "fileType" in fields &&
                    "userName" in fields && fields.userName &&
                    "userSurname" in fields && fields.userSurname &&
                    "userDepartment" in fields && fields.userDepartment &&
                    "userBirthday" in fields && fields.userBirthday &&
                    "userId" in fields && fields.userId &&
                    (
                        ("userphone_number" in fields && fields.userphone_number) ||
                        ("userfax_number" in fields && fields.userfax_number) ||
                        ("usercell_number" in fields && fields.usercell_number)
                    )
                ) {
                    if (files.imagetoupload.path && fields.fileName &&
                        ["1", "2", "3", "4", "5"].includes(fields.fileType)) {
                        common_gral.uploadFile(files.imagetoupload.path, "backoffice/images/faces/", fields, function (fileName) {
                            updateProfile(fields, fileName, function () {
                                insertPhones(fields, function () {
                                    common_gral.redirectSavingSession(req, res, '/settings');
                                });
                            });
                        });
                    }
                    else {
                        updateProfile(fields, "", function () {
                            insertPhones(fields, function () {
                                common_gral.redirectSavingSession(req, res, '/settings');
                            });
                        });
                    }
                }
                else {
                    common_gral.redirectSavingSession(req, res, '/settings');
                }
            });
        }
    });
});

router.post('/create', function (req, res, next) {
    common_auth.basic(req.sessionID, function (reply) {
        if (reply.err) {
            res.redirect('/login');
        }
        else {
            let viewParams = common_gral.duplicateObject(indexParams);
            viewParams.userNameSurname = reply.user.name;
            viewParams.userImage = reply.user.image;
            viewParams.userType = reply.user.type;
            viewParams.userId = reply.user.id;

            if (viewParams.superAdmin.includes(viewParams.userId)) {

                var form = new formidable.IncomingForm();
                form.parse(req, function (err, fields, files) {
                    if ("userName" in fields && fields.userName &&
                        "userSurname" in fields && fields.userSurname &&
                        "userBirthday" in fields && fields.userBirthday &&
                        "userEmail" in fields && fields.userEmail &&
                        "userId" in fields && fields.userId
                    ) {

                        var sqlQuery =
                            "INSERT INTO users SET " +
                            "email = ?," +
                            "name = ?, " +
                            "surname = ?, " +
                            "birthday = ?, " +
                            "username = ?, " +
                            "userId = ?, " +
                            "resetDate = NOW(), " +
                            "picture = 'https://agro-oriental-remates.s3.us-west-1.amazonaws.com/web/images/logos/agrooriental-insta-logo.jpg', " +
                            "date = NOW() ";

                        connection.query(sqlQuery,
                            [
                                fields.userEmail,
                                fields.userName,
                                fields.userSurname,
                                fields.userBirthday,
                                fields.userEmail.split("@")[0],
                                fields.userId,
                            ],
                            function (err, resultReq) {
                                if (err) {
                                    console.log(err);
                                    common_gral.redirectSavingSession(req, res, '/settings');
                                }
                                else {
                                    if (resultReq.insertId) {
                                        fields.userId = resultReq.insertId;
                                        updateProfile(fields, "", function () {
                                            insertPhones(fields, function () {
                                                updatePasswordAndNotify(fields.userName, fields.userEmail, resultReq.insertId, true,
                                                    function () {
                                                        common_gral.redirectSavingSession(req, res, '/settings');
                                                    });
                                            });
                                        });
                                    }
                                    else {
                                        common_gral.redirectSavingSession(req, res, '/settings');
                                    }
                                }
                            });


                    }
                    else {
                        common_gral.redirectSavingSession(req, res, '/settings');
                    }
                });
            }
            else {

            }
        }
    });
});

router.post('/event/new', function (req, res, next) {

    common_auth.basic(req.sessionID, function (reply) {
        if (reply.err) {
            res.redirect('/login');
        }
        else {
            let viewParams = common_gral.duplicateObject(indexParams);
            viewParams.userNameSurname = reply.user.name;
            viewParams.userImage = reply.user.image;
            viewParams.userType = reply.user.type;
            viewParams.userId = reply.user.id;

            if ("body" in req) {
                if ("rewouser" in req.body && req.body.rewouser &&
                    "eventtype" in req.body && req.body.eventtype &&
                    "startDay" in req.body && req.body.startDay &&
                    "startDayHour" in req.body && req.body.startDayHour &&
                    "startDayMinutes" in req.body && req.body.startDayMinutes &&
                    "endDay" in req.body && req.body.endDay &&
                    "endDayHour" in req.body && req.body.endDayHour &&
                    "endDayMinutes" in req.body && req.body.endDayMinutes) {
                    var insertReqQuery =
                        "INSERT INTO events SET " +
                        "userId = ?, " +
                        "userId_admin = ?, " +
                        "type = ?, " +
                        "start = ?, " +
                        "end = ?, " +
                        "status = 1, " +
                        "date = NOW()";
                    connection.query(insertReqQuery, [
                        req.body.rewouser,
                        viewParams.userId,
                        req.body.eventtype,
                        req.body.startDay + "T" + req.body.startDayHour + ":" + req.body.startDayMinutes,
                        req.body.endDay + "T" + req.body.endDayHour + ":" + req.body.endDayMinutes,
                    ], function (err, resultReq) {
                        common_gral.redirectSavingSession(req, res, '/settings');
                    });
                }
                else
                    common_gral.redirectSavingSession(req, res, '/settings');
            }
            else
                common_gral.redirectSavingSession(req, res, '/settings');
        }
    });
});

router.post('/event/update', function (req, res, next) {
    common_auth.basic(req.sessionID, function (reply) {
        if (reply.err) {
            res.redirect('/login');
        }
        else {
            let viewParams = common_gral.duplicateObject(indexParams);
            viewParams.userNameSurname = reply.user.name;
            viewParams.userImage = reply.user.image;
            viewParams.userType = reply.user.type;
            viewParams.userId = reply.user.id;

            if ("body" in req) {
                if ("eventId" in req.body && req.body.eventId &&
                    "startDay" in req.body && req.body.startDay &&
                    "endDay" in req.body && req.body.endDay) {
                    var sqlQuery =
                        "UPDATE events SET " +
                        "start = ?, " +
                        "end = ? " +
                        "WHERE id = ?";

                    connection.query(sqlQuery,
                        [
                            req.body.startDay,
                            req.body.endDay,
                            req.body.eventId
                        ],
                        function (err, results) {
                            common_gral.redirectSavingSession(req, res, '/settings');
                        });
                }
                else
                    common_gral.redirectSavingSession(req, res, '/settings');
            }
        }
    });
});

router.post('/event/remove', function (req, res, next) {
    common_auth.basic(req.sessionID, function (reply) {
        if (reply.err) {
            res.redirect('/login');
        }
        else {
            let viewParams = common_gral.duplicateObject(indexParams);
            viewParams.userNameSurname = reply.user.name;
            viewParams.userImage = reply.user.image;
            viewParams.userType = reply.user.type;
            viewParams.userId = reply.user.id;

            if ("body" in req) {
                if ("eventId" in req.body && req.body.eventId) {
                    var sqlQuery =
                        "UPDATE events SET " +
                        "status = 0 " +
                        "WHERE id = ?";

                    connection.query(sqlQuery, [req.body.eventId], function (err, results) {
                        common_gral.redirectSavingSession(req, res, '/settings');
                    });
                }
                else
                    common_gral.redirectSavingSession(req, res, '/settings');
            }
        }
    });
});

function updatePasswordAndNotify(userName, email, rewoUserId, notify, callback) {
    __aux_user_name = userName;
    var __aux_user_email = email;
    var newPassword = common_gral.randomString(8).toUpperCase();
    var newPasswordHash = sha512("admin" + email + newPassword);

    var __aux_birthday = ""
    if (!notify) {
        __aux_birthday = "birthday = NULL, "
    }

    var updateReqQuery =
        "UPDATE users SET " +
        "password = ?," +
        "session = '', " +
        "resetDate = NOW(), " +
        "resetPassword = 1, " +
        __aux_birthday +
        "date = NOW() " +
        "WHERE " +
        "id = ?";

    connection.query(updateReqQuery,
        [
            newPasswordHash,
            rewoUserId
        ],
        function (err, resulUpdate) {

            if (err) {
                callback();
            }
            else {
                if (notify) {
                    var __aux_email_content =
                        __aux_user_name + ",<br><br>" +
                        "Se reseteó tu contraseña  del sistema de Gestión de REWO.<br><br>" +
                        "La nueva contraseña es: " + newPassword + "<br><br>" +
                        "Ingresá a <a href='/'>agrooriental.com.uy</a> y actualizá tu contraseña.<br>" +
                        "<br><br>" +
                        "El equipo de REWO";

                    common_gral.sendPlainTextEmail(
                        [__aux_user_email,],
                        '"Agro Oriental" <noreply@agrooriental.com.uy.uy>',
                        "Reseteo de contraseña",
                        __aux_email_content,
                        function (err, result) {
                            if (err) {
                                callback();
                            }
                            else {
                                callback();
                            }
                        });
                }
                else {
                    callback();
                }
            }
        });
};

router.post('/password/reset', function (req, res, next) {

    common_auth.basic(req.sessionID, function (reply) {
        if (reply.err) {
            res.redirect('/login');
        }
        else {
            let viewParams = common_gral.duplicateObject(indexParams);
            viewParams.userNameSurname = reply.user.name;
            viewParams.userImage = reply.user.image;
            viewParams.userType = reply.user.type;
            viewParams.userId = reply.user.id;

            if ("body" in req && viewParams.superAdmin.includes(viewParams.userId)) {
                if ("rewoUserId" in req.body && req.body.rewoUserId) {
                    var sqlQuery =
                        "SELECT * " +
                        "FROM users " +
                        "WHERE id = ? ";

                    connection.query(sqlQuery, [req.body.rewoUserId], function (err, userResults) {
                        if (err) {
                            common_gral.redirectSavingSession(req, res, '/settings');
                        }
                        else {
                            var __aux_notify = false;
                            if ("notify" in req.body && req.body.notify) {
                                __aux_notify = req.body.notify;
                            }
                            updatePasswordAndNotify(
                                userResults[0].name, userResults[0].email, req.body.rewoUserId, __aux_notify,
                                function () {
                                    common_gral.redirectSavingSession(req, res, '/settings');
                                });
                        }
                    });
                }
                else
                    common_gral.redirectSavingSession(req, res, '/settings');
            }
            else
                common_gral.redirectSavingSession(req, res, '/settings');
        }
    });
});

module.exports = router;