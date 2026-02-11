/**
 * 구글 시트 실시간 연동을 위한 Apps Script 코드 (변수 충돌 방지 최종판)
 * 사용법: 이 코드를 시트의 Apps Script에 붙여넣고 [배포] 하세요.
 */

// 고유한 변수명 사용 (다른 파일의 SHEET_NAME 등과 충돌 방지)
var TR_SS_ID = "1fGEYkgJkgeNmGYUXVz9h2dL8QOvCBFt6qEI0YB_Ik_4";
var TR_SHEET_NAME = "시운전 정보 관리";

function doGet(e) {
    var ss = SpreadsheetApp.openById(TR_SS_ID);
    var sheet = ss.getSheetByName(TR_SHEET_NAME) || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();

    var rawHeaders = data[2]; // 3행
    var rows = data.slice(3); // 4행부터

    var keyMap = {
        "상태상": "status",
        "No.": "no",
        "업체명": "company",
        "산업군": "industry",
        "시운전 날짜": "commissioningDate",
        "시운전날짜": "commissioningDate",
        "담당자명": "manager",
        "모델": "model",
        "S/N": "sn",
        "워킹 용량": "capacity",
        "워킹용량": "capacity",
        "원료": "material",
        "점도": "viscosity",
        "RPM": "rpm",
        "KW": "kw",
        "Hz": "hz",
        "A": "a",
        "dB (정격)": "db",
        "dB(정격)": "db",
        "등록일시": "timestamp"
    };

    var result = rows.map(function (row, index) {
        var obj = { id: index + 4 };
        rawHeaders.forEach(function (header, i) {
            var trimmedHeader = String(header || "").trim();
            if (!trimmedHeader) return;
            var key = keyMap[trimmedHeader] || trimmedHeader;
            obj[key] = row[i];
        });
        return obj;
    });

    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        var params = JSON.parse(e.postData.contents);
        var ss = SpreadsheetApp.openById(TR_SS_ID);
        var sheet = ss.getSheetByName(TR_SHEET_NAME) || ss.getSheets()[0];
        var rawHeaders = sheet.getDataRange().getValues()[2];

        var rowId = params.id;
        var updates = params.updates;

        var keyMapReverse = {
            "status": "상태상", "no": "No.", "company": "업체명", "industry": "산업군",
            "commissioningDate": "시운전 날짜", "manager": "담당자명", "model": "모델",
            "sn": "S/N", "capacity": "워킹 용량", "material": "원료", "viscosity": "점도",
            "rpm": "RPM", "kw": "KW", "hz": "Hz", "a": "A", "db": "dB (정격)", "timestamp": "등록일시"
        };

        rawHeaders.forEach(function (header, i) {
            var trimmedHeader = String(header || "").trim();
            for (var key in keyMapReverse) {
                var korHeader = keyMapReverse[key];
                if ((trimmedHeader === korHeader || trimmedHeader === korHeader.replace(/\s/g, "")) && updates[key] !== undefined) {
                    sheet.getRange(rowId, i + 1).setValue(updates[key]);
                }
            }
        });

        return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    } catch (f) {
        return ContentService.createTextOutput("Error: " + f.message).setMimeType(ContentService.MimeType.TEXT);
    }
}
