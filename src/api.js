/**
 * 구글 시트 연동 API 모듈 (최종 연동 완료)
 * 사용자가 배포한 실제 GAS 웹앱 주소가 적용되었습니다.
 */
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz17q_mmArJUg748CR-U4CDMELqCMOtHkwQOiQMux99tqjBJ9dFX1seH8-0gt-qLEaPgw/exec";

export const fetchSheetData = async () => {
    try {
        const response = await fetch(GAS_WEBAPP_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
    } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        return null;
    }
};

export const updateSheetData = async (rowId, updates) => {
    try {
        // GAS doPost는 리다이렉션을 사용하므로 fetch 시 redirect 설정을 추가하거나
        // 간단한 연동을 위해 text/plain으로 전송하는 기법을 사용하기도 합니다.
        const response = await fetch(GAS_WEBAPP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: rowId, updates })
        });
        // no-cors 모드에서는 응답 상세를 볼 수 없으므로 성공으로 간주하고 처리합니다.
        return true;
    } catch (error) {
        console.error("데이터 저장 중 오류 발생:", error);
        return false;
    }
};
